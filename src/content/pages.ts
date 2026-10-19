import { WORKS } from '@/content/catalog';
import { SITE } from '@/content/site';
import { pieces, workCount } from '@/lib/counts';
import { getCatalog, type Catalog } from '@/lib/data/catalog';
import type { WorldId } from '@/lib/nav/world';
import type { ProductKind } from '@/lib/types';

/** One entry per page: metadata, footer sheet, sitemap, search. */
export interface PageEntry {
  path: string;
  title: string;
  description: string;
  /** the line in the footer title block */
  sheet: string;
  world: WorldId | null;
  /** social image slot */
  og?: string;
  noindex?: boolean;
  search?: { kind: string; label: string; sub?: string; slot?: string };
}

const page = (e: Omit<PageEntry, 'world'> & { world?: WorldId | null }): PageEntry => ({ world: null, ...e });

export const STATIC_PAGES: readonly PageEntry[] = [
  page({ path: '/', title: SITE.name, description: SITE.description, og: 'home/hero-1', sheet: 'Home', search: { kind: 'Page', label: 'Home' } }),
  page({ path: '/atelier/', title: 'Atelier', description: 'Where the thesis becomes an object you can own. Fashion, bags, jewellery and objects — cut, cast or printed in small series.', world: 'atelier', og: 'fashion/hero-1', sheet: 'Atelier', search: { kind: 'Room', label: 'Atelier', sub: 'to make — fashion, bags, jewellery, objects', slot: 'fashion/JK-001' } }),
  page({ path: '/atelier/fashion/', title: 'Fashion', description: 'Eighteen pieces built from one profile. Seams sit where a joint would sit; a shoulder carries the way a lintel carries.', world: 'atelier', og: 'fashion/hero-1', sheet: 'Atelier / Fashion', search: { kind: 'Series', label: 'Fashion', sub: '18 pieces', slot: 'fashion/JK-001' } }),
  page({ path: '/atelier/bags/', title: 'Bag / Profile Series', description: 'A bag is a room you agree to carry. Chambers, a span, a way in — made to order in leather.', world: 'atelier', og: 'bags/hero', sheet: 'Atelier / Bags', search: { kind: 'Series', label: 'Bag / Profile Series', sub: 'bags, totes — leather', slot: 'bags/BG-114' } }),
  page({ path: '/atelier/jewellery/', title: 'Ordinary Objects, in silver', description: 'Five tools — a clasp, a clamp, a level, a profile, a sheet — reforged at the scale of the wrist.', world: 'atelier', og: 'jewellery/hero', sheet: 'Atelier / Jewellery', search: { kind: 'Series', label: 'Jewellery', sub: 'Ordinary Objects, in silver', slot: 'jewellery/BR-A' } }),
  page({ path: '/atelier/scan-series/', title: 'Scan Series', description: 'Fifteen found objects scanned, printed in ceramic and glazed by hand. The form is a perfect copy; the surface never repeats.', world: 'atelier', og: 'scan/life-garden', sheet: 'Atelier / Scan Series', search: { kind: 'Series', label: 'Scan Series', sub: '15 ceramic objects', slot: 'scan/OB-011' } }),
  page({ path: '/factory/', title: 'Factory', description: 'The drawing room. Texts, theses and a glossary — everything else is obliged to what is written here.', world: 'factory', og: 'factory/section-1', sheet: 'Factory', search: { kind: 'Room', label: 'Factory', sub: 'to think — texts, theses, glossary', slot: 'factory/section-1' } }),
  page({ path: '/factory/tectonics-without-origin/', title: 'Tectonics without origin', description: 'Objects from a world that was never built. The invented fragment is not part of a whole — it is the place where the whole is missing.', world: 'factory', og: 'factory/stair', sheet: 'Factory / Texts / T01', search: { kind: 'Text', label: 'Tectonics without origin', sub: 'T01 // profile', slot: 'factory/section-1' } }),
  page({ path: '/factory/ordinary-objects/', title: 'Ordinary Objects', description: 'On reproduction, the hand, and what a found form owes to nobody.', world: 'factory', og: 'jewellery/hero', sheet: 'Factory / Texts / T02', search: { kind: 'Text', label: 'Ordinary Objects', sub: 'T02 // ordinary object', slot: 'jewellery/hero' } }),
  page({ path: '/factory/glossary/', title: 'Glossary', description: 'The words the site uses, and what they point at.', world: 'factory', sheet: 'Factory / Glossary', search: { kind: 'Page', label: 'Glossary' } }),
  page({ path: '/studio/', title: 'Studio', description: 'What has become space. Art series, exhibitions, sound.', world: 'studio', og: 'studio/hero-ci', sheet: 'Studio', search: { kind: 'Room', label: 'Studio', sub: 'to enter — art, exhibitions, sound', slot: 'studio/hero-ci' } }),
  page({ path: '/studio/conceptual-interference/', title: 'Conceptual Interference', description: 'Fifteen plates. Translucent material over colour and gesture, lit from behind. Chance treated as a layer of authorship.', world: 'studio', og: 'art/CI-07', sheet: 'Studio / Art / Series 01', search: { kind: 'Series', label: 'Conceptual Interference', sub: '15 plates — originals and prints', slot: 'art/CI-07' } }),
  page({ path: '/studio/layer-paintings/', title: 'Layer Paintings', description: 'Four triptychs. City plans, fields, roads and borders drawn onto layered film — three states of the same layers.', world: 'studio', og: 'art/LP-02-2', sheet: 'Studio / Art / Series 02', search: { kind: 'Series', label: 'Layer Paintings', sub: '4 triptychs — originals and prints', slot: 'art/LP-02-2' } }),
  page({ path: '/campaigns/', title: 'Campaigns', description: 'A campaign is a thesis carried out on location.', world: 'campaigns', og: 'campaign-01/cover', sheet: 'Campaigns', search: { kind: 'Page', label: 'Campaigns' } }),
  page({ path: '/campaigns/01/', title: 'Campaign ( 01 ) — [ campaign title ]', description: 'Eighteen pieces, cut like a section, worn against concrete, glass and steel.', world: 'campaigns', og: 'campaign-01/cover', sheet: 'Campaigns / ( 01 )', search: { kind: 'Campaign', label: 'Campaign ( 01 ) — Autumn 2026', slot: 'campaign-01/cover' } }),
  page({ path: '/campaigns/02/', title: 'Campaign ( 02 ) — The objects, at home', description: 'Fifteen ceramic objects, photographed where they are used rather than where they were made.', world: 'campaigns', og: 'campaign-02/cover', sheet: 'Campaigns / ( 02 )', search: { kind: 'Campaign', label: 'Campaign ( 02 ) — The objects, at home', slot: 'campaign-02/cover' } }),
  page({ path: '/bag/', title: 'Bag', description: 'Your bag.', noindex: true, sheet: 'Bag' }),
  page({ path: '/bag/thank-you/', title: 'Thank you', description: 'Your order is placed.', noindex: true, sheet: 'Order' }),
  page({ path: '/about/', title: 'About — One sign, three rooms', description: 'Concept. ( Factory ) Collective is one practice working in three registers: Factory, Atelier, Studio.', world: 'about', sheet: 'About', search: { kind: 'Page', label: 'About — One sign, three rooms' } }),
  page({ path: '/contact/', title: 'Contact', description: 'Write to us about an order, an original, a fitting, or a piece that is not yet made.', world: 'about', sheet: 'Contact', search: { kind: 'Page', label: 'Contact' } }),
  page({ path: '/shipping/', title: 'Shipping', description: 'Lead times, countries, insured shipping.', sheet: 'Shipping', search: { kind: 'Page', label: 'Shipping' } }),
  page({ path: '/returns/', title: 'Returns', description: 'Free returns within 30 days if the piece is unworn. Lifetime repair.', sheet: 'Returns', search: { kind: 'Page', label: 'Returns' } }),
  page({ path: '/faq/', title: 'FAQ', description: 'The short answers.', sheet: 'FAQ', search: { kind: 'Page', label: 'FAQ' } }),
  page({ path: '/imprint/', title: 'Imprint', description: 'Legal notice.', sheet: 'Imprint' }),
  page({ path: '/privacy/', title: 'Privacy', description: 'Privacy policy.', sheet: 'Privacy' }),
  page({ path: '/terms/', title: 'Terms', description: 'Terms of sale.', sheet: 'Terms' }),
];

const SERIES: Record<Exclude<ProductKind, 'print'>, string> = { fashion: 'Fashion', bag: 'Bag / Profile Series', jewellery: 'Jewellery', scan: 'Scan Series' };

export function productPages(cat: Catalog): PageEntry[] {
  return cat.products.filter((p) => p.kind !== 'print').map((p) => {
    const series = SERIES[p.kind as Exclude<ProductKind, 'print'>];
    return {
      path: p.href, title: `${p.code} // ${p.name}`, description: p.description, world: 'atelier', og: p.images[0],
      sheet: `Atelier / ${series} / ${p.code}`, search: { kind: series, label: `${p.code} ${p.name}`, sub: p.sub ?? p.material, slot: p.images[0] },
    };
  });
}

export function workPages(): PageEntry[] {
  return WORKS.map((w) => {
    const ci = w.series === 'ci';
    const slot = ci ? w.slots[0] : w.slots[1];
    return {
      path: w.href, title: `${w.code} — ${ci ? 'Conceptual Interference' : 'Layer Paintings'}`,
      description: `${w.code}: the original, a poster print (edition 100) and an archival print (edition 25).`, world: 'studio', og: slot,
      sheet: `Studio / Art / ${w.code}`, search: { kind: ci ? 'Conceptual Interference' : 'Layer Paintings', label: `${w.code} — original & prints`, sub: ci ? '90 × 120 cm' : 'triptych, 3 × 50 × 70 cm', slot },
    };
  });
}

function patch(page: PageEntry, description: string, sub?: string): PageEntry {
  return { ...page, description, search: page.search && sub !== undefined ? { ...page.search, sub } : page.search };
}

export function withCounts(pages: readonly PageEntry[], cat: Catalog): PageEntry[] {
  const fashion = pieces(cat, 'fashion');
  const scan = pieces(cat, 'scan');
  const jewellery = pieces(cat, 'jewellery');
  const ci = workCount('ci');
  const lp = workCount('lp');
  return pages.map((page) => {
    if (page.path === '/atelier/fashion/') return patch(page, `${fashion} pieces built from one profile. Seams sit where a joint would sit; a shoulder carries the way a lintel carries.`, `${fashion} pieces`);
    if (page.path === '/atelier/jewellery/') return patch(page, `${jewellery} tools — a clasp, a clamp, a level, a profile, a sheet — reforged at the scale of the wrist.`);
    if (page.path === '/atelier/scan-series/') return patch(page, `${scan} found objects scanned, printed in ceramic and glazed by hand. The form is a perfect copy; the surface never repeats.`, `${scan} ceramic objects`);
    if (page.path === '/studio/conceptual-interference/') return patch(page, `${ci} plates. Translucent material over colour and gesture, lit from behind. Chance treated as a layer of authorship.`, `${ci} plates — originals and prints`);
    if (page.path === '/studio/layer-paintings/') return patch(page, `${lp} triptychs. City plans, fields, roads and borders drawn onto layered film — three states of the same layers.`, `${lp} triptychs — originals and prints`);
    if (page.path === '/campaigns/01/') return patch(page, `${fashion} pieces, cut like a section, worn against concrete, glass and steel.`);
    if (page.path === '/campaigns/02/') return patch(page, `${scan} ceramic objects, photographed where they are used rather than where they were made.`);
    return page;
  });
}

export const allPages = (cat: Catalog): PageEntry[] => [...withCounts(STATIC_PAGES, cat), ...productPages(cat), ...workPages()];

export async function countedPage(path: string): Promise<PageEntry> {
  return withCounts([staticPage(path)], await getCatalog())[0];
}

/** The entry of a static page; throws on a typo so a broken route file fails the build. */
export function staticPage(path: string): PageEntry {
  const found = STATIC_PAGES.find((p) => p.path === path);
  if (!found) throw new Error(`No page entry for ${path}`);
  return found;
}
