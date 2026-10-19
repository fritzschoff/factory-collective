import { HttpsError } from 'firebase-functions/v2/https';
import { expandVariants, fieldErrors, PRODUCT_GROUPS, productSaveSchema, skuFor, specForStore, specFromStore, type ProductSave, type ShopProduct } from '@cfc/shop-core';
import type { Firestore } from 'firebase-admin/firestore';

export interface ProductListItem {
  id: string;
  code: string;
  name: string;
  kind: string;
  group: string;
  status: string;
  priceCents: number | null;
  updatedAt: string;
}

function stored<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function listProducts(db: Firestore): Promise<ProductListItem[]> {
  const snap = await db.collection('products').get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      code: String(data.code ?? ''),
      name: String(data.name ?? ''),
      kind: String(data.kind ?? ''),
      group: String(data.group ?? ''),
      status: String(data.status ?? 'draft'),
      priceCents: typeof data.priceCents === 'number' ? data.priceCents : null,
      updatedAt: String(data.updatedAt ?? ''),
    };
  }).sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}

export async function getProduct(db: Firestore, id: string): Promise<{ product: ShopProduct; stock: Record<string, number | null> } | null> {
  const doc = await db.collection('products').doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as ShopProduct;
  const product = { ...data, id: doc.id, spec: specFromStore(data.spec) };
  const inventory = await db.collection('inventory').where('productId', '==', id).get();
  const stock: Record<string, number | null> = {};
  for (const row of inventory.docs) {
    const onHand = row.get('onHand');
    stock[row.id] = onHand == null ? null : Number(onHand);
  }
  return { product, stock };
}

export async function saveProduct(db: Firestore, body: unknown, email: string, now = new Date()): Promise<{ updatedAt: string }> {
  const parsed = productSaveSchema.safeParse(body);
  if (!parsed.success) throw new HttpsError('invalid-argument', 'Bitte die markierten Felder prüfen.', { fields: fieldErrors(parsed.error) });
  const input = parsed.data;
  const groups = PRODUCT_GROUPS[input.kind] as readonly string[];
  if (!groups.includes(input.group)) throw new HttpsError('invalid-argument', 'Bitte die markierten Felder prüfen.', { fields: { group: 'Dieser Bereich gehört nicht zu dieser Art.' } });
  const ref = db.collection('products').doc(input.id);
  const updatedAt = now.toISOString();
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(ref);
    if (!existing.exists && input.updatedAt) throw new HttpsError('not-found', 'Das Produkt gibt es nicht mehr.');
    if (existing.exists && !input.updatedAt) throw new HttpsError('already-exists', 'Diese Kennung gibt es schon.');
    if (existing.exists && String(existing.get('updatedAt') ?? '') !== input.updatedAt) {
      throw new HttpsError('failed-precondition', 'Jemand hat das Produkt inzwischen gespeichert.');
    }
    const previous = existing.exists ? existing.data() as ShopProduct : null;
    const variants = expandVariants(input.options).map((variant) => ({
      ...variant,
      priceCents: input.variantPrices[variant.key] ?? null,
    }));
    const rows = variants.map((variant) => ({ sku: skuFor(input.id, variant.key) }));
    const inventory = await Promise.all(rows.map(async (row) => tx.get(db.collection('inventory').doc(row.sku))));
    const product: ShopProduct = stored({
      ...productFields(input),
      ground: input.ground ?? previous?.ground,
      pos: input.pos || previous?.pos,
      images: input.images,
      textLink: previous?.textLink,
      work: previous?.work,
      variants,
      updatedAt,
      updatedBy: email,
    });
    tx.set(ref, product);
    inventory.forEach((snap, index) => {
      const sku = rows[index].sku;
      const onHand = Object.prototype.hasOwnProperty.call(input.stock, sku) ? input.stock[sku] : (snap.exists ? snap.get('onHand') ?? null : null);
      if (snap.exists) tx.update(snap.ref, { onHand });
      else tx.set(snap.ref, { sku, productId: input.id, onHand, reserved: 0 });
    });
  });
  return { updatedAt };
}

function productFields(input: ProductSave): Omit<ShopProduct, 'images' | 'variants' | 'updatedAt' | 'updatedBy' | 'textLink' | 'work'> {
  return {
    id: input.id,
    kind: input.kind,
    group: input.group,
    code: input.code,
    slug: input.slug,
    name: input.name,
    material: input.material,
    sub: input.sub || undefined,
    description: input.description,
    spec: specForStore(input.spec) as unknown as ShopProduct['spec'],
    accordions: input.accordions,
    note: input.note,
    lead: input.lead,
    dims: input.dims || undefined,
    inv: input.inv,
    tag: input.tag || undefined,
    ground: input.ground,
    pos: input.pos,
    priceCents: input.priceCents,
    options: input.options,
    status: input.status,
    href: input.href,
  };
}

export async function listStock(db: Firestore): Promise<{ sku: string; productId: string; code: string; onHand: number | null; reserved: number; available: number | null }[]> {
  const [inventory, products] = await Promise.all([db.collection('inventory').get(), db.collection('products').get()]);
  const codes = new Map(products.docs.map((doc) => [doc.id, String(doc.get('code') ?? doc.id)]));
  return inventory.docs.map((doc) => {
    const onHand = doc.get('onHand');
    const hand = onHand == null ? null : Number(onHand);
    const reserved = Number(doc.get('reserved') ?? 0);
    return {
      sku: doc.id,
      productId: String(doc.get('productId') ?? ''),
      code: codes.get(String(doc.get('productId') ?? '')) ?? '',
      onHand: hand,
      reserved,
      available: hand == null ? null : hand - reserved,
    };
  }).sort((a, b) => (a.sku < b.sku ? -1 : 1));
}

export async function setOnHand(db: Firestore, sku: string, onHand: number | null): Promise<void> {
  if (onHand != null && (!Number.isInteger(onHand) || onHand < 0)) throw new HttpsError('invalid-argument', 'Der Bestand ist eine ganze Zahl oder unbegrenzt.');
  const ref = db.collection('inventory').doc(sku);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Diese Variante gibt es nicht.');
    tx.update(ref, { onHand });
  });
}
