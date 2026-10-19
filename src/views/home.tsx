import { SecHead } from '@/components/blocks';
import { A } from '@/components/link';
import { Sp } from '@/components/quiet';
import { Tile } from '@/components/tiles';
import { AxisV, Img, Micro, Plate, SectionAA, ShopPoint } from '@/components/ui';
import { SITE } from '@/content/site';
import { getCatalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';

/** HOME — near-edge hero, then one section per room */
export async function HomePage() {
  const cat = await getCatalog();
  const fashion = cat.pick(['JK-004', 'SH-001', 'VT-001', 'TR-002']);
  const bags = cat.pick(['BG-114', 'BG-098', 'BG-086']);
  const jew = cat.shop('jewellery');
  const cuff = cat.byId('BR-A');
  const bnew = cat.byId('BG-NEW');
  return (
    <div className="home">
      {/* the page's heading for search engines and screen readers; the sign in the header is its visible name (Ruling P46) */}
      <h1 className="sr">{SITE.name}</h1>
      {/* hero: campaign, edge to edge */}
      <section className="hero n" aria-label="Campaign ( 01 )">
        <div className="hero__pics">
          <Img slot="home/hero-1" ratio="709/1060" pos="50% 16%" w={710} eager className="hero__a" sizes="(min-width:1440px) 710px, 50vw" />
          <Img slot="home/hero-2" ratio="709/1060" pos="50% 18%" w={710} eager className="hero__b" sizes="(min-width:1440px) 710px, 50vw" />
          <span className="over">
            <AxisV x={25} light /><AxisV x={75} light />
          </span>
        </div>
        <div className="hero__t">
          <p className="micro on-img">Campaign ( 01 )&nbsp;&nbsp;—&nbsp;&nbsp;Autumn 2026</p>
          <p className="hero__l">Eighteen pieces, cut like a section.</p>
          <p className="hero__s">Worn against concrete, glass and steel. A grey band crosses every picture — the window, laid over the body.</p>
        </div>
        <A className="hero__go" href="/campaigns/01/">Shop the campaign&nbsp;&nbsp;→</A>
      </section>

      <div className="q home__body">
        {/* fashion */}
        <Sp s="m">
          <SecHead kick="Atelier / Fashion" title="The collection" text="Eighteen pieces built from one profile: a shoulder that behaves like a lintel, a seam that behaves like a joint. Cut once, in small series."
            links={[{ label: 'Jackets ( 8 )', href: '/atelier/fashion/#jackets' }, { label: 'Shirts ( 4 )', href: '/atelier/fashion/#shirts' }, { label: 'Trousers ( 3 )', href: '/atelier/fashion/#trousers' }, { label: 'Vests ( 3 )', href: '/atelier/fashion/#vests' }]} read={{ label: 'All fashion', href: '/atelier/fashion/' }} />
          <div className="g4 home__tiles">{fashion.map((p) => <Tile key={p.id} p={p} ratio="17/21" w={300} />)}</div>
        </Sp>

        {/* bags */}
        <Sp s="m">
          <SecHead kick="Atelier / Accessories" title="Bag / Profile Series" text="Carrying as a spatial question. Profiles, chambers and a constructive logic instead of fashion types — mobile architecture at the scale of the body."
            links={[{ label: 'Bags ( 4 )', href: '/atelier/bags/' }, { label: 'Totes ( 1 )', href: '/atelier/bags/#series' }, { label: 'Read the text', soon: 'bagText' }]} read={{ label: 'Read the text', soon: 'bagText' }} />
          <div className="home__bags">
            <Plate slot="bags/BG-NEW" ratio="609/760" pos="50% 44%" w={610} sizes="(min-width:1440px) 610px, 50vw">
              {bnew && <ShopPoint px={46} py={44} lx={20} ly={78} code="BG / 0??" name="bag, stitched panels" sub="Leather, bonded seams" price={fmtPrice(bnew.priceCents)} href={bnew.href} product={toSummary(bnew)} />}
            </Plate>
            <div className="g3 home__bagtiles">{bags.map((p) => <Tile key={p.id} p={p} ratio="1/2.1" w={200} sub="bag" sizes="(min-width:1440px) 200px, 20vw" />)}</div>
          </div>
        </Sp>

        {/* ordinary objects */}
        <Sp s="m">
          <SecHead kick="Factory / Text" title="Ordinary Objects" text="A spirit level, a screw clamp, a packing crate. Tools nobody looks at twice, taken at face value and made again — reforged in silver, or scanned and printed in ceramic."
            links={[{ label: 'Jewellery ( 5 )', href: '/atelier/jewellery/' }, { label: 'Scan Series ( 15 )', href: '/atelier/scan-series/' }, { label: 'The text', href: '/factory/ordinary-objects/' }]} read={{ label: 'Read', href: '/factory/ordinary-objects/' }} />
          <Plate slot="jewellery/hero" ratio="1248/700" pos="50% 42%" w={1248} sizes="(min-width:1440px) 1248px, 92vw">
            <AxisV x={33.3} light /><AxisV x={66.6} light />
            <Micro className="mk mk-tl is-light">Exploded&nbsp;&nbsp;—&nbsp;&nbsp;after a folding clasp</Micro>
            {cuff && <ShopPoint px={42} py={36} lx={56} ly={17} code="BR / 0??.a" name="cuff" sub="White gold, gold inserts" price={fmtPrice(cuff.priceCents)} href={cuff.href} product={toSummary(cuff)} />}
          </Plate>
          <div className="g5 home__jew">{jew.map((p) => <Tile key={p.id} p={p} ratio="1/1.25" w={230} sub={p.sub} sizes="(min-width:1440px) 230px, 40vw" />)}</div>
        </Sp>

        {/* scan series */}
        <Sp s="m">
          <div className="home__scan">
            <Plate slot="scan/life-garden" ratio="770/720" pos="50% 56%" w={770} sizes="(min-width:1440px) 770px, 62vw" />
            <div className="home__scant">
              <p className="micro">Atelier / Objects</p>
              <h2 className="sech__t">Scan Series</h2>
              <p className="sech__p">Fifteen ceramic objects printed from one scan each, then glazed by hand. The form is a perfect copy. The surface never repeats.</p>
              <div className="g2 home__scant2">{cat.pick(['OB-011', 'OB-021']).map((p) => <Tile key={p.id} p={p} ratio="1/1.3" w={220} ground sub={p.name} sizes="(min-width:1440px) 220px, 20vw" />)}</div>
              <A className="link-arrow" href="/atelier/scan-series/">All fifteen&nbsp;&nbsp;→</A>
            </div>
          </div>
        </Sp>

        {/* factory */}
        <Sp s="m">
          <SecHead kick="Factory" title="Tectonics without origin" text="Objects from a world that was never built. Profiles, cuts, joints and edges recall architecture without being taken from it. It carries nothing — and still insists on a logic of carrying."
            links={[{ label: 'Texts ( 3 )', href: '/factory/' }, { label: 'Theses ( 2 )', href: '/factory/#theses' }, { label: 'Glossary', href: '/factory/glossary/' }]} read={{ label: 'Enter the Factory', href: '/factory/' }} />
          <Plate slot="factory/section-1" ratio="1248/420" w={1248} sizes="(min-width:1440px) 1248px, 92vw"><SectionAA y={55} inset={6.4} /></Plate>
          <Micro className="home__cap">Section A — A&nbsp;&nbsp;·&nbsp;&nbsp;T01{' // '}profile&nbsp;&nbsp;·&nbsp;&nbsp;the building was already there</Micro>
        </Sp>

        {/* studio */}
        <Sp s="m">
          <SecHead kick="Studio" title="Two series on chance and overlay" text="What happens when several layers sit on top of each other — and who, or what, decides how they meet. One series answers with chance, the other with drawing."
            links={[{ label: 'Conceptual Interference ( 15 )', href: '/studio/conceptual-interference/' }, { label: 'Layer Paintings ( 4 )', href: '/studio/layer-paintings/' }, { label: 'Scenography', soon: 'scenography' }]} read={{ label: 'Enter the Studio', href: '/studio/' }} />
          <div className="g2 home__studio">
            <A className="shot" href="/studio/conceptual-interference/"><Img slot="art/CI-detail" ratio="612/560" w={612} sizes="(min-width:1440px) 612px, 50vw"><span className="shot__t"><b>Conceptual Interference</b><small>15 plates · 2025 · View the series&nbsp;&nbsp;→</small></span></Img></A>
            <A className="shot" href="/studio/layer-paintings/"><Img slot="art/LP-detail" ratio="612/560" w={612} sizes="(min-width:1440px) 612px, 50vw"><span className="shot__t"><b>Layer Paintings</b><small>4 triptychs · 2025 · View the series&nbsp;&nbsp;→</small></span></Img></A>
          </div>
        </Sp>
      </div>
    </div>
  );
}
