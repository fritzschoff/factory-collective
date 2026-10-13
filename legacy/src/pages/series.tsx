import type { ReactNode } from 'react';
import { byId, shop, group, price } from '../content/catalog';
import { Word } from '../lib/format';
import { AxisV, Coming, Diag, Hair, Img, Lens, LevelMark, MarkBar, Micro, Narrate, NotIn, Opening, OutPlate, Plate, RunOff, SectionAA } from '../components/ui';
import { IndexGrid, PlateRow, ComingTile } from '../components/shop';
import { QCap, QEnd, QOpen, Sp } from '../components/quiet';
import { SOURCES } from '../components/source';

const Ghost = ({ word = 'ATELIER', children, left = 25 }: { word?: string; children: ReactNode; left?: number }) => (
  <div className="ghostwrap"><div className="ghostwrap__g" style={{ left: `${left}%` }}><MarkBar word={word} win="red" ghost w="100%" /></div>{children}</div>
);

/* ═══════════════ Bag / Profile Series (sheet 06) ═══════════════ */
export function BagsPage() {
  const bags = shop('bag');
  const totes = group('bag', 'totes').length;
  const drawn = 15, shown = bags.length;
  const [b114, b098, b086, bnew] = ['BG-114', 'BG-098', 'BG-086', 'BG-NEW'].map(byId);
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Atelier / Accessories" meta={`${shown} bags · ${totes} tote${totes === 1 ? '' : 's'} · leather`} title="Bag / Profile Series">
        A bag is a room you agree to carry.<br /><span className="g">So it is drawn like a room: chambers, a span, a way in.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="bags/hero" ratio="1248/900" pos="50% 44%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={44} letter="A.2" light />
          <SectionAA y={56} inset={5.6} />
          <Opening x={44} y={30} w={10.4} label="BG / 0??  //bag" href={bnew.href} light />
          <LevelMark x={45} y={74} label="+ 0.00  the spine" len={170} light />
        </Plate>
      </Sp>
      <Sp s="s"><QCap l="BG / 0??  —  new, stitched panels" r="Nothing is lined. The leather carries." /></Sp>
      <Sp s="l"><Hair left="Three bags" right="Made to order · 4 weeks · lifetime repair" /></Sp>
      <div className="q-rows">
        <PlateRow product={b114} slot={b114.images[0]} ratio="768/980" pos="50% 48%" code={`${b114.code}  //${b114.name}`} line="Three chambers held apart by a bonded spine — a U-profile turned on its side." />
        <PlateRow product={b098} slot={b098.images[0]} ratio="768/980" pos="50% 48%" code={`${b098.code}  //${b098.name}`} line="The same spine, one chamber. The strap is cut from the body, not added to it." mark={<MarkBar w="82%" win="red" word="ATELIER" caption="the sign, at the height of the spine" />} />
        <PlateRow product={b086} slot={b086.images[0]} ratio="768/980" pos="50% 48%" code={`${b086.code}  //${b086.name}`} line="A folded profile. Closed it is a section; open it is a span." />
      </div>
      <Sp s="xl"><Narrate size="l">The seams that carry are left where you can see them.<br /><span className="g">Not as style. As logic.</span></Narrate></Sp>
      <Sp s="l" />
      <RunOff word="ATELIER" win="ink" />
      <Sp s="l">
        <Plate slot="bags/section" ratio="1248/420" w={1248}><SectionAA y={56} inset={5.6} /></Plate>
        <Sp s="s"><QCap l="Section A — A  ·  BG / 0??  —  chamber, spine, chamber" r="Drawn like a room, carried like a bag" /></Sp>
      </Sp>
      <Sp s="l"><Lens slot="bags/carried" ratio="1248/720" pos="50% 42%" fx={48} fy={58} cw={43} ch={23} blur={14} caption="Campaign ( 01 )  —  carried: only what lies inside the brackets is in focus" /></Sp>
      <Sp s="l" id="series"><Hair left="The series" right={`( ${shown} of ${drawn} drawn )`} /></Sp>
      <div className="g5 q-idx">
        {bags.map((b) => <article className="tile tile--idx" key={b.id}><a className="tile__a" href={b.href}><Img slot={b.images[0]} ratio="1/1.2" pos={b.pos} w={230} alt={b.code} sizes="(min-width:1440px) 230px, 40vw" /></a><p className="micro tile__c"><b>{b.code}</b></p><p className="tile__s">{b.name} &nbsp; {price(b)}</p></article>)}
        <ComingTile title={`${Word(drawn - shown)} more`.toUpperCase()} line="drawn, not yet stitched" ratio="1/1.2" />
      </div>
      <Sp s="l"><Ghost word="ATELIER"><Narrate size="l">{Word(shown)} exist.<br /><span className="g">The series was drawn as fifteen.</span></Narrate></Ghost></Sp>
      <Sp s="xl"><OutPlate slot="jewellery/hero" pos="50% 42%" title="Ordinary Objects, in silver" line="Five tools, reforged — at the scale of the wrist  →" href="/atelier/jewellery/" /></Sp>
      <Sp s="s"><QEnd sheet="Profile Series" index="BG / 086 – 114" thesis="T01" cf={<>Cf.&nbsp;&nbsp;<span>Bag / Profile Series — the text</span>&nbsp;&nbsp;<a href="/factory/bag-profile-series/">Read&nbsp;&nbsp;→</a></>} crumb={[{ label: 'Atelier', href: '/atelier/' }, { label: 'Accessories' }]} /></Sp>
    </div>
  );
}

/* ═══════════════ Jewellery (sheet 08) ═══════════════ */
export function JewelleryPage() {
  const [a, b, c, d, e] = ['BR-A', 'BR-B', 'BR-C', 'BR-D', 'BR-E'].map(byId);
  const all = [a, b, c, d, e];
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Atelier / Jewellery" meta={`${all.length} pieces · silver, gold, white gold`} title="Ordinary Objects, in silver">
        A clamp holds. A bangle holds nothing.<br /><span className="g">The gesture is identical.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="jewellery/hero" ratio="1248/900" pos="50% 44%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={34} letter="A.3" light />
          <SectionAA y={58} inset={4.8} />
          <Opening x={34} y={26} w={9.6} label="BR / 0??.a  //cuff" href={a.href} light />
          <NotIn x={80} y={76} lx={94} ly={90} label="the ground it lies on" side={-1} light />
          <Micro className="mk mk-tl is-light">Exploded&nbsp;&nbsp;1 : 1</Micro>
        </Plate>
      </Sp>
      <Sp s="s"><QCap l="BR / 0??.a  —  after a folding clasp" r="Hinge, two locking ends, a tolerance — recast in white gold" /></Sp>
      <Sp s="l"><Hair left="Three of the five" right="Each after a tool, at the same size" /></Sp>
      <div className="q-rows">
        <PlateRow product={a} slot={a.images[0]} ratio="768/900" code={`${a.code}  //cuff`} line="The clasp, opened out and made again in white gold. The magnets sit where the catch sat." />
        <PlateRow product={b} slot={b.images[0]} ratio="768/900" code={`${b.code}  //screw bangle`} line="A screw clamp at one to one. The thread still turns; it simply no longer clamps anything." mark={<MarkBar w="82%" win="red" caption="the sign, at the height of the thread" />} />
        <PlateRow product={e} slot={e.images[0]} ratio="768/640" pos="45% 50%" code={`${e.code}  //link bracelet`} line="Corrugated sheet, rolled down to the wrist. The profile is the whole design." />
      </div>
      <Sp s="xl"><Narrate size="l">Not a reference.<br /><span className="g">The object itself, in a material that outlives its job.</span></Narrate></Sp>
      <Sp s="l" />
      <RunOff word="ATELIER" win="ink" />
      <Sp s="l"><Lens slot="jewellery/BR-A" ratio="1248/700" pos="50% 46%" fx={46} fy={50} cw={43} ch={24} blur={14} caption="BR / 0??.a  —  the gold insert, riveted: only what lies inside the brackets is in focus" /></Sp>
      <Sp s="l"><Hair left="All five" right="Index · made to order, 3 – 4 weeks" /></Sp>
      <IndexGrid items={all} />
      <Sp s="l"><Hair left="The source objects" right="Found, not designed" /></Sp>
      <ul className="srclist">
        {SOURCES.map((s) => <li key={s.name}><span className="srclist__n">{s.name}</span><span className="micro">{s.de}</span><span className="srclist__c">→&nbsp;&nbsp;{s.code}</span></li>)}
      </ul>
      <Sp s="l"><Coming title="Rings&nbsp;&nbsp;( )" text="The same profiles, closed small. Not yet cast." link={<><span className="sub">Six more tools are on the bench. Only the ones that survive the translation are shown.</span>&nbsp;&nbsp;&nbsp; Notify me&nbsp;&nbsp;→</>} href="/contact/?subject=notify" /></Sp>
      <Sp s="l"><OutPlate slot="scan/life-garden" pos="50% 56%" title="Scan Series" line="Fifteen found objects, printed in ceramic and glazed by hand  →" href="/atelier/scan-series/" ratio="1248/600" /></Sp>
      <Sp s="s"><QEnd sheet="Jewellery" index="BR / 0??.a – e" thesis="T02" cf={<>Cf.&nbsp;&nbsp;<span>Ordinary Objects — the full text</span>&nbsp;&nbsp;<a href="/factory/ordinary-objects/">Read&nbsp;&nbsp;→</a></>} crumb={[{ label: 'Atelier', href: '/atelier/' }, { label: 'Jewellery' }]} /></Sp>
    </div>
  );
}

/* ═══════════════ Scan Series (sheet 10) ═══════════════ */
export function ScanPage() {
  const all = shop('scan');
  const three = ['OB-011', 'OB-021', 'OB-031'].map(byId);
  const four = ['OB-021', 'OB-022', 'OB-023', 'OB-024'].map(byId);
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Atelier / Objects" meta={`${all.length} objects · scanned, printed in ceramic, glazed by hand`} title="Scan Series">
        Nobody designed the jerrycan.<br /><span className="g">It is still better resolved than most things that were.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="scan/life-garden" ratio="1248/880" pos="50% 56%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={40} letter="A.5" light />
          <LevelMark x={62} y={50} label="+ 0.74  table" len={160} light />
          <Diag x1={40} y1={60} x2={52} y2={47} light />
          <Micro className="mk mk-code is-light" ><span style={{ left: '41%' }}>OB / 034&nbsp;&nbsp;//tray</span></Micro>
          <NotIn x={30} y={74} lx={4} ly={88} label="table, enamelled steel" light />
          <NotIn x={78} y={22} lx={95} ly={12} label="the garden" side={-1} light />
        </Plate>
      </Sp>
      <Sp s="s"><QCap l={<a href="/campaigns/02/">Campaign ( 02 )&nbsp;&nbsp;—&nbsp;&nbsp;the objects, at home</a>} r="Only what is named is for sale" /></Sp>
      <Sp s="l"><Hair left="Three objects" right="One scan each · one print file · glazed by hand" /></Sp>
      <div className="q-rows">
        <PlateRow product={three[0]} slot={three[0].images[0]} ground ratio="768/900" code={`${three[0].code}  //vase`} line="A five-litre jerrycan, printed at one to one. Every dent the original carried is still in the wall." />
        <PlateRow product={three[1]} slot={three[1].images[0]} ground ratio="768/900" code={`${three[1].code}  //catch-all`} line="A packing crate. The glaze was poured rather than applied; it found the corners by itself." mark={<MarkBar w="82%" win="red" caption="the sign, at the height of the rim" />} />
        <PlateRow product={three[2]} slot={three[2].images[0]} ground ratio="768/900" code={`${three[2].code}  //holder`} line="Bundled stock, cut and fired. It holds brushes because it always held things." />
      </div>
      <Sp s="xl"><Narrate size="l">The copy is perfect.<br /><span className="g">The glaze is not — and that is where the object starts.</span></Narrate></Sp>
      <Sp s="l" />
      <RunOff word="ATELIER" win="ink" />
      <Sp s="l"><Hair left="One file, four hands" right="The print repeats exactly. The glaze cannot." /></Sp>
      <div className="q-lead"><Micro>one scan&nbsp;&nbsp;→&nbsp;&nbsp;one print file&nbsp;&nbsp;→</Micro></div>
      <IndexGrid items={four} cols={4} ratio="1/1.02" />
      <Sp s="l"><Lens slot="scan/life-window" ratio="1248/760" pos="50% 42%" fx={52} fy={46} cw={45} ch={23} blur={15} caption="OB / 011, in use  —  the window as a lens: the object is sharp, the room is not" /></Sp>
      <Sp s="l"><Hair left="All fifteen" right="Index" /></Sp>
      <IndexGrid items={all} ratio="1/1.08" />
      <Sp s="l"><Ghost word="ATELIER"><Narrate size="l">Identical was the promise.<br /><span className="g">Identical is now the cheapest thing we own.</span></Narrate></Ghost></Sp>
      <Sp s="xl"><Hair left="The source objects" right="Found, not designed" /></Sp>
      <ul className="srcrow">
        {['jerrycan, 5 l', 'packing crate', 'bundled stock', 'ribbed sheet', 'strap buckle'].map((n) => <li key={n}><span className="micro ink">{n}</span></li>)}
      </ul>
      <Sp s="l"><OutPlate slot="jewellery/hero" pos="50% 42%" title="Ordinary Objects, in silver" line="The same thesis in metal — at the scale of the wrist  →" href="/atelier/jewellery/" ratio="1248/620" /></Sp>
      <Sp s="s"><QEnd sheet="Scan Series" index="OB / 011 – 037" thesis="T02" cf={<>Cf.&nbsp;&nbsp;<span>Ordinary Objects — the full text on reproduction and the hand</span>&nbsp;&nbsp;<a href="/factory/ordinary-objects/">Read&nbsp;&nbsp;→</a></>} crumb={[{ label: 'Atelier', href: '/atelier/' }, { label: 'Objects' }, { label: 'Scan Series' }]} /></Sp>
    </div>
  );
}
