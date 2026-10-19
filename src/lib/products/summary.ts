import { mediaUrl, slotSrc } from '@/lib/images';
import type { OptionDef, Product, ProductKind } from '@/lib/types';

/** What the browser needs to know about a product (bag, quick add): plain data, no functions. */
export interface ProductSummary {
  id: string;
  code: string;
  name: string;
  sub: string;
  kind: ProductKind;
  href: string;
  img: string | null;
  ground: boolean;
  pos: string | null;
  priceCents: number | null;
  lead: string;
  options: OptionDef[];
  work: { id: string; edition: 'poster' | 'archival' } | null;
}

export function toSummary(p: Product): ProductSummary {
  return {
    id: p.id, code: p.code, name: p.name, sub: p.sub ?? p.material, kind: p.kind, href: p.href,
    img: mediaUrl(p.media, p.images[0]) ?? slotSrc(p.images[0]), ground: !!p.ground, pos: p.pos ?? null,
    priceCents: p.priceCents ?? null, lead: p.lead, options: p.options, work: p.work ?? null,
  };
}
