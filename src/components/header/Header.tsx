'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useSyncExternalStore, type ReactNode } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { BagCount } from '@/components/shop/BagCount';
import { cx } from '@/lib/cx';
import { worldOf, type WorldId } from '@/lib/nav/world';
import { signGeometry, windowShape } from '@/lib/sign/geometry';

const G = signGeometry('ATELIER');
const SHAPE = windowShape('ATELIER');
const COMPACT_AFTER = 40;

/** x position on the sign row: .55 % padding + the fraction of the 98.9 % sign */
export const at = (fraction: number) => ({ left: `calc(.55cqw + 98.9cqw * ${fraction.toFixed(5)})` });

const subscribe = (cb: () => void) => {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
};
const useCompact = () => useSyncExternalStore(subscribe, () => window.scrollY > COMPACT_AFTER, () => false);

/** C ONCEPT. ( ATELIER ) C OLLECTIVE . — only the red pieces are visible. */
export function SignGlyphs() {
  return (
    <span className="hd__glyphs" aria-hidden="true">
      <span>C</span><span className="h">ONCEPT</span><span>. </span><span>(</span><span className="h">ATELIER</span><span>)</span><span> C</span><span className="h">OLLECTIVE</span><span> .</span>
    </span>
  );
}

/** The white sign row with the window cut out. */
export function SignRow() {
  return (
    <svg className="hd__bg" viewBox={SHAPE.viewBox} preserveAspectRatio="none" aria-hidden="true">
      <path d={SHAPE.d} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}

/**
 * What reads the address waits in a Suspense boundary: on a dynamic route whose params are not known at build time
 * (cacheComponents) reading it suspends. The boundaries have to stay small. Once the shell passes about 12.8 KB, React
 * sends every boundary of more than 500 bytes after it and reveals it some 300 ms late; a label is about 200 bytes and
 * stays in the shell. So wrap each label, never the row or the header.
 */
const Small = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>;

/** A room label: Factory, Atelier or Studio, bracketed on the page of its room. */
function Room({ id, text, x, first = false }: { id: WorldId; text: string; x: number; first?: boolean }) {
  const world = worldOf(usePathname());
  const { menu, openMenu } = useChrome();
  return (
    <button type="button" className={cx(first && 'is-first', world === id && 'is-on')} style={at(x)} aria-haspopup="dialog" aria-controls="menu" aria-expanded={menu.open && menu.tab === id} onClick={() => openMenu(id)}>
      {world === id ? `( ${text} )` : text}
    </button>
  );
}

/** Campaigns and About, grey, on the right. */
function Side({ id, text }: { id: 'campaigns' | 'about'; text: string }) {
  const world = worldOf(usePathname());
  const { menu, openMenu } = useChrome();
  return <button type="button" className={cx(world === id && 'is-on')} aria-haspopup="dialog" aria-controls="menu" aria-expanded={menu.open && menu.tab === id} onClick={() => openMenu(id)}>{text}</button>;
}

/** The ( or ) of the sign beside Atelier: on every page but the Factory and Studio rooms, which bracket their own label. */
function Bracket({ x, glyph }: { x: number; glyph: string }) {
  const world = worldOf(usePathname());
  return world === 'factory' || world === 'studio' ? null : <span className="hd__br" style={at(x)} aria-hidden="true">{glyph}</span>;
}

/**
 * The header (variant B): fixed, white — except between the brackets, where the page scrolls by.
 * After 40 px the circles F · A · S and the room labels fold away; the sign stays at full width.
 */
export function Header() {
  const compact = useCompact();
  const { menu, openMenu, openSearch } = useChrome();
  return (
    <header className={cx('hd', compact && 'is-compact')} data-header>
      <div className="hd__in">
        <div className="hd__top">
          <span className="hd__bb" style={at(G.xF)} aria-hidden="true"><i>F</i><b /></span>
          <span className="hd__bb" style={at(G.xA)} aria-hidden="true"><i>A</i><b /></span>
          <span className="hd__bb" style={at(G.xS)} aria-hidden="true"><i>S</i><b /></span>
          <div className="hd__util">
            <button type="button" aria-haspopup="dialog" aria-controls="menu" aria-expanded={menu.open} onClick={() => openMenu()}>Menu</button>
            <button type="button" className="hd__search" onClick={openSearch}><span>Search</span><i /></button>
            <Link href="/bag/">Bag ( <BagCount /> )</Link>
          </div>
        </div>
        <Link className="hd__sign" href="/" aria-label="Concept. ( ) Collective — home">
          <SignRow />
          <span className="hd__axis" style={at(G.xA)} aria-hidden="true" />
          <SignGlyphs />
        </Link>
        <nav className="hd__bot" aria-label="Rooms">
          <Small><Room id="factory" text="Factory" x={G.xF} first /></Small>
          <Small><Bracket x={G.brL} glyph="(" /></Small>
          <Small><Room id="atelier" text="Atelier" x={G.xA} /></Small>
          <Small><Bracket x={G.brR} glyph=")" /></Small>
          <Small><Room id="studio" text="Studio" x={G.xS} /></Small>
          <span className="hd__r">
            <Small><Side id="campaigns" text="Campaigns" /></Small>
            <Small><Side id="about" text="About" /></Small>
          </span>
        </nav>
        <div className="hd__hair" />
      </div>
    </header>
  );
}
