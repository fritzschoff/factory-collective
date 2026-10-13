import type { ReactNode } from 'react';
import type { OptionDef, Product } from '../lib/types';
import { byId, price, shop } from '../content/catalog';
import { Crumb, Dim, AxisV, Diag, Img, Micro, Plate, Rule, SectionAA, ShopPoint, Museum, cx } from '../components/ui';
import { Rail, Tile } from '../components/shop';
import { SourceDrawing } from '../components/source';

const SERIES: Record<Product['kind'], { label: string; href: string; crumb: string[] }> = {
  fashion: { label: 'Fashion', href: '/atelier/fashion/', crumb: ['Atelier', 'Fashion'] },
  bag: { label: 'Profile Series', href: '/atelier/bags/', crumb: ['Atelier', 'Accessories'] },
  jewellery: { label: 'Jewellery', href: '/atelier/jewellery/', crumb: ['Atelier', 'Jewellery'] },
  scan: { label: 'Scan Series', href: '/atelier/scan-series/', crumb: ['Atelier', 'Objects', 'Scan Series'] },
  print: { label: 'Prints', href: '/studio/', crumb: ['Studio'] }
};
const GROUP_LABEL = (g: string) => g[0].toUpperCase() + g.slice(1);

/* ── options ───────────────────────────────────────────────── */
function Option({ o, p }: { o: OptionDef; p: Product }) {
  if (o.type === 'text') {
    return (
      <fieldset className="opt opt--text">
        <legend className="micro">{o.label}</legend>
        <label><input type="text" name={o.id} maxLength={o.max} placeholder="Optional" data-opt={o.id} autoComplete="off" /><span>{o.note}</span></label>
      </fieldset>
    );
  }
  const vals = o.values ?? [];
  return (
    <fieldset className={cx('opt', `opt--${o.type}`)}>
      <legend className="micro">{o.label}</legend>
      <div className="opt__v">
        {vals.map((v, i) => (
          <label key={v.id} className={cx('opt__c')}>
            <input type="radio" name={o.id} value={v.id} data-label={v.label} data-opt={o.id} defaultChecked={i === (o.type === 'size' && vals.length > 2 ? Math.floor(vals.length / 2) : 0)} required />
            {o.type === 'swatch' && <i className="opt__sw" style={{ background: v.swatch }} />}
            <span>{v.label}</span>
          </label>
        ))}
        {o.type === 'size' && o.note && <a className="opt__guide" href="#acc-measurements" data-open-acc="acc-measurements">Size guide&nbsp;&nbsp;→</a>}
      </div>
    </fieldset>
  );
}

function Gallery({ p }: { p: Product }) {
  const n = p.images.length;
  return (
    <div className="gal" data-gallery>
      <div className="gal__main">
        {p.images.map((s, i) => (
          <Img key={s} slot={s} ratio="895/1060" pos={i === 0 ? p.pos : undefined} ground={p.ground && i === 0} w={895} className={cx('gal__i', i === 0 && 'is-on')} eager={i === 0} alt={i === 0 ? `${p.code} — ${p.name}` : `${p.code} — view ${i + 1}`} sizes="(min-width:1440px) 895px, (min-width:900px) 62vw, 100vw" />
        ))}
        <span className="over">
          <span className="mk mk-axisv" style={{ left: '50%', top: 0, padding: 0 }} aria-hidden="true" />
          {n > 1 && <span className="mk gal__n" aria-hidden="true"><span data-gal-i>1</span> of {n}</span>}
          {p.dims && <Dim x1={10} x2={90} y={93.5} label={p.dims} light={!p.ground} />}
        </span>
      </div>
      {n > 1 && (
        <div className="gal__th" role="tablist" aria-label="Pictures">
          {p.images.map((s, i) => (
            <button type="button" key={s} role="tab" aria-selected={i === 0} aria-label={`Picture ${i + 1}`} data-thumb={i} className={cx(i === 0 && 'is-on')}>
              <Img slot={s} ratio="215/200" pos={i === 0 ? p.pos : undefined} ground={p.ground && i === 0} w={215} sizes="(min-width:900px) 16vw, 24vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BuyBox({ p, children }: { p: Product; children?: ReactNode }) {
  const s = SERIES[p.kind];
  return (
    <div className="buy">
      <Crumb items={[...s.crumb.map((l, i) => ({ label: l, href: i === s.crumb.length - 1 ? s.href : undefined })), ...(p.kind === 'fashion' || p.kind === 'bag' || p.kind === 'jewellery' ? [{ label: GROUP_LABEL(p.group) }] : []), { label: p.code }]} />
      <h1 className="buy__h"><span className="buy__code">{p.code}</span> <span className="buy__name">// {p.name}</span></h1>
      <p className="buy__meta">{s.label}{p.sub ? ` · ${p.sub}` : ''} · Inv. {p.inv}</p>
      <p className="buy__price" data-price>{price(p)}</p>
      <p className="buy__desc">{p.description}</p>
      <form className="buy__form" data-buy data-id={p.id} noValidate>
        {p.options.map((o) => <Option key={o.id} o={o} p={p} />)}
        <button className="pill pill--block" type="submit" data-addbtn>Add to bag</button>
        <p className="buy__note">{p.note}</p>
        <p className="buy__msg" role="status" data-msg />
      </form>
      <div className="acc">
        {p.accordions.map((a) => <details key={a.title} id={/^(measurements|dimensions)/i.test(a.title) ? 'acc-measurements' : `acc-${a.title.split(' ')[0].toLowerCase()}`}><summary>{a.title}</summary><p>{a.body}</p></details>)}
        {p.text && <a className="acc__link" href={p.text.href}>{p.text.label}&nbsp;&nbsp;→</a>}
      </div>
      {children}
    </div>
  );
}

/* ── the parts that depend on the kind ───────────────────────── */
function Spec({ p }: { p: Product }) {
  const rows = p.spec;
  const pair: [string, ReactNode][][] = [];
  for (let i = 0; i < rows.length; i += 3) pair.push(rows.slice(i, i + 3));
  return (
    <section className="pdp__sec" aria-label="Specification">
      <Rule title="Specification" />
      <div className="museum-grid">{pair.map((r, i) => <Museum key={i} rows={r} />)}</div>
    </section>
  );
}

function FashionExtras({ p }: { p: Product }) {
  const looks = ['campaign-01/look-04', 'campaign-01/look-09', 'campaign-01/look-01'];
  const wornWith = ['TR-002', 'VT-001', 'JK-001', 'BG-114'].filter((id) => id !== p.id).slice(0, 4).map(byId);
  return (
    <>
      <section className="pdp__sec" aria-label="In the campaign">
        <Rule title="In the campaign" note="— look 04, shot on the stair" right={<a href="/campaigns/01/">Campaign ( 01 )&nbsp;&nbsp;→</a>} />
        <div className="g3">
          {looks.map((s, i) => (
            <Plate key={s} slot={s} ratio="2/3" w={470} pos="50% 40%" sizes="(min-width:1440px) 470px, 100vw">
              {i === 0 && <ShopPoint px={50} py={50} lx={66} ly={80} code={p.code} name={p.name} sub="Look 04" href={p.href} id={p.id} price={price(p)} side={-1} />}
            </Plate>
          ))}
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Worn with" right={<a href="/campaigns/01/">Shop the look&nbsp;&nbsp;→</a>} items={wornWith} />
    </>
  );
}
function BagExtras({ p }: { p: Product }) {
  const others = shop('bag').filter((b) => b.id !== p.id).slice(0, 3);
  return (
    <>
      <section className="pdp__sec" aria-label="The section it comes from">
        <Rule title="The section it comes from" note="— three chambers held apart by one spine" right={<a href="/factory/tectonics-without-origin/">Tectonics without origin&nbsp;&nbsp;→</a>} />
        <Plate slot="factory/section-2" ratio="1420/400" w={1420}><SectionAA y={55} light={false} inset={5.6} /></Plate>
        <Micro className="pdp__cap">SECTION A — A&nbsp;&nbsp;·&nbsp;&nbsp;{p.code}&nbsp;&nbsp;·&nbsp;&nbsp;NOTHING IS LINED; THE LEATHER CARRIES</Micro>
      </section>
      <section className="pdp__sec">
        <div className="g2">
          <figure><Img slot="bags/carried" ratio="710/620" pos="50% 42%" w={710} /><figcaption className="pcap"><b>Campaign ( 01 )</b> // carried, look 03 <a className="link-u" href="/campaigns/01/">View the campaign&nbsp;&nbsp;→</a></figcaption></figure>
          <figure><Img slot={others[0]?.images[0] ?? 'bags/BG-098'} ratio="710/620" pos="50% 48%" w={710} /><figcaption className="pcap"><b>{others[0]?.code}</b> // {others[0]?.name} <span>{others[0] ? price(others[0]) : ''}</span></figcaption></figure>
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Cf." right={<a href="/atelier/bags/">All bags&nbsp;&nbsp;→</a>} items={[...others, { coming: true, title: 'Six more ( )', line: 'Drawn, not yet stitched' }].slice(0, 4)} />
    </>
  );
}
function JewelleryExtras({ p }: { p: Product }) {
  const idx = ['BR-C', 'BR-B', 'BR-E', 'BR-D', 'BR-A'].indexOf(p.id);
  const others = shop('jewellery').filter((j) => j.id !== p.id).slice(0, 3);
  return (
    <>
      <section className="pdp__sec" aria-label="The source object">
        <Rule title="The source object" note="— drawn 1 : 1, before anything was melted" right={<a href="/factory/ordinary-objects/">Ordinary Objects — the text&nbsp;&nbsp;→</a>} />
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
      <Rail title="Cf." note="— more ordinary objects" right={<a href="/atelier/jewellery/">All jewellery&nbsp;&nbsp;→</a>} items={[...others, { coming: true, title: 'Rings ( )', line: 'The same profiles, closed small' }].slice(0, 4)} />
    </>
  );
}
function ScanExtras({ p }: { p: Product }) {
  const four = ['OB-021', 'OB-022', 'OB-023', 'OB-024'].map(byId);
  const rest = ['OB-012', 'OB-031', 'OB-034'].map(byId).filter((x) => x.id !== p.id);
  return (
    <>
      <section className="pdp__sec">
        <Rule title="One file, four hands" note="— the print repeats exactly; the glaze cannot" right="Yours will be the fifth" />
        <div className="g4">{four.map((t) => <Tile key={t.id} p={t} ratio="1/1.06" w={320} ground sub={t.name} />)}</div>
      </section>
      <section className="pdp__sec">
        <div className="g2">
          <figure><Img slot="scan/life-window" ratio="698/620" pos="50% 45%" w={698} /><figcaption className="pcap"><b>{p.code}</b> // windowsill, single stem</figcaption></figure>
          <figure><Img slot="scan/life-shelf" ratio="698/620" pos="50% 42%" w={698} /><figcaption className="pcap"><b>{p.code}</b> // shelf, dried flowers</figcaption></figure>
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Cf." note="— the rest of the Scan Series" right={<a href="/atelier/scan-series/">All fifteen&nbsp;&nbsp;→</a>} items={[...rest, byId('BR-A')].slice(0, 4)} />
    </>
  );
}

export function ProductPage({ p }: { p: Product }) {
  return (
    <div className="w pdp">
      <div className="pdp__top">
        <Gallery p={p} />
        <BuyBox p={p} />
      </div>
      {p.kind === 'fashion' && <FashionExtras p={p} />}
      {p.kind === 'bag' && <BagExtras p={p} />}
      {p.kind === 'jewellery' && <JewelleryExtras p={p} />}
      {p.kind === 'scan' && <ScanExtras p={p} />}
    </div>
  );
}
