'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { useDialog } from '@/lib/a11y/use-dialog';
import { cx } from '@/lib/cx';
import { groupByKind, searchEntries, type SearchEntry } from '@/lib/search/index';

const CODES = ['SH / 001', 'OB / 011', 'CI / 07'];

/** Full-screen search over pages and pieces; `/` or ⌘K opens it from anywhere. */
export function Search({ index, quick }: { index: SearchEntry[]; quick: { label: string; href: string }[] }) {
  const { searchOpen, openSearch, closeSearch } = useChrome();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(-1);
  useDialog(ref, searchOpen, closeSearch, input);
  const groups = useMemo(() => groupByKind(searchEntries(index, q)), [index, q]);
  // the order on screen (grouped by kind) — the arrow keys walk it, Enter opens it
  const flat = useMemo(() => groups.flatMap(([, list]) => list), [groups]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement).tagName);
      if (!typing && (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey)))) { e.preventDefault(); openSearch(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openSearch]);

  // The search scrolls, not the page: keep the arrowed row on screen (the nearest edge only, so the list does not jump).
  useEffect(() => {
    if (sel >= 0) ref.current?.querySelector('.sres__a.is-sel')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const go = (href: string) => { closeSearch(); router.push(href); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && flat.length) {
      e.preventDefault();
      const down = e.key === 'ArrowDown';
      setSel((s) => (s < 0 ? (down ? 0 : flat.length - 1) : (s + (down ? 1 : -1) + flat.length) % flat.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flat[Math.max(sel, 0)];
      if (hit) go(hit.h);
    }
  };

  return (
    <div ref={ref} id="search" className="search" role="dialog" aria-modal="true" aria-label="Search" hidden={!searchOpen}>
      <div className="search__top"><span className="micro">Search</span><button type="button" onClick={closeSearch}>( Close )</button></div>
      <form className="search__form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="q" className="sr">Search the site</label>
        <input ref={input} id="q" type="search" autoComplete="off" placeholder="Search — a piece, a code, a text" value={q} onChange={(e) => { setQ(e.target.value); setSel(-1); }} onKeyDown={onKeyDown} />
      </form>
      <div className="search__res" aria-live="polite">
        {q.trim() && !flat.length && <p className="sres__none">Nothing drawn under that name. ( )</p>}
        {groups.map(([kind, list]) => (
          <section className="sres__g" key={kind}>
            <h3>{kind}</h3>
            {list.map((x) => (
              <Link key={x.h + x.n} className={cx('sres__a', flat.indexOf(x) === sel && 'is-sel')} href={x.h} onClick={closeSearch}>
                <span className="sres__t">{x.i && <Image src={x.i} alt="" width={54} height={66} />}</span>
                <span className="sres__n">{x.n}<br /><span className="sres__m">{x.s}</span></span>
                <span className="sres__m">{x.p ?? ''}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>
      {!q.trim() && (
        <div className="search__hint">
          <p className="micro">Quick ways in</p>
          <p>{quick.map((l, i) => <span key={l.href}>{i > 0 && ' · '}<Link href={l.href} onClick={closeSearch}>{l.label}</Link></span>)}</p>
          <p className="micro">Try a code: {CODES.map((c, i) => <span key={c}>{i > 0 && ' · '}<button type="button" onClick={() => { setQ(c); input.current?.focus(); }}>{c}</button></span>)}</p>
        </div>
      )}
    </div>
  );
}
