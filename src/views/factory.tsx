import type { ReactNode } from 'react';
import { Prose, Rows, LinkRow, Statement } from '@/components/blocks';
import { A } from '@/components/link';
import { QEnd, QOpen, Sp, QCap } from '@/components/quiet';
import { QuickAddButton } from '@/components/shop/QuickAdd';
import { Soon } from '@/components/soon';
import { SourceDrawing, SOURCES } from '@/components/source';
import { Tile } from '@/components/tiles';
import { AxisV, Crumb, Hair, Img, LevelMark, MarkBar, Micro, Narrate, NotIn, Opening, Pill, Plate, Rule, SectionAA, Kick, Register, cx } from '@/components/ui';
import { T01, T02, GLOSSARY } from '@/content/texts';
import type { SoonKey } from '@/content/soon';
import { getCatalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';

const Ghost = ({ word = 'FACTORY', children, left = 25 }: { word?: string; children: ReactNode; left?: number }) => (
  <div className="ghostwrap"><div className="ghostwrap__g" style={{ left: `${left}%` }}><MarkBar word={word} win="red" ghost w="100%" /></div>{children}</div>
);
const TEXTS: { no: string; t: string; d: string; min: string; href?: string; soon?: SoonKey; slot: string; pos: string }[] = [
  { no: '01', t: 'Tectonics without origin', d: 'Objects from a world that was never built. The invented fragment is not part of a whole — it is the place where the whole is missing.', min: '7 min', href: '/factory/tectonics-without-origin/', slot: 'factory/section-1', pos: 'center' },
  { no: '02', t: 'Ordinary Objects', d: 'A found tool, reforged or reproduced, is not a quotation. It is the thing itself, in another material.', min: '6 min', href: '/factory/ordinary-objects/', slot: 'jewellery/hero', pos: '50% 42%' },
  { no: '03', t: 'Bag / Profile Series', d: 'Not an accessory — mobile architecture at the scale of the body. Carrying read as a spatial problem.', min: '5 min', soon: 'bagText', slot: 'bags/hero', pos: '50% 46%' }
];

const THESES: { n: string; t: string; d: string; used?: string; href?: string; id?: string }[] = [
  { n: 'T01', t: '// profile', d: 'The construction profile as a basic form', used: 'Fashion · Bags', href: '/factory/tectonics-without-origin/', id: 't01' },
  { n: 'T02', t: '// ordinary object', d: 'The found tool, taken at face value', used: 'Jewellery · Scan Series', href: '/factory/ordinary-objects/', id: 't02' },
  { n: 'T03', t: '( )', d: 'In work' },
  { n: 'T04', t: '( )', d: 'In work' },
];
const THESIS: Record<string, string> = { 'BR-A': 'T02', 'OB-011': 'T02', 'BG-114': 'T01', 'JK-001': 'T01' };

/** FACTORY hub (sheet 12) */
export async function FactoryPage() {
  const cat = await getCatalog();
  const came = cat.pick(['BR-A', 'OB-011', 'BG-114', 'JK-001']);
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Factory&nbsp;&nbsp;( to think )&nbsp;&nbsp;the drawing room" meta="3 texts · 2 theses · DE / EN" title="Factory">
        It carries nothing.<br /><span className="g">And yet it insists on a logic of carrying.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="factory/section-1" ratio="1248/420" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw"><AxisV x={34} letter="A.1" light /><SectionAA y={55} inset={5.6} /></Plate>
        <Sp s="s"><QCap l="Section A — A&nbsp;&nbsp;·&nbsp;&nbsp;T01 // profile" r="The building was already there. The system never was." /></Sp>
      </Sp>
      <Sp s="l" id="texts">
        <Hair left="Texts" right="( 3 )" />
        <Rows rows={TEXTS.map((x) => ({ no: x.no, title: x.t, meta: x.d, go: <>Text, [ year ] · {x.min}<br />Read&nbsp;&nbsp;→</>, href: x.href, soon: x.soon, img: { slot: x.slot, pos: x.pos } }))} />
      </Sp>
      <Sp s="l"><Ghost><Narrate size="l">The invented fragment is not part of a whole.<br /><span className="g">It is the place where the whole is missing.</span></Narrate></Ghost></Sp>
      <Sp s="xl" id="theses">
        <Hair left="Theses" right="( 2 of n )&nbsp;&nbsp;·&nbsp;&nbsp;binding until withdrawn" />
        <div className="theses">
          {THESES.map((x) => (
            <article key={x.n} id={x.id} className={cx('thesis', !x.href && 'is-red')}>
              <p><b>{x.n}</b>&nbsp;&nbsp;{x.t}</p>
              <p className="thesis__d">{x.href ? x.d : <Soon k="theses" brackets={false}>{x.d}</Soon>}</p>
              {x.used && <p className="micro">Used in: {x.used}</p>}
              {x.href && <A className="link-u" href={x.href}>Read&nbsp;&nbsp;→</A>}
            </article>
          ))}
        </div>
      </Sp>
      <Sp s="l">
        <Hair left="What came out of it" right={<A href="/atelier/">All works&nbsp;&nbsp;→</A>} />
        <div className="g4 q-idx">
          {came.map((p) => (
            <article className="tile tile--idx" key={p.id}>
              <A className="tile__a" href={p.href}><Img slot={p.images[0]} ratio="1/1.2" pos={p.pos} ground={p.ground} w={290} alt={p.code} sizes="(min-width:1440px) 290px, 45vw" /></A>
              <p className="micro tile__c"><b>{p.code}</b><span>Thesis {THESIS[p.id]}</span></p>
              <p className="tile__s">{p.name} &nbsp; {fmtPrice(p.priceCents)}</p>
            </article>
          ))}
        </div>
      </Sp>
      <Sp s="l"><LinkRow links={[{ label: 'Publishing', soon: 'publishing' }, { label: 'Archive', soon: 'archive' }, { label: 'Glossary', href: '/factory/glossary/' }, { label: 'Lectures', soon: 'lectures' }]} /></Sp>
      <Sp s="m"><QEnd sheet="Factory" index="T01 – T04" thesis="T01 · T02" crumb={[{ label: 'Factory' }]} /></Sp>
    </div>
  );
}

const Reader = ({ items }: { items: { no: string; t: string; m: string; href?: string; soon?: SoonKey; here?: boolean }[] }) => (
  <>
    <Sp s="l"><Hair left="Texts" right="( 3 )" /></Sp>
    <Rows rows={items.map((x) => ({ no: x.no, title: x.t, meta: x.m, go: x.here ? 'You are here' : <>Read&nbsp;&nbsp;→</>, href: x.href, soon: x.soon, here: x.here }))} />
  </>
);
const READER: { no: string; t: string; m: string; href?: string; soon?: SoonKey }[] = [
  { no: '01', t: 'Tectonics without origin', m: 'Objects from a world that was never built', href: '/factory/tectonics-without-origin/' },
  { no: '02', t: 'Ordinary Objects', m: 'Found tools, reforged and reproduced', href: '/factory/ordinary-objects/' },
  { no: '03', t: 'Bag / Profile Series', m: 'Mobile architecture at the scale of the body', soon: 'bagText' }
];

const SUB: Record<string, string> = { 'BG-114': 'U, turned on its side', 'BG-NEW': 'A bonded spine', 'JK-001': 'Shoulder as lintel', 'VT-001': 'A diagonal brace' };

/** TEXT T01 (sheet 13) */
export async function TextT01() {
  const cat = await getCatalog();
  const works = cat.pick(['BG-114', 'BG-NEW', 'JK-001', 'VT-001']);
  const sh3 = cat.byId('SH-003');
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Factory / Texts / T01" meta="Text, [ year ] · 7 min · DE / EN" title="Tectonics without origin" sub="— objects from a world that was never built" />
      <Sp s="m">
        <Plate slot="factory/stair" ratio="1248/760" pos="50% 30%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={30} letter="A.1" light />
          <SectionAA y={56} inset={5.6} />
          <LevelMark x={31} y={30} label="+ 2.40  landing" len={170} light />
          <NotIn x={86} y={40} lx={96} ly={20} label="the stair" side={-1} light />
          {sh3 && <Opening x={34} y={62} w={12} label="SH / 003  //shirt  →  shop" href={sh3.href} light />}
        </Plate>
        <div className="pills pills--after"><Pill href="/atelier/fashion/">Discover the collection&nbsp;&nbsp;→</Pill><Pill href="/campaigns/01/" ghost>Shop this look&nbsp;&nbsp;→</Pill><Micro className="pills__n">Every piece named in this text is one click from the shop</Micro></div>
      </Sp>
      <Sp s="l"><Prose a={T01.a1} b={T01.a2} /></Sp>
      <Sp s="m"><Narrate size="l">It carries nothing.<br /><span className="g">And yet it insists on a logic of carrying.</span></Narrate></Sp>
      <Sp s="l"><MarkBar word="FACTORY" win="ink" w="62%" style={{ marginLeft: '38%' }} /></Sp>
      <Sp s="l">
        <Plate slot="factory/section-3" ratio="1248/420" w={1248}><SectionAA y={55} inset={5.6} /></Plate>
        <Sp s="s"><QCap l="Section A — A&nbsp;&nbsp;·&nbsp;&nbsp;BG / 0??&nbsp;&nbsp;—&nbsp;&nbsp;a chamber, a span, a way in" r="Drawn like a room, carried like a bag" /></Sp>
      </Sp>
      <Sp s="l"><Prose a={T01.b1} b={T01.b2} /></Sp>
      <Sp s="xl"><Ghost><Narrate size="l">Too precise to be accidental.<br /><span className="g">Too autonomous to obey a function.</span></Narrate></Ghost></Sp>
      <Sp s="l">
        <Hair left="Works from this text" right="Thesis T01 // profile" />
        <div className="g4 q-idx">
          {works.map((p) => (
            <article className="tile tile--idx" key={p.id}>
              <A className="tile__a" href={p.href}><Img slot={p.images[0]} ratio="1/1.45" pos={p.pos} w={290} alt={p.code} sizes="(min-width:1440px) 290px, 45vw" /></A>
              <p className="micro tile__c"><b>{p.code}</b></p>
              <p className="tile__s">{p.name} &nbsp; {SUB[p.id]}</p>
              <p className="tile__b"><span>{fmtPrice(p.priceCents)}</span><QuickAddButton product={toSummary(p)} /></p>
            </article>
          ))}
        </div>
        <div className="pills pills--after"><Pill href="/atelier/fashion/">Shop Fashion&nbsp;&nbsp;( 18 )&nbsp;&nbsp;→</Pill><Pill href="/atelier/bags/">Shop Bags&nbsp;&nbsp;( 4 )&nbsp;&nbsp;→</Pill><Pill href="/atelier/" ghost>The whole Atelier&nbsp;&nbsp;→</Pill></div>
      </Sp>
      <Reader items={READER.map((x, i) => ({ ...x, here: i === 0 }))} />
      <Sp s="m"><QEnd sheet="Text T01" index="a" thesis="T01 // profile" crumb={[{ label: 'Factory', href: '/factory/' }, { label: 'Texts' }, { label: 'Tectonics without origin' }]} /></Sp>
    </div>
  );
}

/** TEXT T02 (sheet 14) */
export async function TextT02() {
  const cat = await getCatalog();
  const works = cat.pick(['BR-A', 'BR-B', 'OB-011', 'OB-021']);
  return (
    <div className="q">
      <Sp s="m" className="q-top" />
      <section className="paper-hero">
        <div className="paper-hero__h">
          <Kick>Factory / Texts / T02</Kick>
          <h1 className="title q-title">Ordinary Objects</h1>
          <p className="q-sub">— on reproduction, the hand, and what a found form owes to nobody</p>
        </div>
        <dl className="museum paper-hero__m"><div><dt>Text</dt><dd>[ year ]</dd></div><div><dt>Read</dt><dd>6 min</dd></div><div><dt>Lang.</dt><dd>DE / EN</dd></div></dl>
        <p className="micro paper-hero__c">The five source objects of the jewellery line&nbsp;&nbsp;<span>— drawn 1 : 1, before anything was melted</span></p>
        <SourceDrawing made={false} className="paper-hero__d" ground={false} />
      </section>
      <Sp s="s"><Crumb items={[{ label: 'Factory', href: '/factory/' }, { label: 'Texts' }, { label: 'Ordinary Objects' }]} /></Sp>
      <Sp s="m"><Prose a={T02.a1} b={T02.a2} /></Sp>
      <Sp s="l">
        <div className="g2 routes">
          <figure><Img slot="jewellery/hero" ratio="612/560" pos="50% 42%" w={612} sizes="(min-width:1440px) 612px, 50vw" /><figcaption><b>Route one — reforged</b><span>Found → measured → cast → riveted → set.<br />One object. The hand is in the whole of it.</span><Pill href="/atelier/jewellery/">Shop the Jewellery&nbsp;&nbsp;( 5 )&nbsp;&nbsp;→</Pill></figcaption></figure>
          <figure><Img slot="scan/OB-021" ratio="612/560" ground w={612} sizes="(min-width:1440px) 612px, 50vw" /><figcaption><b>Route two — reproduced</b><span>Found → scanned → printed → glazed.<br />Any number of bodies. The hand is only in the surface.</span><Pill href="/atelier/scan-series/">Shop the Scan Series&nbsp;&nbsp;( 15 )&nbsp;&nbsp;→</Pill></figcaption></figure>
        </div>
      </Sp>
      <Sp s="xl"><Statement>The copy is perfect.<br /><span className="g">The glaze is not — and that is the point.</span></Statement></Sp>
      <Sp s="m"><Prose a={T02.b1} b={T02.b2} /></Sp>
      <Sp s="l">
        <Rule title="Works from this text" right="Thesis T02 // ordinary object" />
        <div className="g4">{works.map((p) => <Tile key={p.id} p={p} ratio="1/1.2" w={290} ground={p.ground} sub={p.sub} />)}</div>
      </Sp>
      <Sp s="l">
        <Rule title="Source objects" note="( 5 )  // jewellery" />
        <Register rows={SOURCES.map((s, i) => ({ no: String(i + 1).padStart(2, '0'), name: s.name, meta: <>{s.de} → {s.code} {s.made}</>, href: `/atelier/jewellery/${['br-c', 'br-b', 'br-e', 'br-d', 'br-a'][i]}/`, link: 'View' }))} />
      </Sp>
      <Sp s="m"><QEnd sheet="Text T02" index="a" thesis="T02 // ordinary object" cf={<>Cf.&nbsp;&nbsp;<span>Tectonics without origin</span>&nbsp;&nbsp;<A href="/factory/tectonics-without-origin/">Read&nbsp;&nbsp;→</A>&nbsp;&nbsp;&nbsp;<span>Layer Paintings — repetition and variation, in the Studio</span>&nbsp;&nbsp;<A href="/studio/layer-paintings/">View&nbsp;&nbsp;→</A></>} crumb={[{ label: 'Factory', href: '/factory/' }, { label: 'Texts' }, { label: 'Ordinary Objects' }]} /></Sp>
    </div>
  );
}

export function GlossaryPage() {
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Factory / Glossary" meta={`${GLOSSARY.length} entries`} title="Glossary">The words the site uses, and what they point at.</QOpen>
      <Sp s="l"><dl className="gloss">{GLOSSARY.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></Sp>
      <Sp s="m"><QEnd sheet="Glossary" index="G / 01 – 10" crumb={[{ label: 'Factory', href: '/factory/' }, { label: 'Glossary' }]} /></Sp>
    </div>
  );
}
