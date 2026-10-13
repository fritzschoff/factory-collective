import type { OptionDef, Product } from '@/lib/types';
import { slugify } from '@/lib/format';

/* ───────────────────────────────────────────────────────────
   THE CATALOGUE
   One entry per product. `id` is the key everywhere:
     · image slots               fashion/<id>, fashion/<id>-2 …
     · URL                       /atelier/fashion/<id lower-case>/
   Prices are NOT here, and pages never read PRODUCTS for them: they ask
   getCatalog() in src/lib/data/catalog.ts, which takes the price from
   src/content/prices.json, or DEMO_PRICES=1, or leaves it at "€ [price]".
   ─────────────────────────────────────────────────────────── */

const SW: Record<string, string> = {
  white: '#F2F1EE', stone: '#CFC9BD', black: '#1D1D1B', navy: '#1F2A44', grey: '#B5B4B0', 'light grey': '#C9C8C4',
  'blue-grey': '#7F8A9A', olive: '#6F7452', chambray: '#9BA7B4', charcoal: '#43433F', pinstripe: '#2A2A2A', walnut: '#5B4636',
  cobalt: '#2B4E8C', bone: '#D8D5CE', green: '#1F7A4A', red: '#8E1B22'
};
const sw = (ids: string[]) => ids.map((l) => ({ id: slugify(l), label: l[0].toUpperCase() + l.slice(1), swatch: SW[l] }));
const colour = (...labels: string[]): OptionDef => ({ id: 'colour', label: 'Colour', type: 'swatch', values: sw(labels) });
const size = (...v: string[]): OptionDef => ({ id: 'size', label: 'Size', type: 'size', values: v.map((s) => ({ id: s, label: s })), note: 'Size guide' });
const SIZES = ['46', '48', '50', '52', '54'];

const ACC_DELIVERY = { title: 'Delivery and returns', body: 'Ships in 5 working days, insured, from [ place ]. Free returns within 30 days if the piece is unworn. Made-to-order pieces are not returnable; they are repaired instead.' };

const P: Product[] = [];
const push = (p: Omit<Product, 'slug' | 'href' | 'inv' | 'priceCents'> & { slug?: string; inv?: string }) => {
  const slug = p.slug ?? p.id.toLowerCase();
  const base = { fashion: '/atelier/fashion/', bag: '/atelier/bags/', jewellery: '/atelier/jewellery/', scan: '/atelier/scan-series/', print: '/studio/' }[p.kind];
  P.push({ ...p, slug, href: p.kind === 'print' ? '/studio/' : base + slug + '/', inv: p.inv ?? `/// A / ${p.id.replace('-', ' / ')}` } as Product);
};

/* ── Fashion ──────────────────────────────────────────────── */
type F = [id: string, group: string, name: string, material: string, colours: string[], desc: string, pos?: string];
const FASHION: F[] = [
  ['JK-001', 'jackets', 'jacket, white', 'Cotton canvas', ['white', 'stone'], 'A zip jacket whose shoulder behaves like a lintel: it carries the sleeve instead of hanging from it. Cut once from a heavy canvas that holds its edge.', '50% 26%'],
  ['JK-002', 'jackets', 'jacket, stone', 'Cotton canvas', ['stone'], 'The same profile in the colour of the building it was photographed against. Raglan seams sit where a joint would sit.', '50% 26%'],
  ['JK-003', 'jackets', 'jacket, black funnel', 'Bonded wool', ['black'], 'A funnel collar in bonded wool: two layers, one face, no lining. The collar stands because the material was built to stand.', '50% 40%'],
  ['JK-004', 'jackets', 'jacket, pinstripe', 'Wool', ['pinstripe'], 'A fine pinstripe laid out so the lines run through the seams like survey lines through a plan. Short, square, zipped to the throat.', '50% 54%'],
  ['JK-005', 'jackets', 'jacket, navy', 'Cotton', ['navy'], 'A short navy jacket with a standing collar. Nothing is added to it that the shoulder does not need.', '50% 32%'],
  ['JK-006', 'jackets', 'jacket, grey collar', 'Wool', ['grey'], 'A light wool jacket with a collar cut as a separate plane, set against the body rather than turned out of it.', '50% 36%'],
  ['JK-007', 'jackets', 'jacket, black collar', 'Wool', ['black'], 'Black wool, a wide shoulder, a collar that stays where it is put. The zip is the only line that is not a seam.', '50% 36%'],
  ['JK-008', 'jackets', 'jacket, blue-grey', 'Cotton', ['blue-grey'], 'A blue-grey cotton jacket with a split yoke. The seam where the two panels meet is exposed on purpose.', '50% 34%'],
  ['SH-001', 'shirts', 'shirt, grey band', 'Cotton poplin', ['light grey', 'chambray', 'white'], 'A shirt cut as a section: the yoke runs as a continuous band across the chest, the way a lintel runs across an opening. The band is bonded, not stitched down, so it holds its line without a seam reading through.', '50% 56%'],
  ['SH-002', 'shirts', 'shirt, chambray', 'Cotton', ['chambray'], 'A chambray overshirt with the band moved to the shoulder. Corozo buttons, flat, set in a straight placket.', '55% 58%'],
  ['SH-003', 'shirts', 'shirt, grey', 'Cotton poplin', ['light grey'], 'The grey band shirt in one cloth, without the band. For the days the building does not offer one.', '50% 54%'],
  ['SH-004', 'shirts', 'shirt, olive', 'Cotton', ['olive'], 'A short-sleeved shirt in olive cotton. The sleeve is cut straight from the shoulder and stops where the arm does.', '50% 56%'],
  ['TR-001', 'trousers', 'trousers, charcoal', 'Wool', ['charcoal'], 'Wide trousers with a high, straight waist. The crease is cut in, not pressed in, so it stays.', '50% 54%'],
  ['TR-002', 'trousers', 'trousers, light grey', 'Wool', ['light grey'], 'The same pattern in light grey wool, with a grey band bonded across the hem. Worn long, they stack on the shoe.', '50% 50%'],
  ['TR-003', 'trousers', 'trousers, black', 'Wool', ['black'], 'Black wool trousers, wide through the leg and cut to sit at the hip. No turn-ups, no pleats — one line down each leg.', '50% 52%'],
  ['VT-001', 'vests', 'vest, black', 'Bonded wool', ['black'], 'A zipped vest with one diagonal brace: it stops the shoulder from rolling forward. Four pockets, all structural.', '50% 46%'],
  ['VT-002', 'vests', 'vest, black blue', 'Bonded wool', ['black', 'navy'], 'The vest in black with a blue-black panel. Bonded, so the edge needs no binding.', '50% 46%'],
  ['VT-003', 'vests', 'vest, grey', 'Wool', ['grey'], 'A sleeveless grey vest, long in the body. Worn over a shirt, it reads as a plane laid over the chest.', '50% 40%']
];
const MEAS: Record<string, string> = { jackets: 'Size 50 · body 58 · sleeve 64 · shoulder 46 cm', shirts: 'Size 50 · body 58 · sleeve 64 · shoulder 46 cm', trousers: 'Size 50 · waist 38 · inseam 78 · leg opening 26 cm', vests: 'Size 50 · body 56 · length 68 · shoulder 42 cm' };
for (const [id, group, name, material, cols, description, pos] of FASHION) {
  const [kindCode] = id.split('-');
  push({
    id, code: id.replace('-', ' / '), kind: 'fashion', group, name, material, description,
    images: [`fashion/${id}`, ...(id === 'SH-001' ? ['fashion/SH-001-2', 'fashion/SH-001-3', 'fashion/SH-001-4'] : id === 'JK-001' ? ['fashion/JK-001-2'] : id === 'TR-001' ? ['fashion/TR-001-2'] : id === 'VT-001' ? ['fashion/VT-001-2'] : [])],
    pos, options: [colour(...cols), size(...SIZES)],
    spec: [['Cloth', material], ['Cut', 'One profile, one pattern'], ['Fit', group === 'trousers' ? 'Wide, high waist' : 'Straight, dropped shoulder'], ['Series', '40 pieces'], ['Made in', '[ place ]'], ['Code', id.replace('-', ' / ')]],
    note: 'Cut in a small series of 40. Ships in 5 days.  ·  Free returns.',
    lead: 'Ships in 5 days',
    text: { href: '/factory/tectonics-without-origin/', label: 'Tectonics without origin — the text' },
    accordions: [
      { title: 'Cloth and making', body: `${material}. Cut and made in a small series in [ place ]. The pattern follows one profile; seams sit where a joint would sit, and the ones that carry are left visible.` },
      { title: 'Measurements', body: `${MEAS[group]}. The full table is in the size guide.` },
      { title: 'Care', body: 'Dry clean or wash cold on the wool cycle. Dry flat. Bonded panels must not be ironed directly. [ care label to be confirmed ]' },
      ACC_DELIVERY
    ],
    tag: undefined
  });
  void kindCode;
}

/* ── Bags ─────────────────────────────────────────────────── */
const bagOpts = (leathers: string[]): OptionDef[] => [
  { id: 'leather', label: 'Leather', type: 'swatch', values: sw(leathers) },
  { id: 'strap', label: 'Strap', type: 'choice', values: [{ id: 'hand', label: 'Hand, fixed' }, { id: 'hand-shoulder', label: 'Hand + shoulder' }] },
  { id: 'monogram', label: 'Monogram', type: 'text', max: 3, optional: true, note: 'Blind-debossed on the spine. Three characters.' }
];
const bagAcc = [
  { title: 'Material and making', body: 'Vegetable-tanned leather, 4 mm bonded spine, raw brass hardware. Nothing is lined: the leather carries, and the seams that do the carrying are left where you can see them.' },
  { title: 'Dimensions', body: 'See the specification below. Weight and interior dimensions are given per piece.' },
  { title: 'Repair and care', body: 'Lifetime repair, free of charge: restitching, edge re-dye, hardware. Wipe with a dry cloth; condition once a year.' },
  { title: 'Delivery and returns', body: 'Made to order. Delivery in 4 weeks, insured, from [ place ]. Made-to-order pieces are not returnable; they are repaired for life instead.' }
];
type B = [id: string, name: string, desc: string, dims: string, slot: string];
const BAGS: B[] = [
  ['BG-114', 'tote', 'Three chambers held apart by a bonded spine — a U-profile turned on its side. Nothing is lined: the leather carries, and the seams that do the carrying are left where you can see them.', '340 × 280 × 140 mm · three chambers', 'bags/BG-114'],
  ['BG-098', 'shoulder bag', 'The same spine, one chamber. The strap is cut from the body, not added to it.', '300 × 220 × 90 mm · one chamber', 'bags/BG-098'],
  ['BG-086', 'clutch', 'A folded profile. Closed it is a section; open it is a span.', '260 × 180 × 40 mm · folded', 'bags/BG-086'],
  ['BG-NEW', 'bag, stitched panels', 'Panels held by their own stitching, standing like a section drawn in leather. New in the series.', '[ mm ] · stitched panels', 'bags/BG-NEW']
];
for (const [id, name, description, dims, slot] of BAGS) {
  const isNew = id === 'BG-NEW';
  push({
    id, code: isNew ? 'BG / 0??' : id.replace('-', ' / '), slug: id.toLowerCase(), kind: 'bag', group: name.includes('tote') ? 'totes' : 'bags', name, material: 'Leather',
    description, images: id === 'BG-114' ? [slot, 'bags/BG-114-2', 'bags/BG-114-3', 'bags/BG-114-4'] : [slot], pos: '50% 48%', ground: false,
    tag: isNew ? 'New' : undefined, sub: isNew ? 'new — stitched panels' : undefined, dims,
    options: bagOpts(['black', 'stone', 'walnut']),
    spec: [['Leather', 'Vegetable-tanned'], ['Spine', 'Bonded, 4 mm'], ['Hardware', 'Brass, raw'], ['Chambers', id === 'BG-114' ? '3' : '1'], ['Weight', '[ g ]'], ['Made in', '[ place ]']],
    note: 'Made to order. Delivery in 4 weeks.  ·  Lifetime repair.', lead: 'Made to order · 4 weeks',
    text: { soon: 'bagText', label: 'Bag / Profile Series — the text' }, accordions: bagAcc
  });
}

/* ── Jewellery ────────────────────────────────────────────── */
const jewAcc = (what: string) => [
  { title: 'Material and making', body: `${what} Each piece is measured from its source object, cast, riveted and finished by hand in a small series.` },
  { title: 'Dimensions', body: 'See the specification below. Sizes S / M / L are inner diameters; ask for a fitting if you are between sizes.' },
  { title: 'Care', body: 'Silver tarnishes and that is allowed. Polish with a dry cloth. Gold and white gold need nothing. Lifetime repair.' },
  { title: 'Delivery and returns', body: 'Made to order in a small series. Delivery in 3 – 4 weeks, insured, from [ place ]. Free returns within 14 days if the size does not fit.' }
];
type J = [id: string, suffix: string, name: string, after: string, desc: string, metals: [string, string], dims: string];
const JEW: J[] = [
  ['BR-A', 'a', 'cuff', 'after a folding clasp', 'A folding clasp, taken at face value: the hinge and the two locking ends recast in white gold. Gold inserts are riveted into the profile; the ends close with magnets hidden inside. The stone is set as part of the structure — not as effect.', ['White gold, gold', 'Silver, gold'], '[ inner Ø 62 mm · band 14 mm ]'],
  ['BR-B', 'b', 'screw bangle', 'after a screw clamp', 'A screw clamp at one to one. The thread still turns; it simply no longer clamps anything.', ['Silver, gold thread', 'White gold'], '[ inner Ø 60 mm · band 12 mm ]'],
  ['BR-C', 'c', 'spring bangle', 'after a spirit level', 'A spirit level bent into a bangle: the vial stays, set where the bubble would read level on the wrist.', ['Silver, blue vial', 'White gold, blue vial'], '[ inner Ø 62 mm · band 16 mm ]'],
  ['BR-D', 'd', 'profile bangle', 'after a structural profile', 'An I-section, rolled closed. The profile is the whole design — flange, web, flange — and nothing is added to it.', ['Silver', 'Blackened silver'], '[ inner Ø 64 mm · section 10 × 10 mm ]'],
  ['BR-E', 'e', 'link bracelet', 'after a corrugated sheet', 'Corrugated sheet, rolled down to the wrist. Each link is one wave of the original.', ['Silver', 'Silver, gold'], '[ length 180 mm · link 12 mm ]']
];
for (const [id, s, name, after, description, metals, dims] of JEW) {
  push({
    id, code: `BR / 0??.${s}`, slug: id.toLowerCase(), kind: 'jewellery', group: name.includes('cuff') ? 'cuffs' : name.includes('bracelet') ? 'bracelets' : 'bangles', name, material: metals[0], sub: after,
    description, images: id === 'BR-A' ? ['jewellery/BR-A', 'jewellery/BR-A-2', 'jewellery/BR-A-3', 'jewellery/BR-A-4'] : id === 'BR-C' ? ['jewellery/BR-C', 'jewellery/BR-C-2'] : [`jewellery/${id}`], pos: '50% 50%', dims,
    options: [
      { id: 'metal', label: 'Metal', type: 'choice', values: metals.map((m) => ({ id: slugify(m), label: m })) },
      ...(id === 'BR-A' ? [{ id: 'stone', label: 'Stone', type: 'swatch' as const, values: sw(['white', 'green', 'red']) }] : []),
      { id: 'size', label: 'Size', type: 'size', values: ['S', 'M', 'L'].map((v) => ({ id: v, label: v })), note: 'Size guide' }
    ],
    spec: [['Metal', metals[0]], ['Source', after.replace('after a ', '')], ['Closure', id === 'BR-A' ? 'Neodymium, housed' : 'Hinge, no catch'], ['Inner Ø', '58 / 62 / 66 mm'], ['Weight', '[ g ]'], ['Hallmark', 'C. ( ) C.']],
    note: 'Made to order in a small series. Delivery in 3 – 4 weeks.  ·  Free returns.', lead: 'Made to order · 3 – 4 weeks',
    text: { href: '/factory/ordinary-objects/', label: 'Ordinary Objects — the text' }, accordions: jewAcc(`${metals[0]}.`)
  });
}

/* ── Scan Series ──────────────────────────────────────────── */
type O = [id: string, group: string, name: string, glaze: string, after: string, glazes: string[]];
const SCAN: O[] = [
  ['OB-011', 'vases', 'vase, blue', 'cobalt', 'after a jerrycan', ['cobalt', 'bone', 'olive']],
  ['OB-012', 'vases', 'vase, green', 'olive', 'after a bottle', ['olive', 'bone']],
  ['OB-013', 'vases', 'figure, yellow', 'yellow', 'after an artist’s mannequin', ['bone', 'olive']],
  ['OB-021', 'catch-alls', 'catch-all', 'yellow / black', 'after a packing crate', ['bone']],
  ['OB-022', 'catch-alls', 'catch-all', 'green / pink', 'after a pen stand', ['bone']],
  ['OB-023', 'catch-alls', 'catch-all', 'yellow / grey', 'after a crushed carton', ['bone']],
  ['OB-024', 'catch-alls', 'catch-all', 'black / yellow', 'after a torn carton', ['bone']],
  ['OB-025', 'catch-alls', 'catch-all', 'red / green', 'after a first-aid case', ['bone']],
  ['OB-031', 'holders', 'holder, teal', 'teal', 'after bundled stock', ['bone']],
  ['OB-032', 'holders', 'holder, red', 'red / yellow', 'after a work boot', ['bone']],
  ['OB-033', 'holders', 'holder, blue', 'blue / white', 'after a drill block', ['bone']],
  ['OB-037', 'holders', 'bookend', 'magenta / gold', 'after a brick', ['bone']],
  ['OB-034', 'trays', 'tray, blue / red', 'blue / red', 'after a ribbed sheet', ['bone']],
  ['OB-035', 'trays', 'dish, red', 'red', 'after a glove', ['bone']],
  ['OB-036', 'trays', 'ring tray, blue', 'blue', 'after a strap buckle', ['bone']]
];
const scanAcc = [
  { title: 'Material and making', body: 'Stoneware, printed from a one-to-one photogrammetry scan, fired once at 1240 °C and glazed by hand. The form is a perfect copy; the surface never repeats.' },
  { title: 'Dimensions', body: 'See the specification below. Every piece is made at the size of its source object.' },
  { title: 'Care', body: 'Wash by hand. The glaze is food-safe on the inside where a liner is specified; otherwise keep it dry. [ care to be confirmed ]' },
  { title: 'Delivery and returns', body: 'Made after you order it. Delivery in 2 weeks, insured, from [ place ]. Glaze is poured by hand, so the piece you receive will not match the photograph exactly — that is the piece, not a defect.' }
];
for (const [id, group, name, glaze, after, glazes] of SCAN) {
  const vase = group === 'vases';
  push({
    id, code: id.replace('-', ' / '), kind: 'scan', group, name, material: 'Stoneware, hand-glazed', sub: after, ground: true,
    description: id === 'OB-011'
      ? 'A five-litre jerrycan, scanned at full resolution and printed in ceramic at one to one. Every dent the original had is still there. The glaze is poured by hand, so the colour runs where it wants to — no two leave the kiln alike.'
      : `A found object, ${after.replace('after ', '')}, scanned at full resolution and printed in ceramic at one to one. Every dent the original had is still there. The glaze is poured by hand — no two leave the kiln alike.`,
    images: id === 'OB-011' ? ['scan/OB-011', 'scan/OB-011-2', 'scan/OB-011-3', 'scan/OB-011-4'] : [`scan/${id}`], pos: '50% 50%',
    dims: id === 'OB-011' ? '[ h 185 · w 140 · d 120 mm ]' : '[ h · w · d mm ]',
    options: [
      { id: 'glaze', label: 'Glaze', type: 'swatch', values: sw(glazes) },
      ...(vase ? [{ id: 'liner', label: 'Liner', type: 'choice' as const, values: [{ id: 'glass', label: 'Watertight glass' }, { id: 'none', label: 'None — dry only' }] }] : [])
    ],
    spec: [['Body', 'Stoneware, printed'], ['Source', after.replace('after ', '')], ['Scan', 'Photogrammetry, 1 : 1'], ['Glaze', `Hand-poured, ${glaze}`], ['Firing', '1240 °C, once'], ['Lead time', '2 weeks']],
    note: 'Each piece is glazed by hand, so the one you receive will not match the photograph exactly. That is the piece, not a defect.', lead: 'Made after you order · 2 weeks',
    text: { href: '/factory/ordinary-objects/', label: 'Ordinary Objects — the text' }, accordions: scanAcc
  });
}

/* ── Prints of the studio works (sold via the work pages) ──── */
export interface Work {
  id: string;            // CI-07
  series: 'ci' | 'lp';
  n: number;
  code: string;          // CI / 07
  slug: string;          // ci-07
  href: string;
  title: string;
  slots: string[];       // ci: [plate] · lp: three states
  detail: string;
}
export const WORKS: Work[] = [];
for (let i = 1; i <= 15; i++) { const n = String(i).padStart(2, '0'); WORKS.push({ id: `CI-${n}`, series: 'ci', n: i, code: `CI / ${n}`, slug: `ci-${n}`, href: `/studio/conceptual-interference/ci-${n}/`, title: `CI / ${n}`, slots: [`art/CI-${n}`], detail: 'art/CI-detail' }); }
for (let i = 1; i <= 4; i++) { const n = String(i).padStart(2, '0'); WORKS.push({ id: `LP-${n}`, series: 'lp', n: i, code: `LP / ${n}`, slug: `lp-${n}`, href: `/studio/layer-paintings/lp-${n}/`, title: `LP / ${n}`, slots: [1, 2, 3].map((s) => `art/LP-${n}-${s}`), detail: 'art/LP-detail' }); }
export const work = (id: string) => WORKS.find((w) => w.id === id)!;
for (const w of WORKS) {
  const ci = w.series === 'ci';
  const stateOpt: OptionDef[] = ci ? [] : [{ id: 'state', label: 'State', type: 'choice', values: [1, 2, 3].map((s) => ({ id: String(s), label: `State 0${s}` })) }];
  const common = { kind: 'print' as const, group: 'prints', material: 'Print', images: [w.slots[ci ? 0 : 1]], pos: 'center', options: stateOpt, href: w.href, lead: 'Ships in 3 weeks', text: undefined as undefined, tag: undefined as undefined, dims: undefined as undefined };
  P.push({
    ...common, id: `${w.id}.P`, code: `${w.code}.p`, slug: `${w.slug}-p`, name: ci ? 'poster print' : 'poster print, one state', sub: 'Edition 100 · 50 × 70 cm',
    description: ci ? 'Offset on uncoated stock, unframed. Edition of 100.' : 'One state of your choice. Offset on uncoated stock. Edition of 100.',
    spec: [['Edition', '100'], ['Format', '50 × 70 cm'], ['Paper', 'Uncoated offset']], note: 'Every print carries the plate number and the inventory line. Ships in 3 weeks, insured.', inv: `/// S / ${w.id.replace('-', ' / ')}`,
    accordions: [], work: { id: w.id, edition: 'poster' }
  });
  P.push({
    ...common, id: `${w.id}.A`, code: `${w.code}.a`, slug: `${w.slug}-a`, name: ci ? 'archival print' : 'archival print, one state', sub: ci ? 'Edition 25 · 40 × 54 cm' : 'Edition 25 · 40 × 56 cm',
    description: 'Pigment on cotton rag, numbered and signed. Edition of 25.',
    spec: [['Edition', '25'], ['Format', ci ? '40 × 54 cm' : '40 × 56 cm'], ['Paper', 'Cotton rag, pigment']], note: 'Every print carries the plate number and the inventory line. Ships in 3 weeks, insured.', inv: `/// S / ${w.id.replace('-', ' / ')}`,
    accordions: [], work: { id: w.id, edition: 'archival' }
  });
}

export const PRODUCTS = P;
