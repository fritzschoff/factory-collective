import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { BuyForm } from '@/components/shop/BuyForm';
import { GalleryClient } from '@/components/shop/Gallery';
import { Soon } from '@/components/soon';
import { SourceDrawing } from '@/components/source';
import { Rail, Tile } from '@/components/tiles';
import { AxisV, Crumb, Diag, Dim, Img, Micro, Museum, Plate, Rule, SectionAA, ShopPoint } from '@/components/ui';
import { productPages } from '@/content/pages';
import { getCatalog, type Catalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';
import { pageMetadata } from '@/lib/seo';
import type { Product, ProductKind } from '@/lib/types';

/** The kinds that have a product page of their own (prints live on their work page). */
export type ShopKind = Exclude<ProductKind, 'print'>;

const SERIES: Record<ProductKind, { label: string; href: string; crumb: string[] }> = {
  fashion: { label: 'Fashion', href: '/atelier/fashion/', crumb: ['Atelier', 'Fashion'] },
  bag: { label: 'Profile Series', href: '/atelier/bags/', crumb: ['Atelier', 'Accessories'] },
  jewellery: { label: 'Jewellery', href: '/atelier/jewellery/', crumb: ['Atelier', 'Jewellery'] },
  scan: { label: 'Scan Series', href: '/atelier/scan-series/', crumb: ['Atelier', 'Objects', 'Scan Series'] },
  print: { label: 'Prints', href: '/studio/', crumb: ['Studio'] },
};
const GROUP_LABEL = (g: string) => g[0].toUpperCase() + g.slice(1);

/* ── the route logic, shared by the four product routes ───────── */

/** One static page per product of this kind. */
export async function productStaticParams(kind: ShopKind): Promise<{ slug: string }[]> {
  return (await getCatalog()).shop(kind).map((p) => ({ slug: p.slug }));
}

export async function productMetadata(kind: ShopKind, slug: string): Promise<Metadata> {
  const cat = await getCatalog();
  const p = cat.bySlug(kind, slug);
  const entry = p && productPages(cat).find((e) => e.path === p.href);
  return entry ? pageMetadata(entry) : {};
}

/** The page of a product; a slug the catalogue does not know is a 404. */
export async function ProductRoute({ kind, slug }: { kind: ShopKind; slug: string }) {
  const cat = await getCatalog();
  const p = cat.bySlug(kind, slug);
  if (!p) notFound();
  return <ProductPage p={p} cat={cat} />;
}

/* ── the page ─────────────────────────────────────────────────── */

function Gallery({ p }: { p: Product }) {
  const slides = p.images.map((s, i) => (
    <Img key={s} slot={s} ratio="895/1060" pos={i === 0 ? p.pos : undefined} ground={p.ground && i === 0} w={895} eager={i === 0} alt={i === 0 ? `${p.code} — ${p.name}` : `${p.code} — view ${i + 1}`} sizes="(min-width:1440px) 895px, (min-width:900px) 62vw, 100vw" />
  ));
  const thumbs = p.images.map((s, i) => <Img key={s} slot={s} ratio="215/200" pos={i === 0 ? p.pos : undefined} ground={p.ground && i === 0} w={215} sizes="(min-width:900px) 16vw, 24vw" />);
  const overlay = (
    <span className="over">
      <span className="mk mk-axisv" style={{ left: '50%', top: 0, padding: 0 }} aria-hidden="true" />
      {p.dims && <Dim x1={10} x2={90} y={93.5} label={p.dims} light={!p.ground} />}
    </span>
  );
  return <GalleryClient slides={slides} thumbs={thumbs} overlay={overlay} />;
}

/** The link to the text a product comes out of: a link, or "coming soon" while the text is not written. */
function TextLink({ p }: { p: Product }) {
  if (!p.text) return null;
  return 'soon' in p.text
    ? <Soon k={p.text.soon} className="acc__link">{p.text.label}</Soon>
    : <A className="acc__link" href={p.text.href}>{p.text.label}&nbsp;&nbsp;→</A>;
}

export function BuyBox({ p, children }: { p: Product; children?: ReactNode }) {
  const s = SERIES[p.kind];
  const crumbs = [
    ...s.crumb.map((l, i) => ({ label: l, href: i === s.crumb.length - 1 ? s.href : undefined })),
    ...(p.kind === 'fashion' || p.kind === 'bag' || p.kind === 'jewellery' ? [{ label: GROUP_LABEL(p.group) }] : []),
    { label: p.code },
  ];
  return (
    <div className="buy">
      <Crumb items={crumbs} />
      <h1 className="buy__h"><span className="buy__code">{p.code}</span> <span className="buy__name">{'// '}{p.name}</span></h1>
      <p className="buy__meta">{s.label}{p.sub ? ` · ${p.sub}` : ''} · Inv. {p.inv}</p>
      <p className="buy__price">{fmtPrice(p.priceCents)}</p>
      <p className="buy__desc">{p.description}</p>
      <BuyForm product={toSummary(p)} note={p.note} />
      <div className="acc">
        {p.accordions.map((a) => (
          <details key={a.title} id={/^(measurements|dimensions)/i.test(a.title) ? 'acc-measurements' : `acc-${a.title.split(' ')[0].toLowerCase()}`}><summary>{a.title}</summary><p>{a.body}</p></details>
        ))}
        <TextLink p={p} />
      </div>
      {children}
    </div>
  );
}

/* ── the parts that depend on the kind ───────────────────────── */

function Spec({ p }: { p: Product }) {
  const rows: [string, ReactNode][][] = [];
  for (let i = 0; i < p.spec.length; i += 3) rows.push(p.spec.slice(i, i + 3));
  return (
    <section className="pdp__sec" aria-label="Specification">
      <Rule title="Specification" />
      <div className="museum-grid">{rows.map((r, i) => <Museum key={i} rows={r} />)}</div>
    </section>
  );
}

function FashionExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const looks = ['campaign-01/look-04', 'campaign-01/look-09', 'campaign-01/look-01'];
  const wornWith = cat.pick(['TR-002', 'VT-001', 'JK-001', 'BG-114']).filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <>
      <section className="pdp__sec" aria-label="In the campaign">
        <Rule title="In the campaign" note="— look 04, shot on the stair" right={<A href="/campaigns/01/">Campaign ( 01 )&nbsp;&nbsp;→</A>} />
        <div className="g3">
          {looks.map((s, i) => (
            <Plate key={s} slot={s} ratio="2/3" w={470} pos="50% 40%" sizes="(min-width:1440px) 470px, 100vw">
              {i === 0 && <ShopPoint px={50} py={50} lx={66} ly={80} code={p.code} name={p.name} sub="Look 04" href={p.href} product={toSummary(p)} price={fmtPrice(p.priceCents)} side={-1} />}
            </Plate>
          ))}
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Worn with" right={<A href="/campaigns/01/">Shop the look&nbsp;&nbsp;→</A>} items={wornWith} />
    </>
  );
}

function BagExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const others = cat.shop('bag').filter((b) => b.id !== p.id).slice(0, 3);
  const first = others[0];
  return (
    <>
      <section className="pdp__sec" aria-label="The section it comes from">
        <Rule title="The section it comes from" note="— three chambers held apart by one spine" right={<A href="/factory/tectonics-without-origin/">Tectonics without origin&nbsp;&nbsp;→</A>} />
        <Plate slot="factory/section-2" ratio="1420/400" w={1420}><SectionAA y={55} light={false} inset={5.6} /></Plate>
        <Micro className="pdp__cap">SECTION A — A&nbsp;&nbsp;·&nbsp;&nbsp;{p.code}&nbsp;&nbsp;·&nbsp;&nbsp;NOTHING IS LINED; THE LEATHER CARRIES</Micro>
      </section>
      <section className="pdp__sec">
        <div className="g2">
          <figure><Img slot="bags/carried" ratio="710/620" pos="50% 42%" w={710} /><figcaption className="pcap"><b>Campaign ( 01 )</b>{' // '}carried, look 03 <A className="link-u" href="/campaigns/01/">View the campaign&nbsp;&nbsp;→</A></figcaption></figure>
          {first && <figure><Img slot={first.images[0]} ratio="710/620" pos="50% 48%" w={710} /><figcaption className="pcap"><b>{first.code}</b>{' // '}{first.name} <span>{fmtPrice(first.priceCents)}</span></figcaption></figure>}
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Cf." right={<A href="/atelier/bags/">All bags&nbsp;&nbsp;→</A>} items={[...others, { coming: true, title: 'Six more ( )', line: 'Drawn, not yet stitched' }].slice(0, 4)} />
    </>
  );
}

function JewelleryExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const idx = ['BR-C', 'BR-B', 'BR-E', 'BR-D', 'BR-A'].indexOf(p.id);
  const others = cat.shop('jewellery').filter((j) => j.id !== p.id).slice(0, 3);
  return (
    <>
      <section className="pdp__sec" aria-label="The source object">
        <Rule title="The source object" note="— drawn 1 : 1, before anything was melted" right={<A href="/factory/ordinary-objects/">Ordinary Objects — the text&nbsp;&nbsp;→</A>} />
        <div className="src">
          <div className="src__t">
            <p className="src__l">{p.sub ? `A ${p.sub.replace('after a ', '')} is already ` : ''}{p.id === 'BR-A' ? 'a hinge, two locking ends and a tolerance.' : 'a form with a job. Nothing had to be invented for the wrist.'}<br /><span className="g">Nothing had to be invented for the wrist. It was simply made out of a better material, at the same size.</span></p>
            <p className="src__s">Found&nbsp;&nbsp;→&nbsp;&nbsp;Measured&nbsp;&nbsp;→&nbsp;&nbsp;Cast&nbsp;&nbsp;→&nbsp;&nbsp;Riveted&nbsp;&nbsp;→&nbsp;&nbsp;Set</p>
          </div>
          <SourceDrawing only={idx >= 0 ? idx : 4} made={false} className="src__d" ground={false} />
        </div>
      </section>
      <section className="pdp__sec" aria-label="Exploded view">
        <Plate slot="jewellery/exploded" ratio="1420/760" pos="50% 42%" w={1420}>
          <AxisV x={33.3} /><AxisV x={66.6} />
          <Micro className="mk mk-ex">EXPLODED&nbsp;&nbsp;—&nbsp;&nbsp;1 : 1</Micro>
          <Diag x1={33} y1={22} x2={52} y2={10} label="Gold insert, riveted" lx={34} ly={5} lw={22} />
          <Diag x1={32} y1={48} x2={12} y2={86} label="Magnet closure, hidden" lx={5} ly={88} lw={22} />
          <Diag x1={47} y1={82} x2={62} y2={90} label="Stone: white · green · red" lx={50} ly={92} lw={26} />
        </Plate>
      </section>
      <Spec p={p} />
      <Rail title="Cf." note="— more ordinary objects" right={<A href="/atelier/jewellery/">All jewellery&nbsp;&nbsp;→</A>} items={[...others, { coming: true, title: 'Rings ( )', line: 'The same profiles, closed small' }].slice(0, 4)} />
    </>
  );
}

function ScanExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const four = cat.pick(['OB-021', 'OB-022', 'OB-023', 'OB-024']);
  const rest = cat.pick(['OB-012', 'OB-031', 'OB-034']).filter((x) => x.id !== p.id);
  return (
    <>
      <section className="pdp__sec">
        <Rule title="One file, four hands" note="— the print repeats exactly; the glaze cannot" right="Yours will be the fifth" />
        <div className="g4">{four.map((t) => <Tile key={t.id} p={t} ratio="1/1.06" w={320} ground sub={t.name} />)}</div>
      </section>
      <section className="pdp__sec">
        <div className="g2">
          <figure><Img slot="scan/life-window" ratio="698/620" pos="50% 45%" w={698} /><figcaption className="pcap"><b>{p.code}</b>{' // '}windowsill, single stem</figcaption></figure>
          <figure><Img slot="scan/life-shelf" ratio="698/620" pos="50% 42%" w={698} /><figcaption className="pcap"><b>{p.code}</b>{' // '}shelf, dried flowers</figcaption></figure>
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Cf." note="— the rest of the Scan Series" right={<A href="/atelier/scan-series/">All fifteen&nbsp;&nbsp;→</A>} items={[...rest, ...cat.pick(['BR-A'])].slice(0, 4)} />
    </>
  );
}

export function ProductPage({ p, cat }: { p: Product; cat: Catalog }) {
  return (
    <div className="w pdp">
      <div className="pdp__top">
        <Gallery p={p} />
        <BuyBox p={p} />
      </div>
      {p.kind === 'fashion' && <FashionExtras p={p} cat={cat} />}
      {p.kind === 'bag' && <BagExtras p={p} cat={cat} />}
      {p.kind === 'jewellery' && <JewelleryExtras p={p} cat={cat} />}
      {p.kind === 'scan' && <ScanExtras p={p} cat={cat} />}
    </div>
  );
}
