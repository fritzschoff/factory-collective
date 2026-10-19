import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { EnquireButton } from '@/components/forms/EnquireButton';
import { A } from '@/components/link';
import { QCap, QEnd, QOpen, Sp } from '@/components/quiet';
import { EditionAdd, StatePick, WorkStateProvider } from '@/components/shop/WorkState';
import { Soon } from '@/components/soon';
import { PlateRow, Tile } from '@/components/tiles';
import { AxisV, Coming, Crumb, Dim, Elevation, Hair, Img, Lens, LevelMark, MarkBar, Micro, Museum, Narrate, NotIn, OutPlate, Pill, Plate, Rule, SectionAA, Steps, Diag, cx } from '@/components/ui';
import { workPages } from '@/content/pages';
import { WORKS, fromPrice, getCatalog, type Catalog, type Work } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';
import { NOT_FOUND_METADATA, pageMetadata } from '@/lib/seo';
import type { Product } from '@/lib/types';

const Ghost = ({ word = 'STUDIO', children, left = 25 }: { word?: string; children: ReactNode; left?: number }) => (
  <div className="ghostwrap"><div className="ghostwrap__g" style={{ left: `${left}%` }}><MarkBar word={word} win="red" ghost w="100%" /></div>{children}</div>
);
const ci = WORKS.filter((w) => w.series === 'ci');
const lp = WORKS.filter((w) => w.series === 'lp');

/** STUDIO hub (sheet 15) */
export async function StudioPage() {
  const cat = await getCatalog();
  return (
    <div className="q">
      <div className="hero2 n-bleed hero2--s">
        <Img slot="studio/hero-ci" ratio="620/980" pos="50% 42%" w={620} eager sizes="(min-width:1440px) 620px, 50vw" className="hero2__a" />
        <Img slot="studio/hero-lp" ratio="620/980" pos="50% 42%" w={620} eager sizes="(min-width:1440px) 620px, 50vw" className="hero2__b" />
        <span className="over"><AxisV x={25} /><AxisV x={75} /><span className="mk-split" /></span>
        <p className="micro hero2__k1">Series 01&nbsp;&nbsp;—&nbsp;&nbsp;Chance</p><p className="micro hero2__k2">Series 02&nbsp;&nbsp;—&nbsp;&nbsp;Drawing</p>
      </div>
      <Sp s="s"><Crumb items={[{ label: 'Studio' }]} /></Sp>
      <Sp s="s">
        <header className="head6">
          <div className="head6__l"><h1 className="title">Studio</h1><p className="micro">( to enter )&nbsp;&nbsp;the space</p>
            <p className="head6__p">What has become space. The Studio holds the work that is not for sale by the piece in a shop: art series, exhibitions, sound. It exists on site and for a time — what stays in the collection is the document.</p></div>
          <p className="head6__r"><A href="/studio/conceptual-interference/">Art ( 2 series )</A> · <Soon k="exhibitions" /> · <Soon k="sound" /> · <Soon k="scenography" /> · <Soon k="architecture" /></p>
        </header>
      </Sp>
      <Sp s="m">
        <Rule title="Art" note="( 2 series, 19 works )  // both on layering" right={<A href="/studio/conceptual-interference/">Viewing room&nbsp;&nbsp;→</A>} />
        {[
          { slot: 'art/CI-detail', k: 'Series 01 — 2025', t: 'Conceptual Interference', href: '/studio/conceptual-interference/', p: 'Translucent material pulled over colour and gesture, lit from behind. The composition is not drawn — it is allowed. Chance treated as a layer of authorship, standing in for every process that is read afterwards as if it had been designed.', m: [['Works', '15'], ['Medium', 'Archival print'], ['Sheet', '90 × 120 cm']] as [string, string][] },
          { slot: 'art/LP-detail', k: 'Series 02 — 2025', t: 'Layer Paintings', href: '/studio/layer-paintings/', p: 'City plans, fields, roads, borders — lines that elsewhere carry the authority of survey and law, drawn by hand onto layered film. Each work is a triptych: three states of the same layers, and no argument for why one of them should be the one that counts.', m: [['Works', '4 triptychs'], ['Panels', '12'], ['Each', '3 × 50 × 70 cm']] as [string, string][] }
        ].map((s) => (
          <section className="room room--s" key={s.t}>
            <A className="room__img" href={s.href} tabIndex={-1} aria-hidden="true"><Img slot={s.slot} ratio="690/620" w={690} sizes="(min-width:1440px) 690px, 52vw" /></A>
            <div className="room__t">
              <div className="room__h"><div><p className="micro">{s.k}</p><h2 className="room__title">{s.t}</h2></div><A className="room__go" href={s.href}>Enter&nbsp;&nbsp;→</A></div>
              <p className="room__p">{s.p}</p>
              <Museum rows={s.m} />
              <p className="room__links"><A href={s.href}>View the series&nbsp;&nbsp;→</A><A href={s.href}>Editions from {fromPrice(cat, WORKS.find((w) => w.series === (s.t === 'Layer Paintings' ? 'lp' : 'ci'))!).replace('from ', '')}&nbsp;&nbsp;→</A></p>
            </div>
          </section>
        ))}
      </Sp>
      <Sp s="m"><Coming title="Exhibitions&nbsp;&nbsp;( )" text="The show is over. The document stays — the documentation is being prepared." link="Notify me&nbsp;&nbsp;→" href="/contact/?subject=notify-exhibition" /></Sp>
      <Sp s="m"><Coming title="Sound&nbsp;&nbsp;( )" text="Recordings from the room the work stood in. Not yet published." link="Notify me&nbsp;&nbsp;→" href="/contact/?subject=notify-sound" /></Sp>
      <Sp s="m"><Coming title="Scenography&nbsp;&nbsp;( )&nbsp;&nbsp;&nbsp;Architecture&nbsp;&nbsp;( )" text="The two rooms the Studio is still being built for." link="Enquire&nbsp;&nbsp;→" href="/contact/?subject=studio" /></Sp>
      <Sp s="m"><QEnd sheet="Studio" index="S / 01 – 04" thesis="T02" crumb={[{ label: 'Studio' }]} /></Sp>
    </div>
  );
}

/** CONCEPTUAL INTERFERENCE (sheet 16) */
export async function CIPage() {
  const cat = await getCatalog();
  const rows = [['CI-07', 'Lit from behind, so the sheet itself becomes the light source. Nothing on this surface was placed.'], ['CI-03', 'Green enters only where the material refused to lie flat.'], ['CI-11', 'Two gestures, one sheet, and no argument for which of them came first.']];
  const ed = cat.pick(['CI-05.P', 'CI-09.P', 'CI-14.P']);
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Studio / Art / Series 01" meta="2025 · 15 works · archival pigment print" title="Conceptual Interference">Nobody composed this. Everybody reads it as composition.</QOpen>
      <Sp s="l">
        <Plate slot="art/CI-detail" ratio="1248/840" w={1248} eager sizes="(min-width:1440px) 1248px, 92vw">
          <AxisV x={38.2} letter="A.1" light /><SectionAA y={62} inset={5.6} />
          <LevelMark x={39.4} y={21.5} label="+ the fold" len={150} light />
          <Diag x1={76} y1={6.5} x2={55} y2={49} label="Cf. CI / 12  →  S / T02" lx={76} ly={3.2} lw={24} light />
        </Plate>
        <Sp s="s"><QCap l="Detail  2 : 1  —  CI / 12" r="the fold carries the colour — no brush was here" /></Sp>
      </Sp>
      <Sp s="l"><Hair left="The plates" right="Each 90 × 120 cm · ed. 3 + 1 a.p." /></Sp>
      <div className="q-rows">
        {rows.map(([id, line], i) => {
          const w = WORKS.find((x) => x.id === id)!;
          return (
            <PlateRow key={id} slot={w.slots[0]} ratio="768/1024" w={768} code={w.code} line={line} price={`Original · prints ${fromPrice(cat, w)}`} cta="View the work" href={w.href}
              mark={i === 1 ? <MarkBar w="82%" win="red" caption="the sign, at the height of the fold" /> : undefined} />
          );
        })}
      </div>
      <Sp s="xl"><Narrate size="l">The hand never touches the surface.<br /><span className="g">The surface is signed anyway.</span></Narrate></Sp>
      <Sp s="l"><MarkBar word="STUDIO" win="ink" w="64%" style={{ marginLeft: '36%' }} /></Sp>
      <Sp s="l"><Lens slot="art/CI-14" ratio="1248/760" pos="center" fx={44} fy={52} cw={50} ch={25} blur={16} caption="CI / 14  —  the window as a lens: only what lies inside the brackets is in focus" /></Sp>
      <Sp s="l" id="all">
        <Hair left="All fifteen" right="Every plate has its own page — original and two print editions" />
        <div className="pills pills--before"><Pill href="#editions">Shop the prints&nbsp;&nbsp;→</Pill><Pill href="/contact/?subject=original" ghost>Enquire about an original&nbsp;&nbsp;→</Pill></div>
        <div className="g5 q-idx">
          {ci.map((w) => (
            <article className="tile tile--idx" key={w.id}>
              <A className="tile__a" href={w.href}><Img slot={w.slots[0]} ratio="3/4" w={230} alt={w.code} sizes="(min-width:1440px) 230px, 40vw" /></A>
              <p className="micro tile__c"><b>{w.code}</b><span>{fromPrice(cat, w)}</span></p>
              <p className="tile__s"><A href={w.href}>→ the work page</A></p>
            </article>
          ))}
        </div>
      </Sp>
      <Sp s="l"><Ghost><Narrate size="l">Chance is only called chance<br />until somebody sells it.</Narrate></Ghost></Sp>
      <Sp s="xl" id="editions">
        <Hair left="Editions" right="Unframed · ed. 100 · ships in 3 weeks" />
        <div className="g3 q-idx">{ed.map((p) => <Tile key={p.id} p={p} ratio="3/4" w={390} sub={p.sub} />)}</div>
      </Sp>
      <Sp s="l"><OutPlate slot="art/LP-detail" title="Layer Paintings" line="Series 02 — the same question, drawn  →" href="/studio/layer-paintings/" ratio="1248/620" /></Sp>
      <Sp s="s"><QEnd sheet="Series 01" index="CI / 01 – 15" thesis="T02" cf={<>Cf.&nbsp;&nbsp;<span>Ordinary Objects — the Factory text on repetition and the hand</span>&nbsp;&nbsp;<A href="/factory/ordinary-objects/">Read&nbsp;&nbsp;→</A></>} crumb={[{ label: 'Studio', href: '/studio/' }, { label: 'Art' }, { label: 'Conceptual Interference' }]} /></Sp>
    </div>
  );
}

/** LAYER PAINTINGS (sheet 17) */
export async function LPPage() {
  const cat = await getCatalog();
  const lp1 = WORKS.find((w) => w.id === 'LP-01')!, lp2 = WORKS.find((w) => w.id === 'LP-02')!;
  const ed = [['LP-02', 2], ['LP-04', 3], ['LP-01', 2]].map(([id, s]) => ({ w: WORKS.find((x) => x.id === id)!, s: s as number }));
  const states = ['The first sheet. The plan is still legible as a plan — you could walk it.', 'One more sheet over it. The road bends; the field closes behind it.', 'Nothing was taken away. The first reading is simply no longer available.'];
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="Studio / Art / Series 02" meta="2025 · 4 triptychs · 12 panels" title="Layer Paintings">A line on a plan is a decision<br />wearing the clothes of a fact.</QOpen>
      <Sp s="l">
        <div className="wall3">
          {lp2.slots.map((s, i) => (
            <figure key={s}><Img slot={s} ratio="2/3" w={400} eager={i === 0} alt={`LP / 02, state 0${i + 1}`} sizes="(min-width:1440px) 400px, 32vw" />
              <figcaption><i className="cir">{i + 1}</i><Micro>state 0{i + 1}</Micro></figcaption></figure>
          ))}
          <span className="wall3__aa"><SectionAA y={50} inset={3.2} /></span>
        </div>
        <Sp s="s"><QCap l="LP / 02  —  three states of the same set of layers" r={`3 × 50 × 70 cm · hung as one work · ${fromPrice(cat, lp2)}`} /></Sp>
        <div className="pills pills--before"><Pill href={lp2.href}>View the work&nbsp;&nbsp;→</Pill><Pill href={lp2.href + '#states'} ghost>Buy a print of one state&nbsp;&nbsp;→</Pill></div>
      </Sp>
      <Sp s="l"><Hair left="LP / 01&nbsp;&nbsp;— read downwards" right="Nothing is removed. Only added." /></Sp>
      <div className="q-rows">
        {lp1.slots.map((s, i) => (
          <PlateRow key={s} slot={s} ratio="768/1148" w={768} code={`State 0${i + 1}`} line={states[i]} buy={i === 2} price={`Work · prints ${fromPrice(cat, lp1)}`} cta="View the work" href={lp1.href}
            mark={i === 1 ? <MarkBar w="78%" win="ink" caption="the window, over the second sheet" /> : undefined} />
        ))}
      </div>
      <Sp s="xl">
        <div className="notmade">
          <Narrate size="l">Three were made.<br /><span className="g">The sheets would have allowed a hundred.</span></Narrate>
          <div className="notmade__b" aria-hidden="true">{[4, 5, 6, 7].map((n) => <div key={n}><span>( )</span><Micro className="r">state 0{n}</Micro></div>)}</div>
        </div>
      </Sp>
      <Sp s="l">
        <Plate slot="art/LP-detail" ratio="1248/820" w={1248} sizes="(min-width:1440px) 1248px, 92vw">
          <Steps fs="clamp(36px, 6vw, 86px)" />
          <NotIn x={22} y={70} lx={6} ly={88} label="the ground it was drawn on" light />
        </Plate>
        <Sp s="s"><QCap l="LP / 02, state 02  —  detail 2 : 1" r="the name walks across the picture; read diagonally it is still the sign" /></Sp>
      </Sp>
      <Sp s="l">
        <Hair left="The other works" right="Each a triptych · three states" />
        <div className="trips">
          {lp.filter((w) => w.id !== 'LP-02').map((w, i) => (
            <article key={w.id}>
              <A className="trips__p" href={w.href}>{w.slots.map((s) => <Img key={s} slot={s} ratio="2/3" w={130} alt="" sizes="(min-width:1440px) 130px, 10vw" />)}</A>
              <p className="micro ink">{w.code}</p>
              <p className="tile__s">{['blue, black, a cut plan', 'magenta, blue, an open field', 'yellow, grey, open land'][i]} &nbsp; {fromPrice(cat, w)} &nbsp; <A className="link-u" href={w.href}>View the work</A></p>
            </article>
          ))}
        </div>
      </Sp>
      <Sp s="l"><Ghost><Narrate size="l">Every border was once a sketch<br />somebody stopped revising.</Narrate></Ghost></Sp>
      <Sp s="xl">
        <Hair left="Editions" right="One state · ed. 25 · 40 × 56 cm" />
        <div className="g3 q-idx">{ed.map(({ w, s }) => {
          const p = cat.byId(`${w.id}.A`);
          return p && <Tile key={w.id} p={p} ratio="2/3" w={390} sub={`state 0${s} · ${p.sub}`} pos="center" />;
        })}</div>
      </Sp>
      <Sp s="l"><OutPlate slot="art/CI-detail" title="Conceptual Interference" line="Series 01 — the same question, answered by chance  →" href="/studio/conceptual-interference/" ratio="1248/620" /></Sp>
      <Sp s="s"><QEnd sheet="Series 02" index="LP / 01 – 04" thesis="T02" cf={<>Cf.&nbsp;&nbsp;<span>Tectonics without origin — fragments of a system that was never built</span>&nbsp;&nbsp;<A href="/factory/tectonics-without-origin/">Read&nbsp;&nbsp;→</A></>} crumb={[{ label: 'Studio', href: '/studio/' }, { label: 'Art' }, { label: 'Layer Paintings' }]} /></Sp>
    </div>
  );
}

/* ── the route logic, shared by the two work routes ───────────── */

/** One static page per work of this series. */
export function workStaticParams(series: Work['series']): { work: string }[] {
  return WORKS.filter((w) => w.series === series).map((w) => ({ work: w.slug }));
}

const findWork = (series: Work['series'], slug: string) => WORKS.find((w) => w.series === series && w.slug === slug);

export function workMetadata(series: Work['series'], slug: string): Metadata {
  const w = findWork(series, slug);
  const entry = w && workPages().find((e) => e.path === w.href);
  return entry ? pageMetadata(entry) : NOT_FOUND_METADATA;
}

/** The page of a work; a slug the series does not know is a 404. */
export async function WorkRoute({ series, slug }: { series: Work['series']; slug: string }) {
  const w = findWork(series, slug);
  if (!w) notFound();
  return <WorkPage w={w} cat={await getCatalog()} />;
}

/** One print edition on a work page: number, name, edition and size, price, Add. */
function EditionForm({ p, no, name, spec, note, needsState }: { p: Product; no: string; name: string; spec: ReactNode; note: string; needsState: boolean }) {
  return (
    <div className="own__o">
      <p className="own__n"><b>{no}</b>&nbsp;&nbsp;<span>{name}</span></p>
      <p className="own__s">{spec}</p><p className="own__d">{note}</p>
      <p className="own__p">{fmtPrice(p.priceCents)}</p>
      <EditionAdd product={toSummary(p)} needsState={needsState} />
    </div>
  );
}

/** A WORK: original (enquire) + poster + archival (add to bag) — sheets 22 and 23 */
export function WorkPage({ w, cat }: { w: Work; cat: Catalog }) {
  const isCi = w.series === 'ci';
  const poster = cat.byId(`${w.id}.P`), arch = cat.byId(`${w.id}.A`);
  const others = (isCi ? ci : lp).filter((x) => x.id !== w.id);
  const seriesHref = isCi ? '/studio/conceptual-interference/' : '/studio/layer-paintings/';
  const seriesName = isCi ? 'Conceptual Interference' : 'Layer Paintings';
  const tri = !isCi;
  const lens = tri ? w.slots[1] : w.slots[0];
  return (
    <WorkStateProvider initial={tri ? '2' : null}>
      <div className="q work">
        <Sp s="l" className="q-top" />
        <QOpen kick={`Studio / Art / Series 0${isCi ? 1 : 2} — the work`} meta={`${seriesName.toUpperCase()} · 2025`} title={w.code}>
          {isCi ? <>What you buy is not a picture of a decision.<br /><span className="g">It is what happened instead.</span></> : <>Three states were made.<br /><span className="g">You can buy the argument, or one of its outcomes.</span></>}
        </QOpen>
        <Sp s="l">
          <div className={cx('stage', tri && 'stage--tri')}>
            <div className="stage__w">
              {isCi
                ? <div className="stage__one"><Img slot={w.slots[0]} ratio="3/4" w={700} eager alt={w.code} sizes="(min-width:1440px) 700px, 56vw" /><Dim x1={0} x2={100} y={106} label="1 : 1  —  90 × 120 cm" light={false} /></div>
                : <div className="stage__three">{w.slots.map((s, i) => <figure key={s}><Img slot={s} ratio="2/3" w={260} eager={i === 0} alt={`${w.code}, state 0${i + 1}`} sizes="(min-width:1440px) 260px, 20vw" /><figcaption><i className="cir">{i + 1}</i><Micro>state 0{i + 1}</Micro></figcaption></figure>)}<Dim x1={0} x2={100} y={106} label="3 × 50 × 70 cm  —  hung as one work" light={false} /></div>}
            </div>
            <aside className="own" aria-label="Ways to own it">
              <p className="micro">Three ways to own it</p>
              <div className="own__o">
                <p className="own__n"><b>01</b>&nbsp;&nbsp;<span>{isCi ? 'The original' : 'The triptych'}</span></p>
                <p className="own__s">{isCi ? <>Edition 3 + 1 a.p.&nbsp;&nbsp;·&nbsp;&nbsp;90 × 120 cm</> : <>Unique&nbsp;&nbsp;·&nbsp;&nbsp;3 × 50 × 70 cm</>}</p>
                <p className="own__d">{isCi ? 'Diasec, oak frame. Two of three remain.' : 'Mixed media on layered film, photographed. All three states, hung as one.'}</p>
                <p className="own__p">€ [price]</p>
                <EnquireButton what={`${w.code} — ${isCi ? 'the original' : 'the triptych'}`} label={isCi ? 'Enquire about the original' : 'Enquire about the work'} />
              </div>
              {poster && <EditionForm p={poster} needsState={tri} no="02" name="Poster print" spec={<>Edition 100&nbsp;&nbsp;·&nbsp;&nbsp;50 × 70 cm</>} note={tri ? 'One state of your choice. Offset on uncoated stock.' : 'Offset on uncoated stock, unframed.'} />}
              {arch && <EditionForm p={arch} needsState={tri} no="03" name="Archival print" spec={<>Edition 25&nbsp;&nbsp;·&nbsp;&nbsp;{isCi ? '40 × 54' : '40 × 56'} cm</>} note={tri ? 'One state, pigment on cotton rag, numbered and signed.' : 'Pigment on cotton rag, numbered and signed.'} />}
              <p className="own__f">{tri ? 'The set of all three states, in one frame, is available on request.' : 'Every print carries the plate number and the inventory line. Ships in 3 weeks, insured.'}</p>
            </aside>
          </div>
        </Sp>
        <Sp s="m"><Crumb items={[{ label: 'Studio', href: '/studio/' }, { label: 'Art' }, { label: seriesName, href: seriesHref }, { label: w.code }]} /></Sp>
        {tri && (
          <Sp s="l" id="states">
            <Hair left="Choose a state" right="For the print · one of three" />
            <StatePick options={w.slots.map((s, i) => ({
              value: String(i + 1),
              label: `State 0${i + 1}`,
              image: <Img slot={s} ratio="2/3" w={390} alt={`State 0${i + 1}`} sizes="(min-width:1440px) 390px, 30vw" />,
              sub: <>{['the plan is still legible', 'the road bends, the field closes', 'the first reading is gone'][i]} &nbsp; {arch ? fmtPrice(arch.priceCents) : ''}</>,
            }))} />
          </Sp>
        )}
        <Sp s="l">
          <Hair left="At this size" right="Elevation 1 : 10" />
          <Sp s="s"><Elevation slots={w.slots} cw={isCi ? 90 : 50} ch={isCi ? 120 : 70} n={tri ? 3 : 1} gap={tri ? 6 : 0} dimW={tri ? '3 × 50 + 2 × 6' : undefined} label={tri ? 'WALL ELEVATION — THE TRIPTYCH, HUNG AS ONE WORK' : 'WALL ELEVATION — THE ORIGINAL, HUNG'} /></Sp>
          <Micro className="elev__n ink">{tri ? 'Hung as one work: three panels, 6 cm apart, centre line at 1.45 m. The print is a single state at 50 × 70.' : 'The original at 90 × 120 cm. The poster print is 50 × 70, the archival print 40 × 54.'}</Micro>
        </Sp>
        <Sp s="l"><Lens slot={lens} ratio="1248/700" pos="center" fx={47} fy={49} cw={46} ch={24} blur={14} caption={isCi ? `${w.code}  —  the window as a lens: only what lies inside the brackets is in focus` : `${w.code}, state 02  —  the drawn line, at the size it was drawn`} /></Sp>
        <Sp s="l">
          <Hair left="Specification" />
          <div className="museum-grid spec2">
            <Museum rows={isCi ? [['Plate', w.code], ['Series', seriesName], ['Year', '2025']] : [['Work', w.code], ['Series', seriesName], ['Year', '2025']]} />
            <Museum rows={isCi ? [['Medium', 'Archival pigment print'], ['Mount', 'Diasec, oak'], ['Inv.', `/// S / ${w.code}`]] : [['Medium', 'Mixed media on film'], ['Form', 'Triptych, 3 states'], ['Inv.', `/// S / ${w.code}`]]} />
            <Museum rows={isCi ? [['Sheet', '90 × 120 cm'], ['Edition', '3 + 1 a.p.'], ['Signed', 'Verso, numbered']] : [['Panel', '50 × 70 cm'], ['Hung', '6 cm apart'], ['Signed', 'Verso']]} />
            <Museum rows={[['Thesis', 'T02'], ['Certificate', 'Included'], ['Lead time', '3 weeks']]} />
          </div>
        </Sp>
        <Sp s="l">
          <Hair left="From the same series" right={<A href={seriesHref}>All {isCi ? 'fifteen' : 'four works'}&nbsp;&nbsp;→</A>} />
          <div className={isCi ? 'g5 q-idx' : 'g4 q-idx'}>
            {(isCi ? others.filter((x) => ['CI-03', 'CI-05', 'CI-11', 'CI-12', 'CI-14'].includes(x.id)) : others).slice(0, isCi ? 5 : 3).map((x) => (
              <article className="tile tile--idx" key={x.id}>
                <A className="tile__a" href={x.href}><Img slot={x.slots[isCi ? 0 : 1]} ratio={isCi ? '3/4' : '2/3'} w={230} alt={x.code} sizes="(min-width:1440px) 230px, 40vw" /></A>
                <p className="micro tile__c"><b>{x.code}</b></p><p className="tile__s">{fromPrice(cat, x)}</p>
              </article>
            ))}
          </div>
        </Sp>
        <Sp s="xl"><Ghost><Narrate size="l">{isCi ? <>An edition is not a smaller work.<br /><span className="g">It is the same event, printed at a size a room can hold.</span></> : <>Buying one state is taking a side.<br /><span className="g">The work was built so that you would have to.</span></>}</Narrate></Ghost></Sp>
        <Sp s="l"><OutPlate slot={isCi ? 'art/LP-detail' : 'art/CI-detail'} title={isCi ? 'Layer Paintings' : 'Conceptual Interference'} line={isCi ? 'Series 02 — also available as prints  →' : 'Series 01 — fifteen plates, also as prints  →'} href={isCi ? '/studio/layer-paintings/' : '/studio/conceptual-interference/'} ratio="1248/560" /></Sp>
        <Sp s="s"><QEnd sheet={`Work ${w.code}`} index="a" thesis="T02" scale="1 : 1" cf={<>◂&nbsp;&nbsp;<A href={seriesHref}>Back to the series</A>&nbsp;&nbsp;·&nbsp;&nbsp;{seriesName}&nbsp;&nbsp;( {isCi ? 15 : 4} )</>} /></Sp>
      </div>
    </WorkStateProvider>
  );
}
