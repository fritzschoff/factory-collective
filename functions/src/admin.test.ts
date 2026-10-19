import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { expandVariants, type ProductSave } from '@cfc/shop-core';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createUpload, registerImage } from './images-admin';
import { saveProduct, setOnHand } from './products-admin';
import { listOrders, updateOrder } from './desk-admin';

let db: Firestore;

function draft(over: Partial<ProductSave> = {}): ProductSave {
  const options = [{ id: 'size', label: 'Size', role: 'variant' as const, type: 'size' as const, values: [{ id: '50', label: '50' }] }];
  return {
    id: 'JK-900', kind: 'fashion', group: 'jackets', code: 'JK / 900', slug: 'jk-900', name: 'probe', material: 'Cotton',
    sub: '', description: 'A jacket.', spec: [['Cloth', 'Cotton']], accordions: [], note: '', lead: '5 days', dims: '', inv: '///', tag: '',
    priceCents: 52000, options, status: 'draft', href: '/atelier/fashion/jk-900/', images: [], variantPrices: { '50': 54000 }, stock: { 'JK-900__50': 3 },
    ...over,
  };
}

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
  if (!getApps().length) initializeApp({ projectId: 'demo-cfc' });
  db = getFirestore();
});

beforeEach(async () => {
  for (const name of ['products', 'inventory', 'orders']) {
    const snap = await db.collection(name).get();
    const batch = db.batch();
    snap.docs.forEach((row) => batch.delete(row.ref));
    if (snap.size) await batch.commit();
  }
});

describe('admin products', () => {
  it('saves a draft, keeps reserved stock, and refuses a stale edit', async () => {
    const first = await saveProduct(db, draft(), 'a@b.de');
    await db.collection('inventory').doc('JK-900__50').update({ reserved: 2 });
    await saveProduct(db, draft({ updatedAt: first.updatedAt, stock: { 'JK-900__50': 4 } }), 'a@b.de');
    const row = await db.collection('inventory').doc('JK-900__50').get();
    expect(row.get('onHand')).toBe(4);
    expect(row.get('reserved')).toBe(2);
    const stored = await db.collection('products').doc('JK-900').get();
    expect(stored.get('status')).toBe('draft');
    expect(stored.get('variants')[0].priceCents).toBe(54000);
    expect(expandVariants(draft().options)).toHaveLength(1);
    await expect(saveProduct(db, draft({ updatedAt: first.updatedAt, name: 'other' }), 'a@b.de')).rejects.toThrow(/inzwischen gespeichert/);
  });

  it('does not touch reserved when the on-hand count changes', async () => {
    await saveProduct(db, draft(), 'a@b.de');
    await db.collection('inventory').doc('JK-900__50').update({ reserved: 1 });
    await setOnHand(db, 'JK-900__50', 9);
    const row = await db.collection('inventory').doc('JK-900__50').get();
    expect(row.get('onHand')).toBe(9);
    expect(row.get('reserved')).toBe(1);
  });

  it('keeps the alt text and focus the editor sends', async () => {
    const first = await saveProduct(db, draft(), 'a@b.de');
    const image = { path: 'products/JK-900/one.jpg', url: 'https://example.com/one.jpg', width: 10, height: 20, alt: 'Jacke', focus: '20% 30%', slot: '' };
    await saveProduct(db, draft({ updatedAt: first.updatedAt, images: [image] }), 'a@b.de');
    const stored = await db.collection('products').doc('JK-900').get();
    expect(stored.get('images')[0].alt).toBe('Jacke');
    expect(stored.get('images')[0].focus).toBe('20% 30%');
  });

  it('returns numbered stock when an order is cancelled', async () => {
    await saveProduct(db, draft(), 'a@b.de');
    await db.collection('orders').doc('o1').set({
      number: 1, status: 'paid', items: [{ sku: 'JK-900__50', productId: 'JK-900', qty: 1, name: 'probe', code: 'JK / 900', unitAmount: 52000, options: [] }],
      history: [{ at: new Date().toISOString(), status: 'paid' }], shortfall: false, stripeSessionId: 'cs_1', createdAt: new Date().toISOString(),
    });
    await db.collection('orders').doc('o2').set({ number: 2, status: 'paid', items: [], history: [], shortfall: true, stripeSessionId: 'cs_2', createdAt: new Date().toISOString() });
    expect((await listOrders(db)).map((order) => [order.number, order.shortfall])).toEqual([[2, true], [1, false]]);
    await updateOrder(db, 'o1', { status: 'cancelled', restock: true });
    expect((await db.collection('inventory').doc('JK-900__50').get()).get('onHand')).toBe(4);
    expect((await db.collection('orders').doc('o1').get()).get('status')).toBe('cancelled');
  });

  it('accepts a picture at the upload address and serves it with the token', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const ticket = await createUpload('JK-900', 'dot.png', 'image/png', 'demo-cfc.appspot.com');
    const sent = await fetch(ticket.uploadUrl, { method: ticket.method, headers: ticket.headers, body: png });
    expect(sent.ok, `${sent.status} ${await sent.text()}`).toBe(true);
    const image = await registerImage('demo-cfc.appspot.com', { ...ticket.image, width: 1, height: 1, alt: 'Punkt' });
    const read = await fetch(image.url);
    expect(read.ok).toBe(true);
    expect(image.alt).toBe('Punkt');
  });
});
