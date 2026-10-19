import { HttpsError } from 'firebase-functions/v2/https';
import type { OrderStatus, ReservationItem, ShopOrder } from '@cfc/shop-core';
import type { Firestore } from 'firebase-admin/firestore';

const ORDER_STATUSES: readonly OrderStatus[] = ['paid', 'in_progress', 'shipped', 'done', 'awaiting_payment', 'cancelled'];

export async function listOrders(db: Firestore): Promise<{ id: string; number: number; status: string; email: string; amountTotal: number | null; createdAt: string }[]> {
  const snap = await db.collection('orders').get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    number: Number(doc.get('number') ?? 0),
    status: String(doc.get('status') ?? ''),
    email: String(doc.get('email') ?? ''),
    amountTotal: typeof doc.get('amountTotal') === 'number' ? doc.get('amountTotal') : null,
    createdAt: String(doc.get('createdAt') ?? ''),
  })).sort((a, b) => b.number - a.number);
}

export async function getOrder(db: Firestore, id: string): Promise<(ShopOrder & { id: string }) | null> {
  const doc = await db.collection('orders').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as ShopOrder) };
}

export async function updateOrder(db: Firestore, id: string, patch: { status?: string; tracking?: string; note?: string; restock?: boolean }, now = new Date()): Promise<void> {
  const ref = db.collection('orders').doc(id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Die Bestellung gibt es nicht.');
    const status = patch.status ?? String(snap.get('status') ?? '');
    if (!ORDER_STATUSES.includes(status as OrderStatus)) throw new HttpsError('invalid-argument', 'Diesen Status gibt es nicht.');
    const history = (snap.get('history') ?? []) as ShopOrder['history'];
    const nextHistory = status === snap.get('status') ? history : [...history, { at: now.toISOString(), status: status as OrderStatus }];
    const items = (snap.get('items') ?? []) as ReservationItem[];
    if (patch.restock && status === 'cancelled' && snap.get('status') !== 'cancelled') {
      const inventory = await Promise.all(items.map(async (item) => tx.get(db.collection('inventory').doc(item.sku))));
      inventory.forEach((row, index) => {
        if (!row.exists) return;
        const onHand = row.get('onHand');
        if (onHand == null) return;
        tx.update(row.ref, { onHand: Number(onHand) + items[index].qty });
      });
    }
    tx.update(ref, {
      status,
      tracking: patch.tracking ?? snap.get('tracking') ?? '',
      note: patch.note ?? snap.get('note') ?? '',
      history: nextHistory,
    });
  });
}

export async function listEnquiries(db: Firestore): Promise<{ id: string; name: string; email: string; subject: string; spam: boolean; createdAt: string }[]> {
  const snap = await db.collection('enquiries').get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    name: String(doc.get('name') ?? ''),
    email: String(doc.get('email') ?? ''),
    subject: String(doc.get('subject') ?? ''),
    spam: doc.get('spam') === true,
    createdAt: String(doc.get('createdAt') ?? ''),
  })).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listNewsletter(db: Firestore): Promise<{ id: string; email: string; spam: boolean; createdAt: string }[]> {
  const snap = await db.collection('newsletter').get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    email: String(doc.get('email') ?? ''),
    spam: doc.get('spam') === true,
    createdAt: String(doc.get('createdAt') ?? ''),
  })).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
