import { forSale, skuFor, specFromStore, unitPriceCents, variantKey, type ReservationItem, type ShopOrder, type ShopProduct } from '@cfc/shop-core';
import type { Firestore } from 'firebase-admin/firestore';

export type RejectedReason = 'stock' | 'inactive' | 'price' | 'options';

export interface RejectedLine {
  id: string;
  reason: RejectedReason;
  available?: number;
}

export class ShopError extends Error {
  constructor(message: string, readonly status: number, readonly rejected: RejectedLine[] = []) {
    super(message);
    this.name = 'ShopError';
  }
}

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export type Mailer = (mail: Mail) => Promise<void>;

const HOLD_MS = 35 * 60 * 1000;
const STALE_MS = 60 * 60 * 1000;

export async function publicProducts(db: Firestore): Promise<ShopProduct[]> {
  const snap = await db.collection('products').get();
  return snap.docs.flatMap((doc) => {
    const data = doc.data() as ShopProduct;
    if (data.status === 'draft') return [];
    return [{ ...data, id: doc.id, spec: specFromStore(data.spec) }];
  });
}

export async function availabilityFor(db: Firestore, ids: readonly string[]): Promise<Record<string, { sku: string; productId: string; onHand: number | null; reserved: number; available: number | null }>> {
  const snap = await db.collection('inventory').get();
  const wanted = new Set(ids);
  const items: Record<string, { sku: string; productId: string; onHand: number | null; reserved: number; available: number | null }> = {};
  for (const doc of snap.docs) {
    const productId = String(doc.get('productId') ?? '');
    if (wanted.size && !wanted.has(productId)) continue;
    const onHand = doc.get('onHand');
    const reserved = Number(doc.get('reserved') ?? 0);
    const hand = onHand == null ? null : Number(onHand);
    items[doc.id] = { sku: doc.id, productId, onHand: hand, reserved, available: hand == null ? null : hand - reserved };
  }
  return items;
}

function rejectMessage(rejected: RejectedLine[]): string {
  if (rejected.some((line) => line.reason === 'options')) return 'Please choose the options again.';
  if (rejected.some((line) => line.reason === 'inactive')) return 'That piece is no longer available.';
  if (rejected.some((line) => line.reason === 'price')) return 'This piece has no price yet.';
  const left = rejected.find((line) => line.reason === 'stock');
  if (left && typeof left.available === 'number') return left.available > 0 ? `Only ${left.available} left.` : 'That piece is sold out.';
  return 'Some pieces are no longer available in that quantity.';
}

function quoteOne(product: ShopProduct | undefined, item: { id: string; qty: number; opts: Record<string, string> }): { line?: ReservationItem; rejected?: RejectedLine } {
  if (!product || product.status !== 'active') return { rejected: { id: item.id, reason: 'inactive' } };
  const chosen: Record<string, string> = {};
  const config: Record<string, string> = {};
  const labels: ReservationItem['options'] = [];
  for (const option of product.options) {
    const raw = (item.opts[option.id] ?? '').trim();
    if (!raw) {
      if (option.optional || option.type === 'text') continue;
      if (option.role === 'variant' || (option.values?.length && !option.optional)) return { rejected: { id: item.id, reason: 'options' } };
      continue;
    }
    if (option.type === 'text') {
      if (option.max && raw.length > option.max) return { rejected: { id: item.id, reason: 'options' } };
      labels.push({ id: option.id, label: option.label, value: raw });
      continue;
    }
    const value = option.values?.find((entry) => entry.id === raw);
    if (!value) return { rejected: { id: item.id, reason: 'options' } };
    if (option.role === 'variant') chosen[option.id] = value.id;
    else config[option.id] = value.id;
    labels.push({ id: option.id, label: option.label, value: value.label });
  }
  for (const option of product.options) {
    if (option.role === 'variant' && option.type !== 'text' && option.values?.length && !chosen[option.id]) {
      return { rejected: { id: item.id, reason: 'options' } };
    }
  }
  const key = variantKey(product.options, chosen);
  const unit = unitPriceCents(product, key, config);
  if (!forSale(unit)) return { rejected: { id: item.id, reason: 'price' } };
  const image = product.images.find((entry) => entry.url?.startsWith('https://'))?.url;
  const line: ReservationItem = {
    sku: skuFor(product.id, key),
    productId: product.id,
    qty: item.qty,
    unitAmount: unit,
    name: product.name,
    code: product.code,
    options: labels,
  };
  if (image) line.image = image;
  return { line };
}

export function quote(products: ReadonlyMap<string, ShopProduct>, items: readonly { id: string; qty: number; opts: Record<string, string> }[]): { lines: ReservationItem[]; rejected: RejectedLine[]; error: string } {
  const lines: ReservationItem[] = [];
  const rejected: RejectedLine[] = [];
  for (const item of items) {
    const result = quoteOne(products.get(item.id), item);
    if (result.rejected) rejected.push(result.rejected);
    else if (result.line) lines.push(result.line);
  }
  return { lines, rejected, error: rejected.length ? rejectMessage(rejected) : '' };
}

export async function reserve(db: Firestore, lines: readonly ReservationItem[], now = Date.now()): Promise<string> {
  const ref = db.collection('reservations').doc();
  const need = new Map<string, number>();
  for (const line of lines) need.set(line.sku, (need.get(line.sku) ?? 0) + line.qty);
  await db.runTransaction(async (tx) => {
    const rows = await Promise.all([...need.keys()].map(async (sku) => ({ sku, snap: await tx.get(db.collection('inventory').doc(sku)) })));
    const rejected: RejectedLine[] = [];
    for (const row of rows) {
      const qty = need.get(row.sku) ?? 0;
      const line = lines.find((item) => item.sku === row.sku);
      if (!row.snap.exists) {
        rejected.push({ id: line?.productId ?? row.sku, reason: 'stock', available: 0 });
        continue;
      }
      const onHand = row.snap.get('onHand');
      if (onHand == null) continue;
      const available = Number(onHand) - Number(row.snap.get('reserved') ?? 0);
      if (available < qty) rejected.push({ id: line?.productId ?? row.sku, reason: 'stock', available: Math.max(0, available) });
    }
    if (rejected.length) throw new ShopError(rejectMessage(rejected), 409, rejected);
    for (const row of rows) {
      const qty = need.get(row.sku) ?? 0;
      if (row.snap.get('onHand') == null) tx.update(row.snap.ref, { reserved: Number(row.snap.get('reserved') ?? 0) + qty });
      else tx.update(row.snap.ref, { reserved: Number(row.snap.get('reserved') ?? 0) + qty });
    }
    tx.set(ref, stored({
      items: lines,
      status: 'pending',
      expiresAt: new Date(now + HOLD_MS).toISOString(),
      booked: false,
      createdAt: new Date(now).toISOString(),
    }));
  });
  return ref.id;
}

export async function releaseReservation(db: Firestore, id: string, statuses: readonly string[] = ['pending']): Promise<void> {
  const ref = db.collection('reservations').doc(id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const status = String(snap.get('status') ?? '');
    if (!statuses.includes(status)) return;
    const items = (snap.get('items') ?? []) as ReservationItem[];
    const inventory = await Promise.all(items.map(async (item) => tx.get(db.collection('inventory').doc(item.sku))));
    items.forEach((item, index) => {
      const row = inventory[index];
      if (!row.exists) return;
      tx.update(row.ref, { reserved: Math.max(0, Number(row.get('reserved') ?? 0) - item.qty) });
    });
    tx.update(ref, { status: 'released' });
  });
}

export async function releaseStale(db: Firestore, now = Date.now()): Promise<number> {
  const cutoff = new Date(now - STALE_MS).toISOString();
  const snap = await db.collection('reservations').where('status', '==', 'pending').where('expiresAt', '<', cutoff).get();
  for (const doc of snap.docs) await releaseReservation(db, doc.id, ['pending']);
  return snap.size;
}

export interface CheckoutSession {
  id: string;
  payment_status?: string | null;
  customer_details?: { email?: string | null; name?: string | null; phone?: string | null; address?: Record<string, string | null> | null } | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id: string } | null;
}

function paymentIntent(session: CheckoutSession): string | undefined {
  const value = session.payment_intent;
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.id;
}

function stored<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function bookFromSession(db: Firestore, session: CheckoutSession, mode: 'paid' | 'unpaid' | 'failed' | 'expired', mailer?: Mailer | null, now = new Date()): Promise<void> {
  const found = await db.collection('reservations').where('stripeSessionId', '==', session.id).limit(1).get();
  if (found.empty) return;
  const reservationRef = found.docs[0].ref;
  if (mode === 'failed' || mode === 'expired') {
    await releaseReservation(db, reservationRef.id, ['pending', 'awaiting_payment']);
    const orderId = found.docs[0].get('orderId');
    if (typeof orderId === 'string') {
      const orderRef = db.collection('orders').doc(orderId);
      const order = await orderRef.get();
      const prior = (order.get('history') ?? []) as ShopOrder['history'];
      await orderRef.set({ status: 'cancelled', history: [...prior, { at: now.toISOString(), status: 'cancelled' }] }, { merge: true });
    }
    return;
  }
  const shouldMail = await db.runTransaction(async (tx) => {
    const reservation = await tx.get(reservationRef);
    if (!reservation.exists) return false;
    const items = (reservation.get('items') ?? []) as ReservationItem[];
    const inventory = await Promise.all(items.map(async (item) => tx.get(db.collection('inventory').doc(item.sku))));
    const existingId = reservation.get('orderId');
    const existing = typeof existingId === 'string' ? await tx.get(db.collection('orders').doc(existingId)) : null;
    const counterRef = db.collection('counters').doc('orders');
    const counter = existing?.exists ? null : await tx.get(counterRef);
    const prior = (existing?.get('history') ?? []) as ShopOrder['history'];
    const number = existing?.exists ? Number(existing.get('number')) : Number(counter?.get('n') ?? 0) + 1;
    const orderRef = existing?.exists ? existing.ref : db.collection('orders').doc();
    if (mode === 'unpaid') {
      if (reservation.get('status') === 'completed' || reservation.get('status') === 'awaiting_payment') return false;
      if (!existing?.exists) tx.set(counterRef, { n: number }, { merge: true });
      const order: ShopOrder = { ...orderFrom(session, items, number, 'awaiting_payment', false, now), history: [...prior, { at: now.toISOString(), status: 'awaiting_payment' }] };
      tx.set(orderRef, stored(order), { merge: true });
      tx.update(reservationRef, { status: 'awaiting_payment', orderId: orderRef.id });
      return false;
    }
    if (reservation.get('booked') === true) return false;
    if (!existing?.exists) tx.set(counterRef, { n: number }, { merge: true });
    const released = reservation.get('status') === 'released';
    let shortfall = false;
    items.forEach((item, index) => {
      const row = inventory[index];
      if (!row.exists) {
        shortfall = true;
        return;
      }
      const onHand = row.get('onHand');
      const reserved = Number(row.get('reserved') ?? 0);
      const patch: { onHand?: number; reserved?: number } = {};
      if (onHand != null) {
        const hand = Number(onHand);
        if (hand < item.qty) shortfall = true;
        patch.onHand = hand - item.qty;
      }
      if (!released) patch.reserved = Math.max(0, reserved - item.qty);
      if (Object.keys(patch).length) tx.update(row.ref, patch);
    });
    const order: ShopOrder = { ...orderFrom(session, items, number, 'paid', shortfall, now), history: [...prior, { at: now.toISOString(), status: 'paid' }] };
    tx.set(orderRef, stored(order), { merge: true });
    tx.update(reservationRef, { status: 'completed', booked: true, orderId: orderRef.id });
    return true;
  });
  if (shouldMail && mailer) {
    const again = await reservationRef.get();
    const orderId = again.get('orderId');
    if (typeof orderId === 'string') {
      const order = await db.collection('orders').doc(orderId).get();
      const number = order.get('number');
      const lines = ((order.get('items') ?? []) as ReservationItem[]).map((item) => `${item.qty} × ${item.code} // ${item.name}`).join('\n');
      await mailer({ to: '', subject: `Order ${number}`, text: `Order ${number}\n${order.get('email') ?? ''}\n${lines}` });
    }
  }
}

function orderFrom(session: CheckoutSession, items: readonly ReservationItem[], number: number, status: ShopOrder['status'], shortfall: boolean, now: Date): ShopOrder {
  const address = session.customer_details?.address ?? undefined;
  return {
    number,
    status,
    email: session.customer_details?.email ?? undefined,
    name: session.customer_details?.name ?? undefined,
    phone: session.customer_details?.phone ?? undefined,
    address: address ?? undefined,
    items: items.map((item) => ({ sku: item.sku, productId: item.productId, qty: item.qty, name: item.name, code: item.code, unitAmount: item.unitAmount, options: item.options })),
    amountTotal: session.amount_total ?? undefined,
    currency: session.currency ?? 'eur',
    stripeSessionId: session.id,
    stripePaymentIntent: paymentIntent(session),
    shortfall,
    history: [{ at: now.toISOString(), status }],
    createdAt: now.toISOString(),
  };
}

export async function orderBySession(db: Firestore, sessionId: string): Promise<{ number: number; status: string; items: { sku: string; code: string; name: string; qty: number; options: { label: string; value: string }[] }[] } | null> {
  const snap = await db.collection('orders').where('stripeSessionId', '==', sessionId).limit(1).get();
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  const items = (data.items ?? []) as ReservationItem[];
  return {
    number: Number(data.number),
    status: String(data.status),
    items: items.map((item) => ({ sku: item.sku, code: item.code, name: item.name, qty: item.qty, options: item.options.map((option) => ({ label: option.label, value: option.value })) })),
  };
}

export async function saveEnquiry(db: Firestore, body: { name: string; email: string; message: string; subject: string; work: string; company: string }, key: string, mailer?: Mailer | null): Promise<void> {
  const id = key || db.collection('enquiries').doc().id;
  const ref = db.collection('enquiries').doc(id);
  const spam = body.company.trim() !== '';
  try {
    await ref.create({ ...body, spam, createdAt: new Date().toISOString() });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && (error.code === 6 || error.code === 'already-exists')) return;
    throw error;
  }
  if (!spam && mailer) {
    await mailer({ to: '', subject: `Enquiry from ${body.name}`, text: `${body.name} <${body.email}>\n${body.subject}\n${body.work}\n\n${body.message}` });
  }
}

export async function saveNewsletter(db: Firestore, body: { email: string; company: string }, key: string, mailer?: Mailer | null): Promise<void> {
  const id = key || db.collection('newsletter').doc().id;
  const ref = db.collection('newsletter').doc(id);
  const spam = body.company.trim() !== '';
  try {
    await ref.create({ email: body.email, spam, createdAt: new Date().toISOString() });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && (error.code === 6 || error.code === 'already-exists')) return;
    throw error;
  }
  if (!spam && mailer) await mailer({ to: '', subject: 'Newsletter', text: body.email });
}

export function stripeLineItems(lines: readonly ReservationItem[]): { quantity: number; price_data: { currency: 'eur'; unit_amount: number; product_data: { name: string; description?: string; images?: string[]; metadata: { productId: string; sku: string } } } }[] {
  return lines.map((line) => ({
    quantity: line.qty,
    price_data: {
      currency: 'eur',
      unit_amount: line.unitAmount,
      product_data: {
        name: `${line.code} // ${line.name}`,
        description: line.options.map((option) => `${option.label}: ${option.value}`).join(' · ') || undefined,
        images: line.image ? [line.image] : undefined,
        metadata: { productId: line.productId, sku: line.sku },
      },
    },
  }));
}
