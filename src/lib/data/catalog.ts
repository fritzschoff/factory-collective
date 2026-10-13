import { cache } from 'react';
import { PRODUCTS, WORKS, type Work } from '@/content/catalog';
import manualPrices from '@/content/prices.json';
import { fmtPrice } from '@/lib/format';
import type { Product, ProductKind } from '@/lib/types';

/**
 * The only door to product data. Phase 1 reads the catalogue in the code;
 * Phase 2 replaces the body of getCatalog() with the Firebase `catalog` function.
 */
export interface Catalog {
  readonly products: readonly Product[];
  byId(id: string): Product | undefined;
  /** these products, in this order; unknown ids are skipped — an editorial pick must not break a page */
  pick(ids: readonly string[]): Product[];
  shop(kind: ProductKind): Product[];
  group(kind: ProductKind, group: string): Product[];
  bySlug(kind: ProductKind, slug: string): Product | undefined;
  printsOf(workId: string): Product[];
}

export function createCatalog(products: readonly Product[]): Catalog {
  const ids = new Map(products.map((p) => [p.id, p]));
  return {
    products,
    byId: (id) => ids.get(id),
    pick: (list) => list.map((id) => ids.get(id)).filter((p): p is Product => p !== undefined),
    shop: (kind) => products.filter((p) => p.kind === kind),
    group: (kind, g) => products.filter((p) => p.kind === kind && p.group === g),
    bySlug: (kind, slug) => products.find((p) => p.kind === kind && p.slug === slug),
    printsOf: (workId) => products.filter((p) => p.work?.id === workId),
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

export const getCatalog = cache(async (): Promise<Catalog> => {
  const demo = process.env.DEMO_PRICES === '1';
  return createCatalog(PRODUCTS.map((p) => ({ ...p, priceCents: priceCentsFor(p, manualPrices, demo) })));
});

/** "from € 45" over the print editions of a work. */
export function fromPrice(cat: Catalog, w: Work): string {
  const cents = cat.printsOf(w.id).map((p) => p.priceCents).filter((c): c is number => c != null);
  return cents.length ? `from ${fmtPrice(Math.min(...cents))}` : 'from € [price]';
}

export { WORKS };
export type { Work };
