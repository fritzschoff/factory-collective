import { Suspense, type ReactNode } from 'react';
import { Prose, Statement } from '@/components/blocks';
import { ContactForm } from '@/components/forms/ContactForm';
import { A } from '@/components/link';
import { QEnd, QOpen, Sp } from '@/components/quiet';
import { BagCount } from '@/components/shop/BagCount';
import { BagView } from '@/components/shop/BagView';
import { ClearBag } from '@/components/shop/ClearBag';
import { Tile } from '@/components/tiles';
import { Crumb, Img, Museum, Pill, Register, Rule, Sign } from '@/components/ui';
import { SITE } from '@/content/site';
import { ABOUT } from '@/content/texts';
import { getCatalog } from '@/lib/data/catalog';
import { toSummary } from '@/lib/products/summary';

/** BAG (sheet 20) — the frame is built here; the list itself is drawn in the browser from localStorage (BagView). */
export async function BagPage() {
  const cat = await getCatalog();
  const rail = cat.pick(['BR-B', 'OB-021', 'BG-114', 'TR-002']);
  return (
    <div className="q bagpage">
      <Sp s="s" className="q-top" />
      <Crumb items={[{ label: 'Bag' }]} />
      <div className="bag">
        <header className="bag__h"><h1 className="title">Bag <span className="sub">( <BagCount /> )</span></h1><p className="sub">Everything is made in a small series. Pieces are held for 30 minutes once you check out.</p></header>
        <BagView products={Object.fromEntries(cat.products.map((p) => [p.id, toSummary(p)]))} />
        <p className="bag__back"><A href="/atelier/">◂&nbsp;&nbsp;Continue shopping</A></p>
      </div>
      <Sp s="m"><div className="g4 q-idx"><div className="g4__h"><Rule title="Cf." note="— others also looked at" /></div>{rail.map((p) => <Tile key={p.id} p={p} ratio="1/1.2" w={290} ground={p.ground} />)}</div></Sp>
    </div>
  );
}

export function ThankYouPage() {
  return (
    <div className="q">
      <ClearBag />
      <Sp s="l" className="q-top" />
      <QOpen kick="Bag / Order" meta="Thank you" title="Thank you">Your order is placed.<br /><span className="g">A receipt from Stripe is on its way to your inbox; we write again when the piece leaves the workshop.</span></QOpen>
      <Sp s="l"><div className="pills"><Pill href="/atelier/">Continue shopping&nbsp;&nbsp;→</Pill><Pill href="/campaigns/" ghost>Campaigns&nbsp;&nbsp;→</Pill></div></Sp>
      <Sp s="m"><QEnd sheet="Order" index="—" /></Sp>
    </div>
  );
}

/** ABOUT (sheet 21) */
export function AboutPage() {
  const rooms = [
    { slot: 'art/CI-detail', t: 'Factory', k: '( to think )', d: 'Texts, theses, glossary', href: '/factory/', pos: 'center' },
    { slot: 'fashion/JK-001', t: 'Atelier', k: '( to make )', d: 'Fashion, accessories, jewellery, objects', href: '/atelier/', pos: '50% 22%' },
    { slot: 'art/LP-detail', t: 'Studio', k: '( to enter )', d: 'Art, exhibitions, sound', href: '/studio/', pos: 'center' }
  ];
  return (
    <div className="q">
      <Sp s="m" className="q-top" />
      <section className="paper-hero paper-hero--sign">
        <p className="micro">Concept. ( Factory ) Collective</p>
        <div className="paper-hero__sign"><div className="markbar__in"><Sign word="FACTORY" win="open" /></div></div>
        <p className="paper-hero__line">The brackets are not decoration. They are an opening — and they stay empty on purpose.</p>
        <p className="micro paper-hero__dim">the window</p>
      </section>
      <Sp s="s"><Crumb items={[{ label: 'About' }]} /></Sp>
      <Sp s="s"><h1 className="title title--l">One sign, three rooms</h1></Sp>
      <Sp s="m"><Prose a={ABOUT.a} b={ABOUT.b} /></Sp>
      <Sp s="l">
        <div className="g3 rooms">{rooms.map((r) => (
          <A key={r.t} href={r.href} className="rooms__i"><Img slot={r.slot} ratio="400/520" pos={r.pos} w={400} sizes="(min-width:1440px) 400px, 32vw" /><p className="rooms__t"><b>{r.t}</b>&nbsp;&nbsp;<span className="sub">{r.k}</span></p><p>{r.d}</p><p>Enter&nbsp;&nbsp;→</p></A>
        ))}</div>
      </Sp>
      <Sp s="xl"><Statement w="1000px">An object should be able to name the sentence it came out of.</Statement></Sp>
      <Sp s="l">
        <Rule title="The practice" />
        <div className="museum-grid practice">
          <Museum rows={[['Founded', '[ year ]'], ['Based', '[ place ]'], ['People', '[ n ]']]} />
          <Museum rows={[['Production', 'Small series, numbered'], ['Repair', 'Lifetime, all pieces'], ['Stockists', '[ list ]']]} />
          <Museum rows={[['Press', 'press@[ domain ]'], ['Wholesale', 'trade@[ domain ]'], ['General', SITE.email]]} />
          <Museum rows={[['Studio visits', 'By appointment'], ['Instagram', '@[ handle ]'], ['Newsletter', 'One letter a month']]} />
        </div>
      </Sp>
      <Sp s="l">
        <Rule title="Read next" />
        <Register rows={[
          { no: '01', name: 'Tectonics without origin', meta: 'Objects from a world that was never built', href: '/factory/tectonics-without-origin/', link: 'Read' },
          { no: '02', name: 'Ordinary Objects', meta: 'On reproduction, the hand, and what a found form owes to nobody', href: '/factory/ordinary-objects/', link: 'Read' },
          { no: '03', name: 'Bag / Profile Series', meta: 'Mobile architecture at the scale of the body', link: 'Read', soon: 'bagText' }
        ]} />
      </Sp>
      <Sp s="m"><QEnd sheet="About" index="—" crumb={[{ label: 'About' }]} /></Sp>
    </div>
  );
}

/** CONTACT — also the target of every "Notify me" */
export function ContactPage() {
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="About / Contact" meta="We answer within two working days" title="Contact">Write to us about an order, an original, a fitting, or a piece that is not yet made.</QOpen>
      <Sp s="l">
        <div className="contact">
          <Suspense fallback={<p className="g">Loading the form …</p>}><ContactForm /></Suspense>
          <Museum rows={[['General', SITE.email], ['Press', 'press@[ domain ]'], ['Wholesale', 'trade@[ domain ]']]} className="contact__m" />
        </div>
      </Sp>
      <Sp s="m"><QEnd sheet="Contact" index="—" crumb={[{ label: 'About', href: '/about/' }, { label: 'Contact' }]} /></Sp>
    </div>
  );
}

/** Plain information pages. The wording is a first draft; the legal pages must be completed by counsel. */
const Doc = ({ kick, title, lead, children, sheet, flag }: { kick: string; title: string; lead?: ReactNode; children: ReactNode; sheet: string; flag?: boolean }) => (
  <div className="q">
    <Sp s="l" className="q-top" />
    <QOpen kick={kick} title={title}>{lead}</QOpen>
    {flag && <Sp s="s"><p className="flag"><span className="r">( )</span>&nbsp; Placeholder text. To be completed and checked by a lawyer before launch.</p></Sp>}
    <Sp s="l"><div className="doc">{children}</div></Sp>
    <Sp s="m"><QEnd sheet={sheet} index="—" crumb={[{ label: kick.split(' / ')[0] }, { label: title }]} /></Sp>
  </div>
);
const H = ({ children }: { children: ReactNode }) => <h2 className="doc__h">{children}</h2>;

export const ShippingPage = () => (
  <Doc kick="Client services" title="Shipping" sheet="Shipping" lead="Insured, tracked, from [ place ].">
    <H>Lead times</H><p>Fashion ships in 5 working days. Jewellery is made to order and ships in 3 – 4 weeks. Bags are made to order and ship in 4 weeks. Scan Series objects are made after you order them and ship in 2 weeks. Prints ship in 3 weeks.</p>
    <H>Where we ship</H><p>Germany, Austria, Switzerland, France, Italy, the Netherlands, Belgium, Spain, the United Kingdom and the United States. Other countries on request.</p>
    <H>Cost</H><p>[ Shipping cost and free-shipping threshold to be confirmed. ] Duties and taxes outside the EU are calculated at checkout.</p>
    <H>Original artworks</H><p>Originals are shipped in a crate, insured at the sale price, and arranged individually after the enquiry.</p>
  </Doc>
);
export const ReturnsPage = () => (
  <Doc kick="Client services" title="Returns" sheet="Returns" lead="Free within 30 days, if the piece is unworn.">
    <H>Fashion</H><p>Free returns within 30 days if the piece is unworn and the tags are on. Write to us first and we send a label.</p>
    <H>Jewellery</H><p>Free returns within 14 days if the size does not fit. Made-to-order pieces in a custom size cannot be returned.</p>
    <H>Bags, objects, prints</H><p>Made to order and made after you order them: not returnable, but repaired for life. Prints that arrive damaged are replaced.</p>
    <H>Repair</H><p>Lifetime repair on every piece, free of charge: restitching, edge re-dye, hardware, re-glazing where possible.</p>
  </Doc>
);
export const FaqPage = () => (
  <Doc kick="Client services" title="FAQ" sheet="FAQ" lead="The short answers.">
    {[
      ['How are the sizes cut?', 'Straight, with a dropped shoulder. Size 50 corresponds to a body measure of 58 cm; the size guide is in the product page, under Measurements.'],
      ['Why are some things marked ( )?', 'Because they are drawn and not yet made. The empty brackets are part of the inventory. Use “Notify me” and we write when they exist.'],
      ['Will a piece come back?', 'No. A series is not re-issued once it is over.'],
      ['Why does my ceramic look different from the photograph?', 'The glaze is poured by hand. Every piece is a little different; that is the piece, not a defect.'],
      ['Can I see an original in person?', 'Yes, by appointment. Use the enquiry on the work page.'],
      ['Do you ship art?', 'Yes. Prints ship in a tube or flat in a box, originals in a crate; both insured.']
    ].map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><p>{a}</p></details>)}
  </Doc>
);
export const ImprintPage = () => (
  <Doc kick="Company" title="Imprint" sheet="Imprint" flag>
    <p>Concept. ( Factory ) Collective<br />[ legal form ]<br />[ street, number ]<br />[ postcode, city ]<br />[ country ]</p>
    <p>E-mail: {SITE.email}<br />Phone: [ number ]</p>
    <p>Represented by: [ name ]<br />Commercial register: [ court, number ]<br />VAT ID: [ number ]</p>
  </Doc>
);
export const PrivacyPage = () => (
  <Doc kick="Company" title="Privacy" sheet="Privacy" flag>
    <H>What this site stores</H><p>Your bag is kept in your browser (local storage). Nothing about it is sent to us until you check out. Newsletter sign-ups and enquiries are stored with your e-mail address so we can answer them.</p>
    <H>Payments</H><p>Payments are processed by Stripe Payments Europe, Ltd. We do not see or store your card details.</p>
    <H>Your rights</H><p>You can ask us to show or delete what we hold about you at any time: {SITE.email}.</p>
  </Doc>
);
export const TermsPage = () => (
  <Doc kick="Company" title="Terms" sheet="Terms" flag>
    <H>Contract</H><p>[ General terms of sale to be inserted. ]</p>
    <H>Withdrawal</H><p>[ Right of withdrawal and the exceptions for made-to-order goods to be inserted. ]</p>
  </Doc>
);
export function NotFoundPage() {
  return (
    <div className="q">
      <Sp s="l" className="q-top" />
      <QOpen kick="404" meta="Page not found" title={<>Not here <span className="r">( )</span></>}>This page is drawn nowhere.<br /><span className="g">Try the menu, or the search.</span></QOpen>
      <Sp s="l"><div className="pills"><Pill href="/">Home&nbsp;&nbsp;→</Pill><Pill href="/atelier/" ghost>Atelier&nbsp;&nbsp;→</Pill><Pill href="/studio/" ghost>Studio&nbsp;&nbsp;→</Pill></div></Sp>
    </div>
  );
}
