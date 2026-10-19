import { cacheLife } from 'next/cache';
import { cache } from 'react';
import type { ShopProduct } from '@cfc/shop-core';
import { PRODUCTS, WORKS, type Work } from '@/content/catalog';
import type { SoonKey } from '@/content/soon';
import manualPrices from '@/content/prices.json';
import { fmtPrice } from '@/lib/format';
import type { Product, ProductKind } from '@/lib/types';

/**
 * The only door to product data. An empty API base reads the catalogue in the code.
 * A set base reads the catalog function and keeps the last good result for a minute.
 */
export interface Catalog {
  readonly products: readonly Product[];
  readonly archived: readonly Product[];
  byId(id: string): Product | undefined;
  /** these products, in this order; unknown ids are skipped — an editorial pick must not break a page */
  pick(ids: readonly string[]): Product[];
  shop(kind: ProductKind): Product[];
  group(kind: ProductKind, group: string): Product[];
  bySlug(kind: ProductKind, slug: string): Product | undefined;
  printsOf(workId: string): Product[];
}

export function createCatalog(products: readonly Product[]): Catalog {
  const visible = products.filter((p) => (p.status ?? 'active') !== 'draft');
  const active = visible.filter((p) => (p.status ?? 'active') === 'active');
  const archived = visible.filter((p) => p.status === 'archived');
  const all = new Map(visible.map((p) => [p.id, p]));
  const activeIds = new Map(active.map((p) => [p.id, p]));
  return {
    products: active,
    archived,
    byId: (id) => all.get(id),
    pick: (list) => list.map((id) => activeIds.get(id)).filter((p): p is Product => p !== undefined),
    shop: (kind) => active.filter((p) => p.kind === kind),
    group: (kind, g) => active.filter((p) => p.kind === kind && p.group === g),
    bySlug: (kind, slug) => visible.find((p) => p.kind === kind && p.slug === slug),
    printsOf: (workId) => visible.filter((p) => p.work?.id === workId),
  };
}

const DEMO_EUR: Record<string, number> = { jackets: 520, shirts: 260, trousers: 340, vests: 300, bags: 880, totes: 1240, cuffs: 5400, bangles: 3200, bracelets: 3600, vases: 280, 'catch-alls': 190, holders: 240, trays: 210 };

/** Plausible prices for previews only (DEMO_PRICES=1). */
export function demoPriceCents(p: Product): number {
  if (p.kind === 'print') return p.work?.edition === 'poster' ? 4500 : 16000;
  return (DEMO_EUR[p.group] ?? 300) * 100 + (p.id.charCodeAt(p.id.length - 1) % 5) * 1000;
}

/** Price, in order: the manual list (EUR, whole numbers) → demo prices → none ("€ [price]"). */
export function priceCentsFor(p: Product, manual: Readonly<Record<string, unknown>>, demo: boolean): number | null {
  const eur = manual[p.id];
  if (typeof eur === 'number') return Math.round(eur * 100);
  return demo ? demoPriceCents(p) : null;
}

const apiBase = (): string | null => (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '') || null;

function fromShop(product: ShopProduct): Product {
  const text = product.textLink
    ? product.textLink.soon
      ? { soon: product.textLink.soon as SoonKey, label: product.textLink.label }
      : { href: product.textLink.href ?? '/', label: product.textLink.label }
    : undefined;
  return {
    id: product.id, code: product.code, slug: product.slug, kind: product.kind, group: product.group, name: product.name,
    material: product.material, sub: product.sub, description: product.description, images: product.images.map((image) => image.slot),
    media: product.images, pos: product.pos, ground: product.ground, tag: product.tag,
    options: product.options, spec: product.spec, note: product.note, dims: product.dims, inv: product.inv, text,
    accordions: product.accordions, href: product.href, priceCents: product.priceCents, lead: product.lead, work: product.work,
    status: product.status,
  };
}

async function loadProducts(): Promise<Product[]> {
  const base = apiBase();
  if (process.env.VERCEL_ENV === 'production' && !base) throw new Error('NEXT_PUBLIC_API_BASE is required in production.');
  if (!base) {
    const demo = process.env.DEMO_PRICES === '1';
    return PRODUCTS.map((p) => ({ ...p, priceCents: priceCentsFor(p, manualPrices, demo) }));
  }
  const res = await fetch(`${base}/catalog`);
  if (!res.ok) throw new Error(`catalog responded ${res.status}`);
  const data = (await res.json()) as { products?: ShopProduct[] };
  if (!data.products) throw new Error('catalog responded without products');
  return data.products.map(fromShop);
}

async function readProducts(): Promise<Product[]> {
  'use cache';
  if (process.env.NEXT_RUNTIME) cacheLife({ stale: 60, revalidate: 60, expire: 86400 });
  return loadProducts();
}

export const getCatalog = cache(async () => createCatalog(await readProducts()));

/** "from € 45" over the print editions of a work. */
export function fromPrice(cat: Catalog, w: Work): string {
  const cents = cat.printsOf(w.id).map((p) => p.priceCents).filter((c): c is number => c != null);
  return cents.length ? `from ${fmtPrice(Math.min(...cents))}` : 'from € [price]';
}

export { WORKS };
export type { Work };
