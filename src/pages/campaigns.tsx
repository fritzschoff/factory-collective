import type { ReactNode } from 'react';
import { byId } from '../content/catalog';
import { AxisH, AxisV, Coming, Diag, Hair, Img, LevelMark, MarkBar, Micro, Narrate, NotIn, OutPlate, Plate, Redact, SectionAA, ShopPoint, Steps, TitleBlock, Kick } from '../components/ui';
import { PlateRow, Tile } from '../components/shop';
import { Rows } from '../components/blocks';
import { QCap, QEnd, QOpen, Sp } from '../components/quiet';
import { price } from '../content/catalog';

const Ghost = ({ word = 'ATELIER', children, left = 25 }: { word?: string; children: ReactNode; left?: number }) => (
  <div className="ghostwrap"><div className="ghostwrap__g" style={{ left: `${left}%` }}><MarkBar word={word} win="red" ghost w="100%" /></div>{children}</div>
);

/** CAMPAIGNS index (sheet 18) */
export function CampaignsPage() {
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Campaigns" meta="2 campaigns · 2 editorials · 1 not yet" title="Campaigns">
        A campaign is a thesis carried out on location.<br /><span className="g">It is not illustration; it is where the object is tested against a place.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="campaign-01/cover" ratio="1248/1060" pos="50% 22%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={34} letter="A.1" light />
          <LevelMark x={35} y={50} label="+ 1.18  the band" len={180} light />
          <Diag x1={74} y1={6.6} x2={42} y2={44} label="Cf. JK / 001 → A.1 / T01" lx={74} ly={4.4} lw={26} light />
          <NotIn x={76} y={30} lx={95} ly={19} label="the glass wall" side={-1} light />
        </Plate>
        <div className="camp-cap">
          <div><Kick>( 01 )&nbsp;&nbsp;Autumn 2026</Kick><h2 className="title title--m">[ campaign title ]</h2></div>
          <div><p className="camp-cap__p">Eighteen pieces, cut like a section, worn against concrete, glass and steel.</p><p className="camp-cap__l"><a href="/campaigns/01/">Enter the campaign&nbsp;&nbsp;→</a><br /><a href="/atelier/fashion/">Shop the 18 pieces&nbsp;&nbsp;→</a></p></div>
        </div>
      </Sp>
      <Sp s="l">
        <Hair left="Selected looks" right="( 01 )  ·  [ place ]" />
      </Sp>
      <div className="q-rows">
        <PlateRow slot="campaign-01/look-03" ratio="768/1060" pos="50% 38%" w={768} code="Look 03  //JK / 003" line="Bonded wool, funnel collar. The only look shot against the doorway." buy={false} />
        <PlateRow slot="campaign-01/look-06" ratio="768/1060" pos="50% 42%" w={768} code="Look 06  //VT / 001" line="The diagonal is a brace, not a drape; it stops the shoulder from rolling forward." buy={false} mark={<MarkBar w="78%" win="red" caption="the sign, at the height of the brace" />} />
        <PlateRow slot="campaign-01/look-09" ratio="768/1060" pos="50% 44%" w={768} code="Look 09  //SH / 003" line="Shot from below, so the stair does what a studio light would otherwise have to." buy={false} />
      </div>
      <Sp s="xl"><Narrate size="l">Nothing here was built for the picture.</Narrate></Sp>
      <Sp s="l"><MarkBar word="CAMPAIGN" win="ink" w="64%" style={{ marginLeft: '36%' }} /></Sp>
      <Sp s="l">
        <Plate slot="campaign-02/cover" ratio="1248/880" pos="50% 56%" w={1248} sizes="(min-width:1440px) 1248px, 92vw">
          <NotIn x={30} y={72} lx={4} ly={88} label="table, enamelled steel" light />
          <Micro className="mk mk-code is-light" ><span style={{ left: '44%', top: '60%', position: 'absolute' }}>OB / 034&nbsp;&nbsp;//tray</span></Micro>
        </Plate>
        <div className="camp-cap">
          <div><Kick>( 02 )&nbsp;&nbsp;Scan Series</Kick><h2 className="title title--m">The objects, at home</h2></div>
          <div><p className="camp-cap__p">Fifteen ceramic objects, photographed where they are used rather than where they were made.</p><p className="camp-cap__l"><a href="/campaigns/02/">Enter the campaign&nbsp;&nbsp;→</a></p></div>
        </div>
      </Sp>
      <Sp s="l">
        <Hair left="Editorials" right="From the Studio · art, not product" />
        <div className="g2 q-idx edit">
          {[['art/CI-detail', 'Conceptual Interference', '15 plates — chance treated as a layer of authorship', '/studio/conceptual-interference/'], ['art/LP-detail', 'Layer Paintings', '4 triptychs — three states of the same set of layers', '/studio/layer-paintings/']].map(([s, t, d, h]) => (
            <article key={t}><a href={h}><Img slot={s} ratio="612/600" w={612} sizes="(min-width:1440px) 612px, 50vw" /></a><p className="tile__t"><b>{t}</b></p><p className="tile__s">{d} &nbsp; <a className="link-u" href={h}>View&nbsp;&nbsp;→</a></p></article>
          ))}
        </div>
      </Sp>
      <Sp s="l"><Coming title="( 03 )&nbsp;&nbsp;( )" text="Spring 2027. Shot on a site that has not been chosen." link={<>The brand shows what it does not have yet.<br />That is also an inventory.</>} /></Sp>
      <Sp s="l">
        <Hair left="Index" right="All campaigns and editorials" />
        <Rows rows={[
          { no: '01', title: '[ campaign title ]', meta: 'Fashion · Autumn 2026 · [ place ] · 18 pieces', go: <>Enter&nbsp;&nbsp;→</>, href: '/campaigns/01/' },
          { no: '02', title: 'The objects, at home', meta: 'Scan Series · 2026 · interiors · 15 objects', go: <>Enter&nbsp;&nbsp;→</>, href: '/campaigns/02/' },
          { no: 'E1', title: 'Conceptual Interference', meta: 'Studio · 2025 · 15 plates', go: <>View&nbsp;&nbsp;→</>, href: '/studio/conceptual-interference/' },
          { no: 'E2', title: 'Layer Paintings', meta: 'Studio · 2025 · 4 triptychs', go: <>View&nbsp;&nbsp;→</>, href: '/studio/layer-paintings/' },
          { no: '03', title: '( )', meta: 'Spring 2027 — not yet', go: <>Notify&nbsp;&nbsp;→</>, href: '/contact/?subject=notify-campaign', red: true }
        ]} />
      </Sp>
      <Sp s="m"><QEnd sheet="Campaigns" index="C / 01 – 03" crumb={[{ label: 'Campaigns' }]} /></Sp>
    </div>
  );
}

/** CAMPAIGN 01 (sheet 19) */
export function Campaign01() {
  const shop4 = ['JK-001', 'SH-001', 'TR-002', 'VT-001'].map(byId);
  const jk5 = byId('JK-005');
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Campaign ( 01 )" meta="18 pieces · [ place ] · photography [ name ]" title="[ campaign title ]">
        Nothing here was built for the picture.<br /><span className="g">The clothes were taken to a place that already had the geometry.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="campaign-01/look-01" ratio="1248/1120" pos="50% 42%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={50} letter="A.1" light /><AxisH y={45.5} light /><LevelMark x={51} y={45.5} label="+ 1.18  the band" len={190} light />
          <Diag x1={73} y1={5.7} x2={56} y2={40} label="Cf. VT / 001 → A.1 / T01" lx={73} ly={3.6} lw={27} light />
          <SectionAA y={74} inset={5.6} />
          <NotIn x={18} y={86} lx={4} ly={94} label="the stair" light />
          <Micro className="mk mk-tl is-light">Look 01</Micro>
        </Plate>
        <div className="camp1__tb">
          <TitleBlock rows={[[['Project', 'Campaign 01'], ['Sheet', 'Look 01']], [['Scale', '1 : 10'], ['Index', 'a']], [['Contents', 'VT / 001 · TR / 002'], ['Date', '08.10.2026']]]} />
          <p className="linkcol"><a href="/atelier/fashion/">Shop the campaign&nbsp;&nbsp;→</a><br /><a href="/journal/">Film&nbsp;&nbsp;→</a><br /><a href="/journal/">Behind the set&nbsp;&nbsp;→</a></p>
        </div>
      </Sp>
      <Sp s="l"><Hair left="Looks 02 – 04" right="One location · one day" /></Sp>
      <div className="q-rows">
        <PlateRow product={byId('JK-001')} slot="campaign-01/look-02" ratio="768/1100" pos="50% 24%" w={768} code="Look 02  //JK / 001" line="The shoulder is cut to behave like a lintel: it carries the sleeve instead of hanging from it." />
        <PlateRow product={byId('SH-001')} slot="campaign-01/look-04" ratio="768/1100" pos="50% 34%" w={768} code="Look 04  //SH / 001" line="The band across the chest is bonded, not stitched down, so no seam reads through it." mark={<MarkBar w="78%" win="red" caption="the sign, at the height of the band" />} />
        <PlateRow product={byId('TR-003')} slot="campaign-01/look-08" ratio="768/1100" pos="50% 40%" w={768} code="Look 08  //TR / 003" line="Nothing was moved for the picture. The sill was already at that height." />
      </div>
      <Sp s="xl"><Narrate size="l">The grey band is not styling.<br /><span className="g">It is whatever the building offered at that height.</span></Narrate></Sp>
      <Sp s="l"><MarkBar word="ATELIER" win="ink" w="66%" style={{ marginLeft: '34%' }} /></Sp>
      <Sp s="l">
        <Plate slot="campaign-01/look-03" ratio="1248/980" pos="50% 38%" w={1248} sizes="(min-width:1440px) 1248px, 92vw">
          <Redact x={5} y={7} w={30} h={6.5} label="the doorway" light />
          <Redact x={68} y={55} w={27} h={5.5} label="the bench" light />
          <ShopPoint px={46} py={50} lx={48} ly={80} code="JK / 003" name="jacket, black funnel" sub="Bonded wool" price={price(byId('JK-003'))} href={byId('JK-003').href} id="JK-003" />
        </Plate>
        <Sp s="s"><QCap l="Look 03  —  only what is named is for sale" r="The brand advertises what it does not sell" /></Sp>
      </Sp>
      <div className="q-rows">
        <PlateRow product={byId('SH-003')} slot="campaign-01/look-09" ratio="768/1100" pos="50% 44%" w={768} code="Look 09  //SH / 003" line="Shot from below, so the stair does the work the studio light would otherwise do." />
        <PlateRow product={byId('TR-002')} slot="campaign-01/look-11" ratio="768/1100" pos="50% 46%" w={768} code="Look 11  //TR / 002" line="The only colour in eighteen looks, and it belongs to the building." />
      </div>
      <Sp s="xl">
        <div className="walk">
          <Plate slot="campaign-01/look-10" ratio="768/1150" pos="50% 30%" w={768} sizes="(min-width:1440px) 768px, 62vw"><Steps fs="clamp(36px, 8vw, 118px)" /></Plate>
          <div className="walk__t">
            <Micro>Look 10&nbsp;&nbsp;//JK / 005</Micro>
            <p className="walk__p">Read diagonally, the name crosses the picture: the letter, the brackets, the dot — three steps, one sign.</p>
            <p className="walk__b">{price(jk5)}&nbsp;&nbsp;&nbsp;<button type="button" data-quickadd="JK-005">Add</button></p>
          </div>
        </div>
      </Sp>
      <Sp s="l" id="shop">
        <Hair left="Shop the campaign" right="18 pieces · ships in 5 days" />
        <div className="g4 q-idx">{shop4.map((p) => <Tile key={p.id} p={p} ratio="1/1.42" w={290} />)}</div>
        <p className="viewall"><a href="/atelier/fashion/">View all 18&nbsp;&nbsp;→</a></p>
      </Sp>
      <Sp s="l"><Ghost><Narrate size="l">The window is laid over the body.<br /><span className="g">The body does not move for it.</span></Narrate></Ghost></Sp>
      <Sp s="xl"><OutPlate slot="campaign-02/cover" pos="50% 56%" title="Campaign ( 02 ) — the objects, at home" line="Enter  →" href="/campaigns/02/" ratio="1248/620" /></Sp>
      <Sp s="s"><QEnd sheet="Campaign ( 01 )" index="a" thesis="T01" crumb={[{ label: 'Campaigns', href: '/campaigns/' }, { label: '( 01 ) [ campaign title ]' }]} /></Sp>
    </div>
  );
}

/** CAMPAIGN 02 */
export function Campaign02() {
  const lives = [
    { slot: 'campaign-02/life-1', p: 'OB-011', l: 'Windowsill, single stem.', pos: '50% 45%' },
    { slot: 'campaign-02/life-2', p: 'OB-012', l: 'Shelf, dried flowers.', pos: '50% 42%' },
    { slot: 'campaign-02/life-3', p: 'OB-021', l: 'The catch-all does what a desk drawer used to.', pos: '50% 50%' },
    { slot: 'campaign-02/life-4', p: 'OB-034', l: 'Next to the records, because the shelf had room.', pos: '50% 50%' }
  ];
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Campaign ( 02 )" meta="Scan Series · 2026 · interiors · 15 objects" title="The objects, at home">
        Photographed where they are used,<br /><span className="g">not where they were made.</span>
      </QOpen>
      <Sp s="l">
        <Plate slot="campaign-02/cover" ratio="1248/880" pos="50% 56%" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={40} letter="A.5" light /><LevelMark x={62} y={50} label="+ 0.74  table" len={160} light />
          <NotIn x={30} y={72} lx={4} ly={88} label="table, enamelled steel" light /><NotIn x={78} y={22} lx={95} ly={12} label="the garden" side={-1} light />
        </Plate>
        <Sp s="s"><QCap l="OB / 034  //tray" r="Only what is named is for sale" /></Sp>
      </Sp>
      <div className="q-rows">
        {lives.map((x) => { const p = byId(x.p); return <PlateRow key={x.slot} product={p} slot={x.slot} ratio="768/900" pos={x.pos} w={768} code={`${p.code}  //${p.name}`} line={x.l} />; })}
      </div>
      <Sp s="xl"><Narrate size="l">Identical was the promise.<br /><span className="g">Identical is now the cheapest thing we own.</span></Narrate></Sp>
      <Sp s="l">
        <Hair left="Shop the campaign" right="Scan Series · 15 objects" />
        <div className="g4 q-idx">{['OB-011', 'OB-021', 'OB-031', 'OB-034'].map(byId).map((p) => <Tile key={p.id} p={p} ratio="1/1.2" w={290} ground sub={p.name} />)}</div>
        <p className="viewall"><a href="/atelier/scan-series/">All fifteen&nbsp;&nbsp;→</a></p>
      </Sp>
      <Sp s="xl"><OutPlate slot="campaign-01/cover" pos="50% 22%" title="Campaign ( 01 )" line="Autumn 2026  →" href="/campaigns/01/" ratio="1248/620" /></Sp>
      <Sp s="s"><QEnd sheet="Campaign ( 02 )" index="a" thesis="T02" crumb={[{ label: 'Campaigns', href: '/campaigns/' }, { label: '( 02 ) The objects, at home' }]} /></Sp>
    </div>
  );
}
