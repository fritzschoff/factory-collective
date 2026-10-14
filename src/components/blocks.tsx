import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { Tx } from '@/components/quiet';
import { Soon } from '@/components/soon';
import { Img } from '@/components/ui/img';
import { isSoon, soonHref, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/** A way into a section: a link, or the red label while it is coming soon. */
export type WayIn = { label: string; href: string } | { label: string; soon: SoonKey };
const Way = ({ w, className }: { w: WayIn; className?: string }) =>
  ('soon' in w ? <Soon k={w.soon} className={className}>{w.label}</Soon> : <A href={w.href} className={className}>{w.label}</A>);

/** A section head on the Home and hub pages: world, title, one paragraph, the ways in. */
export function SecHead({ kick, title, text, links, read, id }: { kick: ReactNode; title: ReactNode; text: ReactNode; links?: WayIn[]; read?: WayIn; id?: string }) {
  return (
    <header className="sech" id={id}>
      <div className="sech__l">
        <p className="micro sech__k">{kick}</p>
        <h2 className="sech__t">{title}</h2>
        <p className="sech__p">{text}</p>
      </div>
      <div className="sech__r">
        {read && ('soon' in read ? <Soon k={read.soon} className="sech__read">{read.label}</Soon> : <A className="sech__read" href={read.href}>{read.label}&nbsp;&nbsp;→</A>)}
        {links && <p className="sech__links">{links.map((l, i) => <span key={i}>{i > 0 && ' · '}<Way w={l} /></span>)}</p>}
      </div>
    </header>
  );
}

/** Image left (55 %), text right: the rooms of a hub. */
export function Room({ slot, pos, w = 690, kick, title, text, links, href, ratio = '690/620' }: { slot: string; pos?: string; w?: number; kick: string; title: string; text: string; links?: WayIn[]; href: string; ratio?: string }) {
  return (
    <section className="room">
      <A className="room__img" href={href} tabIndex={-1} aria-hidden="true"><Img slot={slot} ratio={ratio} pos={pos} w={w} sizes="(min-width:1440px) 690px, (min-width:900px) 52vw, 100vw" /></A>
      <div className="room__t">
        <div className="room__h"><div><p className="micro">{kick}</p><h2 className="room__title">{title}</h2></div><A className="room__go" href={href}>Enter&nbsp;&nbsp;→</A></div>
        <p className="room__p">{text}</p>
        {links && <p className="room__links">{links.map((l, i) => <span key={i}><Way w={l} /></span>)}</p>}
      </div>
    </section>
  );
}

/** Two columns of prose. */
export function Prose({ a, b }: { a: string[]; b: string[] }) {
  return <div className="prose"><Tx paras={a} /><Tx paras={b} /></div>;
}

export interface RowItem { no: string; title: ReactNode; meta: ReactNode; go: ReactNode; href?: string; red?: boolean; img?: { slot: string; pos?: string }; here?: boolean; soon?: SoonKey }

/** A hairline-ruled list of texts / campaigns; a `soon` row is red and unlinked until its entry is live. */
export function Rows({ rows }: { rows: RowItem[] }) {
  return (
    <ul className="rows">
      {rows.map((r, i) => {
        const soon = r.soon !== undefined && isSoon(r.soon);
        const to = r.soon ? soonHref(r.soon) : r.href;
        const pic = r.img && <Img slot={r.img.slot} ratio="240/150" pos={r.img.pos} w={240} sizes="240px" />;
        return (
          <li key={i} className={cx('rows__r', (r.red || soon) && 'is-red', r.img && 'has-img')}>
            {pic && (to ? <A className="rows__img" href={to} tabIndex={-1} aria-hidden="true">{pic}</A> : <span className="rows__img">{pic}</span>)}
            <span className="rows__no">{r.no}</span>
            <span className="rows__t">{to ? <A href={to}>{r.title}</A> : r.title}</span>
            <span className="rows__m">{r.meta}</span>
            <span className={cx('rows__go', r.here && 'is-here')}>{r.soon && soon ? <Soon k={r.soon}>( )</Soon> : to && !r.here ? <A href={to}>{r.go}</A> : r.go}</span>
          </li>
        );
      })}
    </ul>
  );
}

export const LinkRow = ({ links }: { links: WayIn[] }) => <p className="linkrow">{links.map((l, i) => <Way key={i} w={l} />)}</p>;
export const PillRow = ({ children }: { children: ReactNode }) => <div className="pills">{children}</div>;
export const Statement = ({ children, w }: { children: ReactNode; w?: string }) => <p className="statement" style={w ? { maxWidth: w } : undefined}>{children}</p>;
export const Lede = ({ children }: { children: ReactNode }) => <p className="lede">{children}</p>;
