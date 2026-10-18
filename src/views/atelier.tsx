import { Room } from '@/components/blocks';
import { A } from '@/components/link';
import { QEnd, Sp } from '@/components/quiet';
import { FashionFilter } from '@/components/shop/FashionFilter';
import { Soon } from '@/components/soon';
import { Rail, Tile } from '@/components/tiles';
import { AxisV, Coming, Crumb, Img, Rule, ShopPoint } from '@/components/ui';
import { getCatalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';

/** ATELIER hub (sheet 03) */
export async function AtelierPage() {
  const cat = await getCatalog();
  const fashion = cat.pick(['JK-004', 'SH-001', 'VT-001', 'TR-001']);
  const newIn = cat.pick(['BG-NEW', 'BR-A', 'OB-037', 'SH-004']);
  return (
    <div className="q atelier">
      <div className="triptych n-bleed" aria-label="The workshop, in three pictures">
        <Img slot="fashion/JK-001" ratio="610/940" pos="50% 24%" w={610} eager className="tri__a" sizes="(min-width:1440px) 550px, 44vw" />
        <Img slot="bags/BG-NEW" ratio="350/940" pos="50% 46%" w={350} eager className="tri__b" sizes="(min-width:1440px) 350px, 28vw" />
        <Img slot="scan/OB-011" ratio="350/940" ground w={350} eager className="tri__c" sizes="(min-width:1440px) 350px, 28vw" />
        <span className="over"><AxisV x={44} light /><AxisV x={72} light /></span>
        <p className="micro tri__l tri__l1">Fashion</p><p className="micro tri__l tri__l2">Accessories</p><p className="micro tri__l tri__l3">Objects</p>
      </div>
      <Sp s="s"><Crumb items={[{ label: 'Atelier' }]} /></Sp>
      <Sp s="s">
        <header className="head6">
          <div className="head6__l">
            <h1 className="title">Atelier</h1>
            <p className="micro">( to make )&nbsp;&nbsp;the workshop</p>
            <p className="head6__p">Where the thesis becomes an object you can own. Everything here is cut, cast or printed in small series — and everything here can be bought.</p>
          </div>
          <p className="head6__r"><A href="/atelier/fashion/">Fashion ( 18 )</A> · <A href="/atelier/bags/">Accessories ( 4 )</A> · <A href="/atelier/jewellery/">Jewellery ( 5 )</A> · <A href="/atelier/scan-series/">Objects ( 15 )</A> · <Soon k="furniture" /></p>
        </header>
      </Sp>
      <Sp s="m">
        <Rail title="Fashion" note="( 18 )" right={<A href="/atelier/fashion/">All 18 pieces&nbsp;&nbsp;→</A>} items={fashion} ratio="17/21" />
      </Sp>
      <Sp s="m"><Room slot="bags/BG-NEW" pos="50% 44%" kick="Accessories" title="Bag / Profile Series" href="/atelier/bags/" text="Carrying as a spatial question. Profiles, chambers and constructive logic instead of fashion types — mobile architecture at the scale of the body. Four bags drawn into the series, eleven still to come." links={[{ label: 'Bags ( 4 )', href: '/atelier/bags/' }, { label: 'Leather', href: '/atelier/bags/' }, { label: 'Read the text', soon: 'bagText' }]} /></Sp>
      <Sp s="m"><Room slot="jewellery/hero" pos="50% 42%" kick="Jewellery" title="Ordinary Objects, in silver" href="/atelier/jewellery/" text="A spirit level, a screw clamp, a sheet of corrugated metal, a structural profile, a folding clasp — reforged exactly, in silver and gold. Not referenced. Translated." links={[{ label: 'Bangles ( 3 )', href: '/atelier/jewellery/' }, { label: 'Cuffs ( 1 )', href: '/atelier/jewellery/' }, { label: 'Bracelets ( 1 )', href: '/atelier/jewellery/' }, { label: 'Rings', soon: 'rings' }, { label: 'Read the text', href: '/factory/ordinary-objects/' }]} /></Sp>
      <Sp s="m"><Room slot="scan/life-garden" pos="50% 56%" kick="Objects" title="Scan Series" href="/atelier/scan-series/" text="Fifteen found objects scanned, printed in ceramic and glazed by hand. The form is a perfect copy; the surface never repeats. The same thesis as the jewellery, at the scale of a table." links={[{ label: 'Vases ( 3 )', href: '/atelier/scan-series/' }, { label: 'Catch-alls ( 5 )', href: '/atelier/scan-series/' }, { label: 'Holders ( 4 )', href: '/atelier/scan-series/' }, { label: 'Trays ( 3 )', href: '/atelier/scan-series/' }]} /></Sp>
      <Sp s="m">
        <Coming title="Furniture&nbsp;&nbsp;( )" text="The profile at the scale of a room. In work." link="Notify me&nbsp;&nbsp;→" href="/contact/?subject=notify-furniture" />
        <p className="coming-note">The Atelier only shows what exists. The empty bracket is the inventory of what does not — kept visible on purpose.</p>
      </Sp>
      <Sp s="m"><Rail title="New in" right={<A href="/atelier/fashion/">All new&nbsp;&nbsp;→</A>} items={newIn} ratio="1/1.2" w={300} /></Sp>
      <Sp s="m"><QEnd sheet="Atelier" index="A / 01 – 04" thesis="T01 · T02" crumb={[{ label: 'Atelier' }]} /></Sp>
    </div>
  );
}

/** FASHION (sheet 04) */
export async function FashionPage() {
  const cat = await getCatalog();
  const groups: [string, string][] = [['jackets', 'Jackets'], ['shirts', 'Shirts'], ['trousers', 'Trousers'], ['vests', 'Vests']];
  const jk1 = cat.byId('JK-001');
  return (
    <div className="q fashion">
      <div className="hero2 n-bleed">
        <Img slot="fashion/hero-1" ratio="610/1020" pos="50% 20%" w={620} eager sizes="(min-width:1440px) 620px, 50vw" className="hero2__a" />
        <Img slot="fashion/hero-2" ratio="610/1020" pos="50% 40%" w={620} eager sizes="(min-width:1440px) 620px, 50vw" className="hero2__b" />
        <span className="over">
          <AxisV x={25} light /><AxisV x={75} light />
          {jk1 && <ShopPoint px={24} py={56} lx={12} ly={30} code={jk1.code} name="jacket, white" sub="Cotton canvas" price={fmtPrice(jk1.priceCents)} href={jk1.href} product={toSummary(jk1)} side={-1} />}
        </span>
        <div className="hero2__t"><p className="micro on-img">Atelier / Fashion&nbsp;&nbsp;—&nbsp;&nbsp;T01{' // '}profile</p><p className="hero2__h">A shoulder that behaves like a lintel</p></div>
      </div>
      <Sp s="s"><Crumb items={[{ label: 'Atelier', href: '/atelier/' }, { label: 'Fashion' }]} /></Sp>
      <Sp s="s">
        <header className="head6">
          <div className="head6__l">
            <h1 className="title">Fashion <span className="sub">( {cat.shop('fashion').length} )</span></h1>
            <p className="micro">{'//'} cut like a section</p>
            <p className="head6__p">Eighteen pieces built from one profile. Seams sit where a joint would sit; a shoulder carries the way a lintel carries. Cut once, in small series, and not re-issued.</p>
          </div>
          <p className="head6__r"><A href="/factory/tectonics-without-origin/">Tectonics without origin — the text&nbsp;&nbsp;→</A><br /><span className="sub">Why the garment is drawn before it is cut.</span></p>
        </header>
      </Sp>
      <FashionFilter groups={groups.map(([g, l]) => ({ id: g, label: l, n: cat.group('fashion', g).length }))} total={cat.shop('fashion').length}>
        {groups.map(([g, l], gi) => (
          <section className="fgrp" key={g} id={g} data-group={g} aria-label={l}>
            {gi > 0 && <Rule title={l} note={`( ${cat.group('fashion', g).length} )`} />}
            <div className="g4">{cat.group('fashion', g).map((p) => <Tile key={p.id} p={p} ratio="17/21" w={300} />)}</div>
            {g === 'jackets' && (
              <A className="break" href="/campaigns/01/">
                <Img slot="fashion/break" ratio="1248/600" pos="50% 36%" w={1248} sizes="(min-width:1440px) 1248px, 92vw">
                  <span className="break__t">The grey band is not styling.<br /><span>It is whatever the building offered at that height.</span></span>
                  <span className="break__g">Campaign ( 01 )&nbsp;&nbsp;→</span>
                </Img>
              </A>
            )}
          </section>
        ))}
      </FashionFilter>
      <Sp s="m"><Coming title="Outerwear&nbsp;&nbsp;( )" text="The profile at coat length. Cut, not yet made." link="Notify me&nbsp;&nbsp;→" href="/contact/?subject=notify-outerwear" /></Sp>
      <Sp s="m"><QEnd sheet="Fashion" index="JK · SH · TR · VT" thesis="T01" cf={<>Cf.&nbsp;&nbsp;<span>Tectonics without origin</span>&nbsp;&nbsp;<A href="/factory/tectonics-without-origin/">Read&nbsp;&nbsp;→</A></>} crumb={[{ label: 'Atelier', href: '/atelier/' }, { label: 'Fashion' }]} /></Sp>
    </div>
  );
}
