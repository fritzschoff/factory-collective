import type { ReactNode } from 'react';
import type { RouteDef } from '../lib/types';
import { ctx } from '../lib/runtime';
import { resolve, track, url as imgUrl } from '../lib/images';
import { FOOTER, MENU_BOTTOM, NAV, type NavItem } from '../content/nav';
import { SITE } from '../content/site';
import { BracketWindow, Sign, cx, signGeometry } from './ui';

/* ═════════ header: the band ═════════ */
function Band({ route, variant = 'page' }: { route: RouteDef; variant?: 'page' | 'menu' }) {
  const g = signGeometry('ATELIER');
  const world = route.world ?? null;
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
  const lab = (id: 'factory' | 'atelier' | 'studio', text: string, x: number) => {
    const on = world === id;
    return <a key={id} className={cx('bn__l', on && 'is-on')} style={{ left: pct(x) }} href={`/${id}/`} aria-current={on ? 'page' : undefined}><span>{on ? `( ${text} )` : text}</span><i /></a>;
  };
  const band = route.band ? { slot: route.band.slot, pos: route.band.pos } : undefined;
  const bubble = (k: string, x: number) => <span key={k} className="bb" style={{ left: pct(x) }} aria-hidden="true"><i>{k}</i><b /></span>;
  return (
    <header className={cx('band', variant === 'menu' && 'band--menu')} data-band>
      <div className="band__util">
        {variant === 'menu'
          ? <button type="button" className="u-btn" data-menu-close>( Close )</button>
          : (<>
            <button type="button" className="u-btn" data-menu-open aria-haspopup="dialog" aria-controls="menu">Menu</button>
            <button type="button" className="u-search" data-search-open aria-label="Search"><span>Search</span><i /></button>
            <a className="u-bag" href="/bag/" data-bag-link>Bag ( <span data-bag-count>0</span> )</a>
          </>)}
      </div>
      <div className="band__frame">
        <div className="band__bub" aria-hidden="true">{bubble('F', g.xF)}{bubble('A', g.xA)}{bubble('S', g.xS)}</div>
        <Sign win={band ? 'image' : 'ink'} image={band} />
        <nav className="bn" aria-label="Worlds">
          {lab('factory', 'Factory', g.xF)}
          {lab('atelier', 'Atelier', g.xA)}
          {lab('studio', 'Studio', g.xS)}
          {(!world || world === 'atelier') && <><span className="bn__p" style={{ left: pct(g.brL) }} aria-hidden="true">(</span><span className="bn__p" style={{ left: pct(g.brR) }} aria-hidden="true">)</span></>}
          <span className="bn__r"><a href="/campaigns/" className={cx(route.active === 'campaigns' && 'is-on')}>Campaigns</a><a href="/about/" className={cx(route.active === 'about' && 'is-on')}>About</a></span>
        </nav>
      </div>
    </header>
  );
}

/** the slim bar that takes over when the large band has scrolled away */
function Bar({ route }: { route: RouteDef }) {
  const world = route.world ?? null;
  return (
    <div className="bar" data-bar aria-label="Navigation">
      <a className="bar__sign" href="/" aria-label="Concept. ( ) Collective — home"><span>C. ( ) C.</span></a>
      <nav className="bar__nav" aria-label="Worlds">
        {(['factory', 'atelier', 'studio'] as const).map((id) => <a key={id} href={`/${id}/`} className={cx(world === id && 'is-on')}>{world === id ? `( ${id[0].toUpperCase() + id.slice(1)} )` : id[0].toUpperCase() + id.slice(1)}</a>)}
      </nav>
      <div className="bar__r">
        <a href="/campaigns/" className="bar__x">Campaigns</a><a href="/about/" className="bar__x">About</a>
        <button type="button" data-menu-open>Menu</button>
        <button type="button" data-search-open>Search</button>
        <a href="/bag/" data-bag-link>Bag ( <span data-bag-count>0</span> )</a>
      </div>
    </div>
  );
}

/* ═════════ menu ═════════ */
const winUrls = (slots?: string[]) => (slots ?? []).map((s) => { track(s, 'window', 232); return imgUrl(s, 480); }).filter(Boolean).join('|');
function Row({ it, level }: { it: NavItem; level: 1 | 2 }) {
  const attrs: any = it.win ? { 'data-win': winUrls(it.win), 'data-cap': it.cap ?? '' } : {};
  return (
    <li className={cx('row', `row--${level}`, it.coming && 'is-coming')}>
      <a className="row__a" href={it.href ?? '#'} {...attrs} data-title={it.label.replace(/\s+/g, ' ')}>
        <span className="row__t">{it.label}</span>
        {(it.count || it.sub) && <span className="row__c">{it.count ? `( ${it.count} )` : it.sub}</span>}
        {it.sheet && <i className="row__s">{it.sheet}</i>}
      </a>
      {it.inline && <p className="row__in">{it.inline.map((l, i) => <span key={i}>{i > 0 && ' · '}<a href={l.href}>{l.label}</a></span>)}</p>}
      {it.children && <ul className="row__sub">{it.children.map((c, i) => <Row key={i} it={c} level={2} />)}</ul>}
    </li>
  );
}
function Menu({ route }: { route: RouteDef }) {
  return (
    <div className="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden data-menu>
      <Band route={route} variant="menu" />
      <div className="menu__body">
        <div className="menu__panel">
          {NAV.map((w) => (
            <section className={cx('bay', `bay--${w.id}`)} key={w.id} aria-labelledby={`bay-${w.id}`}>
              <span className="bay__b" aria-hidden="true">{w.letter}</span>
              <p className="micro bay__v">( {w.verb.toUpperCase()} )</p>
              <h2 className="bay__h" id={`bay-${w.id}`}><a href={w.href} data-win={winUrls(w.win)} data-cap="" data-title={w.label}>{w.label}</a></h2>
              <p className="bay__p">{w.line}</p>
              <ul className="bay__list">{w.groups.map((it, i) => <Row key={i} it={it} level={1} />)}</ul>
              <a className="bay__enter" href={w.href} data-win={winUrls(w.win)} data-title={w.label}>{w.enter}&nbsp;&nbsp;→<i>{w.sheet}</i></a>
            </section>
          ))}
          <aside className="menu__field" aria-hidden="true">
            <p className="micro menu__ft" data-win-title>&nbsp;</p>
            <BracketWindow h={100} w={232} className="menu__win" id="menu-win" />
            <p className="micro menu__fc" data-win-cap>&nbsp;</p>
          </aside>
        </div>
        <div className="menu__bottom">
          <div><p className="menu__bh"><a href="/campaigns/">Campaigns</a>&nbsp; ( 2 )</p><p>{MENU_BOTTOM.campaigns.map((c, i) => <span key={i}>{i > 0 && '  ·  '}<a href={c.href} className={cx((c as any).coming && 'r')}>{c.label}</a></span>)}</p></div>
          <div><p className="menu__bh"><a href="/about/">About</a></p><p>{MENU_BOTTOM.about.map((c, i) => <span key={i}>{i > 0 && '  ·  '}<a href={c.href}>{c.label}</a></span>)}</p></div>
          <div><p className="menu__bh"><a href="/bag/">Bag</a>&nbsp; ( <span data-bag-count>0</span> )</p><p><a href="/bag/">Checkout</a>  ·  <button type="button" data-search-open>Search</button>  ·  <span>English</span></p></div>
        </div>
      </div>
    </div>
  );
}

/* ═════════ search ═════════ */
function Search() {
  return (
    <div className="search" id="search" role="dialog" aria-modal="true" aria-label="Search" hidden data-search>
      <div className="search__top"><span className="micro">Search</span><button type="button" data-search-close>( Close )</button></div>
      <form className="search__form" role="search" action="/" method="get" onSubmit={undefined}>
        <label htmlFor="q" className="sr">Search the site</label>
        <input id="q" name="q" type="search" autoComplete="off" placeholder="Search — a piece, a code, a text" data-search-input />
      </form>
      <div className="search__res" data-search-results aria-live="polite" />
      <div className="search__hint" data-search-hint>
        <p className="micro">Quick ways in</p>
        <p><a href="/atelier/fashion/">Fashion ( 18 )</a> · <a href="/atelier/bags/">Bags</a> · <a href="/atelier/jewellery/">Jewellery ( 5 )</a> · <a href="/atelier/scan-series/">Scan Series ( 15 )</a> · <a href="/studio/conceptual-interference/">Conceptual Interference</a> · <a href="/studio/layer-paintings/">Layer Paintings</a> · <a href="/factory/">Texts</a></p>
        <p className="micro">Try a code: <button type="button" data-q="SH / 001">SH / 001</button> · <button type="button" data-q="OB / 011">OB / 011</button> · <button type="button" data-q="CI / 07">CI / 07</button></p>
      </div>
    </div>
  );
}

/* ═════════ footer ═════════ */
function Footer({ route }: { route: RouteDef }) {
  const d = new Date(ctx.generatedAt || Date.now());
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const col = (title: string, items: { label: string; href: string }[]) => (
    <div className="ft__c"><h2>{title}</h2><ul>{items.map((l) => <li key={l.href + l.label}><a href={l.href} {...(l.href.startsWith('http') ? { rel: 'noopener', target: '_blank' } : {})}>{l.label}</a></li>)}</ul></div>
  );
  return (
    <footer className="ft" id="newsletter">
      <div className="ft__grid">
        {col('Client services', FOOTER.service)}
        {col('Company', FOOTER.company)}
        {col('Follow', FOOTER.follow)}
        <div className="ft__c ft__news">
          <h2>Newsletter</h2>
          <p>New pieces, once a month.</p>
          <form className="nl" data-newsletter noValidate>
            <label className="sr" htmlFor="nl-mail">E-mail</label>
            <input id="nl-mail" name="email" type="email" required placeholder="E-mail" autoComplete="email" />
            <button type="submit">( Subscribe )</button>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
            <p className="nl__msg" role="status" data-msg />
          </form>
        </div>
      </div>
      <div className="ft__base">
        <div className="legend" aria-label="Legend">
          <span><i className="lg lg--solid" /> shown</span><span><i className="lg lg--hidden" /> Cf. — elsewhere</span><span><i className="lg lg--axis" /> axis</span><span className="r"><i className="lg lg--poss" /> coming</span><span><i className="lg lg--dot" /> other level</span>
        </div>
        <div className="tb" role="group" aria-label="Sheet">
          <div><span>{SITE.name}</span><span>{date}</span></div>
          <div><span>{route.sheet}</span><span>English</span></div>
        </div>
      </div>
      <p className="ft__c2">© {d.getFullYear()} {SITE.name}{ctx.demoPrices ? ' · demo prices' : ''}{ctx.mode !== 'strict' && ctx.mode !== 'stripe' && Object.keys(ctx.local).length === 0 && ctx.mode !== 'placeholders' ? ' · sample pictures' : ''}</p>
    </footer>
  );
}

/* ═════════ dialogs and toasts ═════════ */
function Dialogs() {
  return (
    <>
      <dialog className="dlg" id="enquire" data-enquire-dlg aria-labelledby="enq-t">
        <form method="dialog" className="dlg__f" data-enquire-form noValidate>
          <div className="dlg__top"><h2 id="enq-t" className="dlg__t">Enquire</h2><button type="button" data-dlg-close>( Close )</button></div>
          <p className="dlg__sub" data-enquire-what />
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
          <label>Message<textarea name="message" rows={4} placeholder="Where would it hang? Do you want to see it in person?" /></label>
          <input type="hidden" name="work" />
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
          <button className="pill" type="submit">Send enquiry</button>
          <p className="dlg__msg" role="status" data-msg />
        </form>
      </dialog>
      <div className="toast" role="status" aria-live="polite" data-toast hidden />
      <div className="qa" data-qa hidden />
    </>
  );
}

/* ═════════ the document ═════════ */
export function Document({ route, children }: { route: RouteDef; children: ReactNode }) {
  const title = route.path === '/' ? `${SITE.name} — ${SITE.tagline}` : `${route.title} — ${SITE.short}`;
  const canonical = ctx.siteUrl + (route.path.endsWith('.html') ? '' : route.path);
  if (route.og) track(route.og, '1200:630', 1200);
  const og = route.og ? resolve(route.og).src : null;
  const ogUrl = og ? (og.startsWith('http') ? og : ctx.siteUrl + og) : undefined;
  return (
    <html lang="en" data-world={route.world ?? 'none'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={route.description} />
        {route.noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={title} /><meta property="og:description" content={route.description} /><meta property="og:type" content="website" /><meta property="og:url" content={canonical} />
        {ogUrl && <meta property="og:image" content={ogUrl} />}
        <meta name="twitter:card" content={ogUrl ? 'summary_large_image' : 'summary'} />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preload" href="/fonts/archivo-black.woff" as="font" type="font/woff" crossOrigin="" />
        <link rel="preload" href="/fonts/arimo.woff" as="font" type="font/woff" crossOrigin="" />
        <link rel="stylesheet" href={ctx.assets.css} />
      </head>
      <body className={cx(route.world && `w-${route.world}`)}>
        <a className="skip" href="#main">Skip to content</a>
        <Band route={route} />
        <Bar route={route} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer route={route} />
        <Menu route={route} />
        <Search />
        <Dialogs />
        <script src={ctx.assets.js} defer />
        {ctx.dev && <script src="/__dev.js" defer />}
      </body>
    </html>
  );
}
