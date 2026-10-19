'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { SignGlyphs, SignRow } from '@/components/header/Header';
import { BagCount } from '@/components/shop/BagCount';
import type { MenuEntry, MenuWorld } from '@/content/menu';
import { useDialog } from '@/lib/a11y/use-dialog';
import { cx } from '@/lib/cx';

const FADE_MS = 1200;
/** The title and the caption of the window when there is nothing to say: a line of text all the same, so the window does not jump when one appears. */
const BLANK = '\u00a0';

/** Index of the picture on show; two to four pictures cross-fade every 1.2 s — not when the visitor asks for reduced motion. */
function useCrossFade(urls: string[]): number {
  const key = urls.join('|');
  const [state, setState] = useState({ key, i: 0 });
  useEffect(() => {
    if (urls.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setState((s) => ({ key, i: (s.key === key ? s.i : 0) + 1 })), FADE_MS);
    return () => window.clearInterval(t);
  }, [key, urls.length]);
  const i = state.key === key ? state.i : 0;
  return urls.length ? i % urls.length : 0;
}

/** The window of the menu: the pictures exist only between the brackets (one rule with header and lens). */
function MenuWindow({ urls, title, cap }: { urls: string[]; title: string; cap: string }) {
  const on = useCrossFade(urls);
  return (
    <aside className="mp__field" aria-hidden="true">
      <p className="mp__ft">{title || BLANK}</p>
      <div className="bwin mp__win">
        <span className="bwin__g bwin__g--l">(</span>
        <span className="bwin__pic">{urls.map((u, k) => <span key={u} className={cx('bwin__img', k === on && 'is-on')} style={{ backgroundImage: `url(${u})` }} />)}</span>
        <span className="bwin__g bwin__g--r">)</span>
      </div>
      <p className="mp__fc">{cap || BLANK}</p>
    </aside>
  );
}

/** One room: up to four columns, the window, "Enter the …". `live` = the menu is open on this room — only then are pictures loaded. */
function WorldPanel({ world, shown, live, onNavigate }: { world: MenuWorld; shown: boolean; live: boolean; onNavigate: () => void }) {
  const [hover, setHover] = useState<MenuEntry | null>(null);
  // A room that is not on show (menu closed, another tab chosen) has nothing hovered or focused: it opens on its own pictures
  // again. The pointer cannot say so — mouse-leave never comes when the focus was on a row — so it is reset here, while rendering.
  if (!live && hover) setHover(null);
  const show = (e: MenuEntry) => () => { if (e.win.length) setHover(e); };
  const row = (e: MenuEntry, key: string) => (e.href
    ? <li key={key}><Link className="mp__it" href={e.href} onClick={onNavigate} onMouseEnter={show(e)} onFocus={show(e)}><span className="mp__t">{e.label}</span>{e.count && <small>{e.count}</small>}</Link></li>
    : <li key={key}><span className="mp__it soon"><span className="soon__t">{e.label}</span><small className="soon__n">coming soon</small></span></li>);
  const urls = live ? (hover?.win.length ? hover.win : world.win) : [];
  return (
    <div className="mp__body" id={`mp-${world.id}`} role="tabpanel" aria-labelledby={`mp-tab-${world.id}`} hidden={!shown} onMouseLeave={() => setHover(null)}>
      <div className="mp__cols">
        {world.columns.map((col, c) => (
          <div className="mp__col" key={c}>
            {col.map((g, k) => (
              <section className="mp__grp" key={k}>
                {g.head.href
                  ? <h3 className="mp__h"><Link href={g.head.href} onClick={onNavigate} onMouseEnter={show(g.head)} onFocus={show(g.head)}><span className="mp__t">{g.head.label}</span></Link><small>{g.head.count ?? g.note ?? ''}</small></h3>
                  : <h3 className="mp__h soon"><span className="soon__t">{g.head.label}</span><small className="soon__n">coming soon</small></h3>}
                {g.items.length > 0 && <ul>{g.items.map((e, i) => row(e, `${k}-${i}`))}</ul>}
              </section>
            ))}
          </div>
        ))}
        <MenuWindow urls={urls} title={hover ? `${world.label} / ${hover.label}` : ''} cap={hover ? hover.cap : world.cap} />
      </div>
      <Link className="mp__enter" href={world.enter.href} onClick={onNavigate}>{world.enter.label}&nbsp;&nbsp;→</Link>
    </div>
  );
}

/**
 * The menu (M2): one panel per room, dropped from the top over the header; the page behind is dimmed.
 * All five panels are in the HTML (crawlers, link check); only the chosen one is shown.
 */
export function MenuPanel({ worlds }: { worlds: MenuWorld[] }) {
  const { menu, openMenu, closeMenu, openSearch } = useChrome();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialog(ref, menu.open, closeMenu, closeRef);
  const current = worlds.find((w) => w.id === menu.tab) ?? worlds[0];
  const onTabs = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = worlds.findIndex((w) => w.id === current.id);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? worlds.length - 1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const id = worlds[(next + worlds.length) % worlds.length].id;
    openMenu(id);
    document.getElementById(`mp-tab-${id}`)?.focus();
  };

  return (
    <>
      <div className={cx('mp__dim', menu.open && 'is-open')} onClick={closeMenu} aria-hidden="true" />
      <div ref={ref} id="menu" className={cx('mp', menu.open && 'is-open')} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!menu.open} inert={!menu.open}>
        <div className="mp__in">
          <div className="mp__top">
            <div className="mp__tabs" role="tablist" aria-label="Rooms" onKeyDown={onTabs}>
              {worlds.map((w) => (
                <button key={w.id} id={`mp-tab-${w.id}`} type="button" role="tab" aria-selected={w.id === current.id} aria-controls={`mp-${w.id}`} tabIndex={w.id === current.id ? 0 : -1} className={cx(w.quiet && 'is-quiet', w.id === current.id && 'is-on')} onClick={() => openMenu(w.id)}>{w.label}</button>
              ))}
            </div>
            <div className="mp__util">
              <button ref={closeRef} type="button" onClick={closeMenu}>( Close )</button>
              <button type="button" className="mp__search" onClick={openSearch}>Search</button>
              <Link href="/bag/" onClick={closeMenu}>Bag ( <BagCount /> )</Link>
            </div>
          </div>
          {worlds.map((w) => <WorldPanel key={w.id} world={w} shown={w.id === current.id} live={menu.open && w.id === current.id} onNavigate={closeMenu} />)}
          <div className="mp__foot">
            <span>{current.verb ? `( ${current.verb.toUpperCase()} )  ` : ''}{current.line ?? ''}</span>
            <span><Link href="/shipping/" onClick={closeMenu}>Shipping</Link> · <Link href="/contact/" onClick={closeMenu}>Contact</Link> · English</span>
          </div>
          <div className="mp__sign" aria-hidden="true"><SignRow /><SignGlyphs /></div>
          <div className="mp__sigb" />
        </div>
      </div>
    </>
  );
}
