import type { ReactNode } from 'react';
import { byId } from '../content/catalog';
import { T01, T02, GLOSSARY } from '../content/texts';
import { AxisV, Coming, Crumb, Hair, Img, LevelMark, MarkBar, Micro, Narrate, NotIn, Opening, Pill, Plate, Rule, SectionAA, Kick, Register, cx } from '../components/ui';
import { Prose, Rows, LinkRow, Statement } from '../components/blocks';
import { Tile } from '../components/shop';
import { QEnd, QOpen, Sp, QCap } from '../components/quiet';
import { SourceDrawing, SOURCES } from '../components/source';
import { price } from '../content/catalog';

const Ghost = ({ word = 'FACTORY', children, left = 25 }: { word?: string; children: ReactNode; left?: number }) => (
  <div className="ghostwrap"><div className="ghostwrap__g" style={{ left: `${left}%` }}><MarkBar word={word} win="red" ghost w="100%" /></div>{children}</div>
);
const TEXTS = [
  { no: '01', t: 'Tectonics without origin', d: 'Objects from a world that was never built. The invented fragment is not part of a whole — it is the place where the whole is missing.', min: '7 min', href: '/factory/tectonics-without-origin/', slot: 'factory/section-1', pos: 'center' },
  { no: '02', t: 'Ordinary Objects', d: 'A found tool, reforged or reproduced, is not a quotation. It is the thing itself, in another material.', min: '6 min', href: '/factory/ordinary-objects/', slot: 'jewellery/hero', pos: '50% 42%' },
  { no: '03', t: 'Bag / Profile Series', d: 'Not an accessory — mobile architecture at the scale of the body. Carrying read as a spatial problem.', min: '5 min', href: '/factory/bag-profile-series/', slot: 'bags/hero', pos: '50% 46%' }
];

/** FACTORY hub (sheet 12) */
export function FactoryPage() {
  const came = ['BR-A', 'OB-011', 'BG-114', 'JK-001'].map(byId);
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
        <Rows rows={TEXTS.map((x) => ({ no: x.no, title: x.t, meta: x.d, go: <>Text, [ year ] · {x.min}<br />Read&nbsp;&nbsp;→</>, href: x.href, img: { slot: x.slot, pos: x.pos } }))} />
      </Sp>
      <Sp s="l"><Ghost><Narrate size="l">The invented fragment is not part of a whole.<br /><span className="g">It is the place where the whole is missing.</span></Narrate></Ghost></Sp>
      <Sp s="xl" id="theses">
        <Hair left="Theses" right="( 2 of n )&nbsp;&nbsp;·&nbsp;&nbsp;binding until withdrawn" />
        <div className="theses">
          {[['T01', '// profile', 'The construction profile as a basic form', 'Fashion · Bags', false, '/factory/tectonics-without-origin/', 't01'], ['T02', '// ordinary object', 'The found tool, taken at face value', 'Jewellery · Scan Series', false, '/factory/ordinary-objects/', 't02'], ['T03', '( )', 'In work', '', true, '', ''], ['T04', '( )', 'In work', '', true, '', '']].map(([n, t, d, u, red, href, id]: any) => (
            <article key={n} id={id || undefined} className={cx('thesis', red && 'is-red')}>
              <p><b>{n}</b>&nbsp;&nbsp;{t}</p><p className="thesis__d">{d}</p>{u && <p className="micro">Used in: {u}</p>}
              {href && <a className="link-u" href={href}>Read&nbsp;&nbsp;→</a>}
            </article>
          ))}
        </div>
      </Sp>
      <Sp s="l">
        <Hair left="What came out of it" right={<a href="/atelier/">All works&nbsp;&nbsp;→</a>} />
        <div className="g4 q-idx">
          {came.map((p, i) => (
            <article className="tile tile--idx" key={p.id}>
              <a className="tile__a" href={p.href}><Img slot={p.images[0]} ratio="1/1.2" pos={p.pos} ground={p.ground} w={290} alt={p.code} sizes="(min-width:1440px) 290px, 45vw" /></a>
              <p className="micro tile__c"><b>{p.code}</b><span>Thesis {i === 0 || i === 1 ? 'T02' : 'T01'}</span></p>
              <p className="tile__s">{p.name} &nbsp; {price(p)}</p>
            </article>
          ))}
        </div>
      </Sp>
      <Sp s="l"><LinkRow links={[{ label: 'Publishing', href: '/factory/publishing/' }, { label: 'Archive', href: '/factory/archive/' }, { label: 'Glossary', href: '/factory/glossary/' }, { label: 'Lectures', href: '/factory/lectures/' }]} /></Sp>
      <Sp s="m"><QEnd sheet="Factory" index="T01 – T04" thesis="T01 · T02" crumb={[{ label: 'Factory' }]} /></Sp>
    </div>
  );
}

const Reader = ({ items }: { items: { no: string; t: string; m: string; href: string; here?: boolean }[] }) => (
  <>
    <Sp s="l"><Hair left="Texts" right="( 3 )" /></Sp>
    <Rows rows={items.map((x) => ({ no: x.no, title: x.t, meta: x.m, go: x.here ? 'You are here' : <>Read&nbsp;&nbsp;→</>, href: x.href, here: x.here }))} />
  </>
);
const READER = [
  { no: '01', t: 'Tectonics without origin', m: 'Objects from a world that was never built', href: '/factory/tectonics-without-origin/' },
  { no: '02', t: 'Ordinary Objects', m: 'Found tools, reforged and reproduced', href: '/factory/ordinary-objects/' },
  { no: '03', t: 'Bag / Profile Series', m: 'Mobile architecture at the scale of the body', href: '/factory/bag-profile-series/' }
];

/** TEXT T01 (sheet 13) */
export function TextT01() {
  const works = ['BG-114', 'BG-NEW', 'JK-001', 'VT-001'].map(byId);
  const sub = ['U, turned on its side', 'A bonded spine', 'Shoulder as lintel', 'A diagonal brace'];
  const sh3 = byId('SH-003');
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
          <Opening x={34} y={62} w={12} label="SH / 003  //shirt  →  shop" href={sh3.href} light />
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
          {works.map((p, i) => (
            <article className="tile tile--idx" key={p.id}>
              <a className="tile__a" href={p.href}><Img slot={p.images[0]} ratio="1/1.45" pos={p.pos} w={290} alt={p.code} sizes="(min-width:1440px) 290px, 45vw" /></a>
              <p className="micro tile__c"><b>{p.code}</b></p>
              <p className="tile__s">{p.name} &nbsp; {sub[i]}</p>
              <p className="tile__b"><span>{price(p)}</span><button type="button" data-quickadd={p.id}>Add</button></p>
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
export function TextT02() {
  const works = ['BR-A', 'BR-B', 'OB-011', 'OB-021'].map(byId);
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
      <Sp s="m"><QEnd sheet="Text T02" index="a" thesis="T02 // ordinary object" cf={<>Cf.&nbsp;&nbsp;<span>Tectonics without origin</span>&nbsp;&nbsp;<a href="/factory/tectonics-without-origin/">Read&nbsp;&nbsp;→</a>&nbsp;&nbsp;&nbsp;<span>Layer Paintings — repetition and variation, in the Studio</span>&nbsp;&nbsp;<a href="/studio/layer-paintings/">View&nbsp;&nbsp;→</a></>} crumb={[{ label: 'Factory', href: '/factory/' }, { label: 'Texts' }, { label: 'Ordinary Objects' }]} /></Sp>
    </div>
  );
}

/** TEXT T03 — announced, not written yet */
export function TextT03() {
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Factory / Texts / T03" meta="in work" title={<>Bag / Profile Series <span className="r">( )</span></>}>Not yet written.<br /><span className="g">The bags are already for sale; the sentence they came out of is still being drawn.</span></QOpen>
      <Sp s="l"><Coming title="T03&nbsp;&nbsp;( )&nbsp;&nbsp;in work" text="Mobile architecture at the scale of the body. Carrying, read as a spatial problem." link="Notify me when it is published&nbsp;&nbsp;→" href="/contact/?subject=notify-t03" /></Sp>
      <Sp s="m"><Pill href="/atelier/bags/">The bags&nbsp;&nbsp;( 4 )&nbsp;&nbsp;→</Pill></Sp>
      <Reader items={READER.map((x, i) => ({ ...x, here: i === 2 }))} />
      <Sp s="m"><QEnd sheet="Text T03" index="—" thesis="T01" crumb={[{ label: 'Factory', href: '/factory/' }, { label: 'Texts' }, { label: 'Bag / Profile Series' }]} /></Sp>
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
