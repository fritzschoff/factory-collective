import { readFileSync } from 'node:fs';
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { expandVariants, shopProductFromCode, skuFor, type ReservationItem, type ShopProduct } from '@cfc/shop-core';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { rateLimit } from './http';
import { availabilityFor, bookFromSession, orderBySession, quote, releaseReservation, releaseStale, reserve, saveEnquiry, saveNewsletter } from './logic';

const projectId = 'demo-cfc';
let db: Firestore;
let rules: RulesTestEnvironment;

function jacket(onHand: number | null = 1): ShopProduct {
  const options = [
    { id: 'colour', label: 'Colour', role: 'variant' as const, type: 'swatch' as const, values: [{ id: 'white', label: 'White' }] },
    { id: 'size', label: 'Size', role: 'variant' as const, type: 'size' as const, values: [{ id: '50', label: '50' }] },
  ];
  return {
    id: 'JK-001', kind: 'fashion', group: 'jackets', code: 'JK / 001', slug: 'jk-001', name: 'jacket, white',
    material: 'Cotton', description: 'A jacket.', spec: [], accordions: [], note: '', lead: '5 days', inv: '///',
    images: [], priceCents: 52000, options, variants: expandVariants(options), status: 'active', href: '/atelier/fashion/jk-001/',
  };
}

async function clear(name: string): Promise<void> {
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach((row) => batch.delete(row.ref));
  if (snap.size) await batch.commit();
}

async function stock(product: ShopProduct, onHand: number | null, reserved = 0): Promise<void> {
  await db.collection('products').doc(product.id).set(product);
  for (const variant of product.variants) {
    const sku = skuFor(product.id, variant.key);
    await db.collection('inventory').doc(sku).set({ sku, productId: product.id, onHand, reserved });
  }
}

beforeAll(async () => {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
  if (!getApps().length) initializeApp({ projectId });
  db = getFirestore();
  rules = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync(new URL('../../storage.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 9199 },
  });
});

beforeEach(async () => {
  for (const name of ['products', 'inventory', 'reservations', 'orders', 'counters', 'enquiries', 'newsletter', 'ratelimits']) await clear(name);
});

afterAll(async () => {
  await rules.cleanup();
});

describe('rules', () => {
  it('refuses a client read of the catalogue', async () => {
    const client = rules.unauthenticatedContext();
    await assertFails(getDoc(doc(client.firestore(), 'products/JK-001')));
  });
});

describe('shop', () => {
  it('reserves the last piece once when two checkouts race', async () => {
    const product = jacket();
    await stock(product, 1);
    const item = { id: 'JK-001', qty: 1, opts: { colour: 'white', size: '50' } };
    const quoted = quote(new Map([[product.id, product]]), [item]);
    expect(quoted.rejected).toEqual([]);
    const [first, second] = await Promise.allSettled([reserve(db, quoted.lines), reserve(db, quoted.lines)]);
    const ok = [first, second].filter((result) => result.status === 'fulfilled');
    const denied = [first, second].filter((result) => result.status === 'rejected');
    expect(ok).toHaveLength(1);
    expect(denied).toHaveLength(1);
    const row = await db.collection('inventory').doc(quoted.lines[0].sku).get();
    expect(row.get('reserved')).toBe(1);
  });

  it('books a payment once, flags a shortfall after release, and ignores a second webhook', async () => {
    const product = jacket();
    await stock(product, 1);
    const quoted = quote(new Map([[product.id, product]]), [{ id: 'JK-001', qty: 1, opts: { colour: 'white', size: '50' } }]);
    const id = await reserve(db, quoted.lines);
    await db.collection('reservations').doc(id).update({ stripeSessionId: 'cs_test_1' });
    const session = { id: 'cs_test_1', payment_status: 'paid', customer_details: { email: 'a@b.de', name: 'A' }, amount_total: 52000, currency: 'eur' };
    const sent: string[] = [];
    await bookFromSession(db, session, 'paid', async (mail) => { sent.push(mail.subject); });
    await bookFromSession(db, session, 'paid', async (mail) => { sent.push(mail.subject); });
    const row = await db.collection('inventory').doc(quoted.lines[0].sku).get();
    expect(row.get('onHand')).toBe(0);
    expect(row.get('reserved')).toBe(0);
    expect(sent).toEqual(['Order 1']);
    const order = await orderBySession(db, 'cs_test_1');
    expect(order?.number).toBe(1);
    expect(order?.items[0].code).toBe('JK / 001');
  });

  it('still books a payment that arrives after the hold was released', async () => {
    const product = jacket();
    await stock(product, 0);
    const line: ReservationItem = { sku: 'JK-001__white.50', productId: 'JK-001', qty: 1, unitAmount: 52000, name: 'jacket, white', code: 'JK / 001', options: [] };
    await db.collection('reservations').doc('old').set({ items: [line], status: 'released', expiresAt: new Date().toISOString(), stripeSessionId: 'cs_late', booked: false });
    await bookFromSession(db, { id: 'cs_late', payment_status: 'paid' }, 'paid');
    const row = await db.collection('inventory').doc(line.sku).get();
    expect(row.get('onHand')).toBe(-1);
    const order = await orderBySession(db, 'cs_late');
    expect(order?.status).toBe('paid');
    const stored = await db.collection('orders').where('stripeSessionId', '==', 'cs_late').get();
    expect(stored.docs[0].get('shortfall')).toBe(true);
  });

  it('releases a pending hold that is an hour past expiry and leaves a payment that is still pending', async () => {
    const product = jacket();
    await stock(product, 2);
    const line: ReservationItem = { sku: 'JK-001__white.50', productId: 'JK-001', qty: 1, unitAmount: 52000, name: 'jacket, white', code: 'JK / 001', options: [] };
    const past = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    await db.collection('reservations').doc('stale').set({ items: [line], status: 'pending', expiresAt: past, booked: false });
    await db.collection('reservations').doc('wait').set({ items: [line], status: 'awaiting_payment', expiresAt: past, booked: false });
    await db.collection('inventory').doc(line.sku).update({ reserved: 2 });
    expect(await releaseStale(db)).toBe(1);
    expect((await db.collection('reservations').doc('stale').get()).get('status')).toBe('released');
    expect((await db.collection('reservations').doc('wait').get()).get('status')).toBe('awaiting_payment');
    expect((await db.collection('inventory').doc(line.sku).get()).get('reserved')).toBe(1);
  });

  it('stores a form once, drops a honeypot, and limits the sixth try', async () => {
    const sent: string[] = [];
    const mail = async (message: { subject: string }) => { sent.push(message.subject); };
    await saveEnquiry(db, { name: 'A', email: 'a@b.de', message: 'Hello', subject: 'general', work: '', company: '' }, '11111111-1111-4111-8111-111111111111', mail);
    await saveEnquiry(db, { name: 'A', email: 'a@b.de', message: 'Hello', subject: 'general', work: '', company: '' }, '11111111-1111-4111-8111-111111111111', mail);
    await saveEnquiry(db, { name: 'Bot', email: 'b@b.de', message: '', subject: 'general', work: '', company: 'acme' }, '', mail);
    expect((await db.collection('enquiries').get()).size).toBe(2);
    expect((await db.collection('enquiries').where('spam', '==', true).get()).size).toBe(1);
    expect(sent).toEqual(['Enquiry from A']);
    await saveNewsletter(db, { email: 'a@b.de', company: '' }, '22222222-2222-4222-8222-222222222222', mail);
    for (let n = 0; n < 6; n += 1) expect(await rateLimit(db, '127.0.0.1', 'form', 6, 1_000)).toBe(true);
    expect(await rateLimit(db, '127.0.0.1', 'form', 6, 1_000)).toBe(false);
  });

  it('refuses a piece without a price and reports what is left', async () => {
    const product = jacket();
    product.priceCents = null;
    const quoted = quote(new Map([[product.id, product]]), [{ id: 'JK-001', qty: 2, opts: { colour: 'white', size: '50' } }]);
    expect(quoted.error).toBe('This piece has no price yet.');
    await stock(jacket(), 1);
    const priced = quote(new Map([['JK-001', jacket()]]), [{ id: 'JK-001', qty: 2, opts: { colour: 'white', size: '50' } }]);
    await expect(reserve(db, priced.lines)).rejects.toThrow(/Only 1 left/);
    const avail = await availabilityFor(db, ['JK-001']);
    expect(avail['JK-001__white.50'].available).toBe(1);
  });

  it('frees a pending reservation', async () => {
    const product = jacket();
    await stock(product, null);
    const quoted = quote(new Map([[product.id, product]]), [{ id: 'JK-001', qty: 1, opts: { colour: 'white', size: '50' } }]);
    const id = await reserve(db, quoted.lines);
    await releaseReservation(db, id);
    expect((await db.collection('reservations').doc(id).get()).get('status')).toBe('released');
    expect((await db.collection('inventory').doc(quoted.lines[0].sku).get()).get('reserved')).toBe(0);
  });
});

describe('seed shape', () => {
  it('keeps a code product id that contains a dot', () => {
    const shop = shopProductFromCode({
      id: 'CI-07.P', code: 'CI / 07.p', slug: 'ci-07-p', kind: 'print', group: 'prints', name: 'poster print', material: 'Print',
      description: 'A print.', images: [], options: [], spec: [], accordions: [], note: '', inv: '///', href: '/studio/', lead: '3 weeks',
      work: { id: 'CI-07', edition: 'poster' },
    }, 4500, []);
    expect(shop.id).toBe('CI-07.P');
    expect(shop.variants).toEqual([{ key: '', priceCents: null, values: {} }]);
  });
});
