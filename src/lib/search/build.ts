import type { PageEntry } from '@/content/pages';
import type { Catalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { slotSrc } from '@/lib/images';
import type { SearchEntry } from '@/lib/search/index';

export function buildSearchIndex(pages: readonly PageEntry[], cat: Catalog): SearchEntry[] {
  const byHref = new Map(cat.products.map((p) => [p.href, p]));
  return pages.flatMap((page) => {
    if (!page.search) return [];
    const product = byHref.get(page.path);
    return [{ k: page.search.kind, n: page.search.label, s: page.search.sub ?? '', h: page.path, i: page.search.slot ? slotSrc(page.search.slot) : null, p: product ? fmtPrice(product.priceCents) : null }];
  });
}
