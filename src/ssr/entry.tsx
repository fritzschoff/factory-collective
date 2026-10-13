import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { ctx } from '../lib/runtime';
import { resolve } from '../lib/images';
import type { Product, RouteDef } from '../lib/types';
import { PRODUCTS, WORKS, price, priceCents } from '../content/catalog';
import { SITE } from '../content/site';
import { Document } from '../components/layout';
import { HomePage } from '../pages/home';
import { AtelierPage, FashionPage } from '../pages/atelier';
import { ProductPage } from '../pages/product';
import { BagsPage, JewelleryPage, ScanPage } from '../pages/series';
import { FactoryPage, GlossaryPage, TextT01, TextT02, TextT03 } from '../pages/factory';
import { CIPage, ExhibitionsPage, LPPage, SoundPage, StudioPage, WorkPage } from '../pages/studio';
import { Campaign01, Campaign02, CampaignsPage } from '../pages/campaigns';
import { AboutPage, BagPage, ContactPage, EmptyRoom, FaqPage, ImprintPage, JournalPage, NotFoundPage, PressPage, PrivacyPage, ReturnsPage, ShippingPage, TermsPage, ThankYouPage } from '../pages/info';

export { ctx };

/* ═══════════════ the route table ═══════════════
   One entry per page. To add a page: add a line here.                    */
function routes(): RouteDef[] {
  const out: RouteDef[] = [];
  const add = (r: Omit<RouteDef, 'sheet'> & { sheet?: string }) => out.push({ sheet: r.title, ...r } as RouteDef);

  add({ path: '/', title: SITE.name, description: SITE.description, band: { slot: 'home/hero-1', pos: '50% 16%' }, og: 'home/hero-1', sheet: 'Home', element: () => <HomePage />, search: { kind: 'Page', label: 'Home' } });

  /* Atelier */
  add({ path: '/atelier/', title: 'Atelier', description: 'Where the thesis becomes an object you can own. Fashion, bags, jewellery and objects — cut, cast or printed in small series.', world: 'atelier', band: { slot: 'fashion/JK-001', pos: '50% 24%' }, og: 'fashion/hero-1', sheet: 'Atelier', element: () => <AtelierPage />, search: { kind: 'Room', label: 'Atelier', sub: 'to make — fashion, bags, jewellery, objects', slot: 'fashion/JK-001' } });
  add({ path: '/atelier/fashion/', title: 'Fashion', description: 'Eighteen pieces built from one profile. Seams sit where a joint would sit; a shoulder carries the way a lintel carries.', world: 'atelier', band: { slot: 'fashion/hero-1', pos: '50% 20%' }, og: 'fashion/hero-1', sheet: 'Atelier / Fashion', element: () => <FashionPage />, search: { kind: 'Series', label: 'Fashion', sub: '18 pieces', slot: 'fashion/JK-001' } });
  add({ path: '/atelier/bags/', title: 'Bag / Profile Series', description: 'A bag is a room you agree to carry. Chambers, a span, a way in — made to order in leather.', world: 'atelier', band: { slot: 'bags/hero', pos: '50% 44%' }, og: 'bags/hero', sheet: 'Atelier / Bags', element: () => <BagsPage />, search: { kind: 'Series', label: 'Bag / Profile Series', sub: 'bags, totes — leather', slot: 'bags/BG-114' } });
  add({ path: '/atelier/jewellery/', title: 'Ordinary Objects, in silver', description: 'Five tools — a clasp, a clamp, a level, a profile, a sheet — reforged at the scale of the wrist.', world: 'atelier', band: { slot: 'jewellery/hero', pos: '50% 44%' }, og: 'jewellery/hero', sheet: 'Atelier / Jewellery', element: () => <JewelleryPage />, search: { kind: 'Series', label: 'Jewellery', sub: 'Ordinary Objects, in silver', slot: 'jewellery/BR-A' } });
  add({ path: '/atelier/scan-series/', title: 'Scan Series', description: 'Fifteen found objects scanned, printed in ceramic and glazed by hand. The form is a perfect copy; the surface never repeats.', world: 'atelier', band: { slot: 'scan/life-garden', pos: '50% 56%' }, og: 'scan/life-garden', sheet: 'Atelier / Scan Series', element: () => <ScanPage />, search: { kind: 'Series', label: 'Scan Series', sub: '15 ceramic objects', slot: 'scan/OB-011' } });
  add({ path: '/atelier/furniture/', title: 'Furniture', description: 'The profile at the scale of a room. In work.', world: 'atelier', sheet: 'Atelier / Furniture', element: () => <EmptyRoom kick="Atelier / Furniture" title="Furniture" line="The profile at the scale of a room." sheet="Furniture" back={{ label: 'The Atelier', href: '/atelier/' }} /> });

  for (const p of PRODUCTS) {
    if (p.kind === 'print') continue;
    const series = { fashion: 'Fashion', bag: 'Bag / Profile Series', jewellery: 'Jewellery', scan: 'Scan Series' }[p.kind];
    add({
      path: p.href, title: `${p.code} // ${p.name}`, description: p.description, world: 'atelier', band: { slot: p.images[0], pos: p.pos }, og: p.images[0], sheet: `Atelier / ${series} / ${p.code}`,
      element: () => <ProductPage p={p} />, search: { kind: series, label: `${p.code} ${p.name}`, sub: p.sub ?? p.material, slot: p.images[0] }
    });
  }

  /* Factory */
  add({ path: '/factory/', title: 'Factory', description: 'The drawing room. Texts, theses and a glossary — everything else is obliged to what is written here.', world: 'factory', band: { slot: 'factory/section-1' }, og: 'factory/section-1', sheet: 'Factory', element: () => <FactoryPage />, search: { kind: 'Room', label: 'Factory', sub: 'to think — texts, theses, glossary', slot: 'factory/section-1' } });
  add({ path: '/factory/tectonics-without-origin/', title: 'Tectonics without origin', description: 'Objects from a world that was never built. The invented fragment is not part of a whole — it is the place where the whole is missing.', world: 'factory', band: { slot: 'factory/stair', pos: '50% 30%' }, og: 'factory/stair', sheet: 'Factory / Texts / T01', element: () => <TextT01 />, search: { kind: 'Text', label: 'Tectonics without origin', sub: 'T01 // profile', slot: 'factory/section-1' } });
  add({ path: '/factory/ordinary-objects/', title: 'Ordinary Objects', description: 'On reproduction, the hand, and what a found form owes to nobody.', world: 'factory', band: { slot: 'jewellery/hero', pos: '50% 42%' }, og: 'jewellery/hero', sheet: 'Factory / Texts / T02', element: () => <TextT02 />, search: { kind: 'Text', label: 'Ordinary Objects', sub: 'T02 // ordinary object', slot: 'jewellery/hero' } });
  add({ path: '/factory/bag-profile-series/', title: 'Bag / Profile Series — the text', description: 'T03. In work.', world: 'factory', sheet: 'Factory / Texts / T03', element: () => <TextT03 />, search: { kind: 'Text', label: 'Bag / Profile Series', sub: 'T03 — in work' } });
  add({ path: '/factory/glossary/', title: 'Glossary', description: 'The words the site uses, and what they point at.', world: 'factory', sheet: 'Factory / Glossary', element: () => <GlossaryPage />, search: { kind: 'Page', label: 'Glossary' } });
  for (const [slug, t, l] of [['publishing', 'Publishing', 'Texts as printed matter.'], ['archive', 'Archive', 'What has been withdrawn, and what has been kept.'], ['lectures', 'Lectures', 'The texts, read aloud.']] as const)
    add({ path: `/factory/${slug}/`, title: t, description: l, world: 'factory', sheet: `Factory / ${t}`, element: () => <EmptyRoom kick={`Factory / ${t}`} title={t} line={l} sheet={t} back={{ label: 'The Factory', href: '/factory/' }} /> });

  /* Studio */
  add({ path: '/studio/', title: 'Studio', description: 'What has become space. Art series, exhibitions, sound.', world: 'studio', band: { slot: 'studio/hero-ci', pos: '50% 42%' }, og: 'studio/hero-ci', sheet: 'Studio', element: () => <StudioPage />, search: { kind: 'Room', label: 'Studio', sub: 'to enter — art, exhibitions, sound', slot: 'studio/hero-ci' } });
  add({ path: '/studio/conceptual-interference/', title: 'Conceptual Interference', description: 'Fifteen plates. Translucent material over colour and gesture, lit from behind. Chance treated as a layer of authorship.', world: 'studio', band: { slot: 'art/CI-detail' }, og: 'art/CI-07', sheet: 'Studio / Art / Series 01', element: () => <CIPage />, search: { kind: 'Series', label: 'Conceptual Interference', sub: '15 plates — originals and prints', slot: 'art/CI-07' } });
  add({ path: '/studio/layer-paintings/', title: 'Layer Paintings', description: 'Four triptychs. City plans, fields, roads and borders drawn onto layered film — three states of the same layers.', world: 'studio', band: { slot: 'art/LP-detail' }, og: 'art/LP-02-2', sheet: 'Studio / Art / Series 02', element: () => <LPPage />, search: { kind: 'Series', label: 'Layer Paintings', sub: '4 triptychs — originals and prints', slot: 'art/LP-02-2' } });
  for (const w of WORKS) {
    const ci = w.series === 'ci';
    add({
      path: w.href, title: `${w.code} — ${ci ? 'Conceptual Interference' : 'Layer Paintings'}`, description: `${w.code}: the original, a poster print (edition 100) and an archival print (edition 25).`, world: 'studio',
      band: { slot: ci ? w.slots[0] : w.slots[1] }, og: ci ? w.slots[0] : w.slots[1], sheet: `Studio / Art / ${w.code}`, element: () => <WorkPage w={w} />,
      search: { kind: ci ? 'Conceptual Interference' : 'Layer Paintings', label: `${w.code} — original & prints`, sub: ci ? '90 × 120 cm' : 'triptych, 3 × 50 × 70 cm', slot: ci ? w.slots[0] : w.slots[1] }
    });
  }
  add({ path: '/studio/exhibitions/', title: 'Exhibitions', description: 'Documentation of shows and setups.', world: 'studio', sheet: 'Studio / Exhibitions', element: () => <ExhibitionsPage />, search: { kind: 'Page', label: 'Exhibitions' } });
  add({ path: '/studio/sound/', title: 'Sound', description: 'Recordings from the room.', world: 'studio', sheet: 'Studio / Sound', element: () => <SoundPage />, search: { kind: 'Page', label: 'Sound' } });
  for (const [slug, t, l] of [['scenography', 'Scenography', 'The Studio, built for a stage.'], ['architecture', 'Architecture', 'The Studio, built for a site.']] as const)
    add({ path: `/studio/${slug}/`, title: t, description: l, world: 'studio', sheet: `Studio / ${t}`, element: () => <EmptyRoom kick={`Studio / ${t}`} title={t} line={l} sheet={t} back={{ label: 'The Studio', href: '/studio/' }} /> });

  /* Campaigns */
  add({ path: '/campaigns/', title: 'Campaigns', description: 'A campaign is a thesis carried out on location.', active: 'campaigns', band: { slot: 'campaign-01/cover', pos: '50% 18%' }, og: 'campaign-01/cover', sheet: 'Campaigns', element: () => <CampaignsPage />, search: { kind: 'Page', label: 'Campaigns' } });
  add({ path: '/campaigns/01/', title: 'Campaign ( 01 ) — [ campaign title ]', description: 'Eighteen pieces, cut like a section, worn against concrete, glass and steel.', active: 'campaigns', band: { slot: 'campaign-01/look-01', pos: '50% 16%' }, og: 'campaign-01/cover', sheet: 'Campaigns / ( 01 )', element: () => <Campaign01 />, search: { kind: 'Campaign', label: 'Campaign ( 01 ) — Autumn 2026', slot: 'campaign-01/cover' } });
  add({ path: '/campaigns/02/', title: 'Campaign ( 02 ) — The objects, at home', description: 'Fifteen ceramic objects, photographed where they are used rather than where they were made.', active: 'campaigns', band: { slot: 'campaign-02/cover', pos: '50% 56%' }, og: 'campaign-02/cover', sheet: 'Campaigns / ( 02 )', element: () => <Campaign02 />, search: { kind: 'Campaign', label: 'Campaign ( 02 ) — The objects, at home', slot: 'campaign-02/cover' } });

  /* Bag, about, service */
  add({ path: '/bag/', title: 'Bag', description: 'Your bag.', noindex: true, sheet: 'Bag', element: () => <BagPage /> });
  add({ path: '/bag/thank-you/', title: 'Thank you', description: 'Your order is placed.', noindex: true, sheet: 'Order', element: () => <ThankYouPage /> });
  add({ path: '/about/', title: 'About — One sign, three rooms', description: 'Concept. ( Factory ) Collective is one practice working in three registers: Factory, Atelier, Studio.', active: 'about', sheet: 'About', element: () => <AboutPage />, search: { kind: 'Page', label: 'About — One sign, three rooms' } });
  add({ path: '/contact/', title: 'Contact', description: 'Write to us about an order, an original, a fitting, or a piece that is not yet made.', active: 'about', sheet: 'Contact', element: () => <ContactPage />, search: { kind: 'Page', label: 'Contact' } });
  add({ path: '/press/', title: 'Press', description: 'Press enquiries.', active: 'about', sheet: 'Press', element: () => <PressPage /> });
  add({ path: '/shipping/', title: 'Shipping', description: 'Lead times, countries, insured shipping.', sheet: 'Shipping', element: () => <ShippingPage />, search: { kind: 'Page', label: 'Shipping' } });
  add({ path: '/returns/', title: 'Returns', description: 'Free returns within 30 days if the piece is unworn. Lifetime repair.', sheet: 'Returns', element: () => <ReturnsPage />, search: { kind: 'Page', label: 'Returns' } });
  add({ path: '/faq/', title: 'FAQ', description: 'The short answers.', sheet: 'FAQ', element: () => <FaqPage />, search: { kind: 'Page', label: 'FAQ' } });
  add({ path: '/journal/', title: 'Journal', description: 'Not yet.', sheet: 'Journal', element: () => <JournalPage /> });
  add({ path: '/imprint/', title: 'Imprint', description: 'Legal notice.', sheet: 'Imprint', element: () => <ImprintPage /> });
  add({ path: '/privacy/', title: 'Privacy', description: 'Privacy policy.', sheet: 'Privacy', element: () => <PrivacyPage /> });
  add({ path: '/terms/', title: 'Terms', description: 'Terms of sale.', sheet: 'Terms', element: () => <TermsPage /> });
  add({ path: '/404.html', title: 'Not found', description: 'Page not found.', noindex: true, sheet: '404', element: () => <NotFoundPage /> });
  return out;
}

let cached: RouteDef[] | null = null;
export const getRoutes = () => (cached ??= routes());

export function renderRoute(r: RouteDef): string {
  ctx.currentPage = r.path;
  const el: ReactElement = <Document route={r}>{r.element()}</Document>;
  return '<!doctype html>' + renderToStaticMarkup(el);
}

export const resolveSlot = (slot: string) => resolve(slot);
export function slotOfProductImage(productId: string, index: number): string | null {
  const p = PRODUCTS.find((x) => x.id === productId);
  return p?.images[index] ?? null;
}

export function sitemap(rs: RouteDef[]): string {
  const urls = rs.filter((r) => !r.noindex).map((r) => `  <url><loc>${ctx.siteUrl}${r.path}</loc><lastmod>${ctx.generatedAt.slice(0, 10)}</lastmod></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

import { url as imgUrl } from '../lib/images';
export function searchIndex(rs: RouteDef[]) {
  return rs.filter((r) => r.search).map((r) => ({
    k: r.search!.kind, n: r.search!.label, s: r.search!.sub ?? '', h: r.path, i: r.search!.slot ? imgUrl(r.search!.slot, 120) : null,
    p: PRODUCTS.find((p) => p.href === r.path) ? price(PRODUCTS.find((p) => p.href === r.path)!) : null
  }));
}

export function publicCatalog() {
  const products: Record<string, any> = {};
  for (const p of PRODUCTS) {
    const cents = priceCents(p);
    const pr = (ctx.stripe[p.id] ?? {}) as any;
    products[p.id] = {
      id: p.id, code: p.code, name: p.name, sub: p.sub ?? p.material, kind: p.kind, href: p.href, img: imgUrl(p.images[0], 480), ground: !!p.ground, pos: p.pos ?? null,
      cents, label: price(p), priceId: pr.priceId ?? null, lead: p.lead, work: p.work ?? null,
      options: p.options.map((o) => ({ id: o.id, label: o.label, type: o.type, optional: !!o.optional, max: o.max ?? null, values: (o.values ?? []).map((v) => ({ id: v.id, label: v.label, swatch: v.swatch ?? null })) }))
    };
  }
  return { currency: 'EUR', demo: ctx.demoPrices, products };
}

export function slotsReport(files: string[], dims: Record<string, { w: number; h: number }>): string {
  const rows = [...ctx.usage.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const state = (slot: string) => { const r = resolve(slot); return r.source === 'none' ? 'EMPTY (placeholder)' : r.source === 'sample' ? 'sample picture' : r.source; };
  const groups = new Map<string, typeof rows>();
  for (const r of rows) { const g = r[0].split('/')[0]; groups.set(g, [...(groups.get(g) ?? []), r]); }
  let md = `# Image slots\n\nGenerated by \`npm run build\` (or \`npm run images:report\`) on ${ctx.generatedAt.slice(0, 10)}.\n\n`;
  md += `**How it works.** Every picture on the site has a *slot key*. To use a real photograph, save it as \`public/images/<slot key>.jpg\` (or .png / .webp / .avif) — it replaces the sample picture or the placeholder automatically at the next build. Nothing in the code changes.\n\n`;
  md += `* **Recommended size** = twice the widest display size (retina). JPG, sRGB, quality 80–85. The build makes 480 / 960 / 1600 px WebP variants itself (needs \`sharp\`).\n* **Ratio** = the crop the layout uses. The picture is cropped to it (\`object-fit: cover\`), so keep the subject in the middle third; the focal point per product is set in \`src/content/catalog.ts\` (\`pos\`).\n* Pictures of objects on a ground (Scan Series) are shown *whole* on a paper ground; shoot them on a neutral background.\n* **Status**: \`local\` = a file you put there · \`stripe\` = picture on the Stripe product · \`sample picture\` = stand-in shipped with the code · \`EMPTY\` = placeholder.\n\n`;
  const total = rows.length, empty = rows.filter(([s]) => resolve(s).source === 'none').length, sample = rows.filter(([s]) => resolve(s).source === 'sample').length;
  md += `**${total} slots** · ${total - empty - sample} real pictures · ${sample} sample pictures · ${empty} empty.\n\n`;
  for (const [g, list] of [...groups.entries()].sort()) {
    md += `## ${g}\n\n| Slot key → file | Ratio(s) | Recommended px | Used on | Status |\n|---|---|---|---|---|\n`;
    for (const [slot, u] of list) {
      const ratios = [...u.ratios].join(', ');
      const w = u.widths.size ? Math.max(...u.widths) * 2 : 0;
      const pages = [...u.pages];
      md += `| \`${slot}.jpg\` | ${ratios} | ${w ? `${w} px wide` : '—'} | ${pages.length > 3 ? `${pages.length} pages` : pages.join(' ')} | ${state(slot)} |\n`;
    }
    md += '\n';
  }
  const known = new Set(rows.map(([s]) => s));
  const orphan = files.filter((f) => !f.startsWith('_') && !known.has(f.replace(/\.[a-z0-9]+$/i, '')));
  if (orphan.length) md += `## Files in public/images that no slot uses\n\nCheck the spelling of the file name — these are ignored:\n\n${orphan.map((f) => `* \`${f}\``).join('\n')}\n`;
  void dims;
  return md;
}
export type { Product };
