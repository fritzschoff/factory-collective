import type { ReactNode } from 'react';
import { Img, Pill, Raw, cx, md } from './ui';
import { Tx } from './quiet';

/** A section head on the Home / hub pages: world, title, one paragraph, the ways in. */
export function SecHead({ kick, title, text, links, read, id }: { kick: ReactNode; title: ReactNode; text: ReactNode; links?: { label: string; href: string; coming?: boolean }[]; read?: { label: string; href: string }; id?: string }) {
  return (
    <header className="sech" id={id}>
      <div className="sech__l">
        <p className="micro sech__k">{kick}</p>
        <h2 className="sech__t">{title}</h2>
        <p className="sech__p">{text}</p>
      </div>
      <div className="sech__r">
        {read && <a className="sech__read" href={read.href}>{read.label}&nbsp;&nbsp;→</a>}
        {links && <p className="sech__links">{links.map((l, i) => <span key={i}>{i > 0 && ' · '}<a href={l.href} className={cx(l.coming && 'r')}>{l.label}</a></span>)}</p>}
      </div>
    </header>
  );
}

/** Image left (55 %), text right: the rooms of a hub */
export function Room({ slot, pos, w = 690, kick, title, text, links, href, ratio = '690/620' }: { slot: string; pos?: string; w?: number; kick: string; title: string; text: string; links?: { label: string; href: string; coming?: boolean }[]; href: string; ratio?: string }) {
  return (
    <section className="room">
      <a className="room__img" href={href} tabIndex={-1} aria-hidden="true"><Img slot={slot} ratio={ratio} pos={pos} w={w} sizes="(min-width:1440px) 690px, (min-width:900px) 52vw, 100vw" /></a>
      <div className="room__t">
        <div className="room__h"><div><p className="micro">{kick}</p><h2 className="room__title">{title}</h2></div><a className="room__go" href={href}>Enter&nbsp;&nbsp;→</a></div>
        <p className="room__p">{text}</p>
        {links && <p className="room__links">{links.map((l, i) => <span key={i}><a href={l.href} className={cx(l.coming && 'r')}>{l.label}</a></span>)}</p>}
      </div>
    </section>
  );
}

/** two prose columns */
export function Prose({ a, b }: { a: string[]; b: string[] }) {
  return <div className="prose"><Tx paras={a} /><Tx paras={b} /></div>;
}

/** a hairline-ruled list of texts / campaigns */
export function Rows({ rows }: { rows: { no: string; title: ReactNode; meta: ReactNode; go: ReactNode; href?: string; red?: boolean; img?: { slot: string; pos?: string }; here?: boolean }[] }) {
  return (
    <ul className="rows">
      {rows.map((r, i) => (
        <li key={i} className={cx('rows__r', r.red && 'is-red', r.img && 'has-img')}>
          {r.img && <a className="rows__img" href={r.href} tabIndex={-1} aria-hidden="true"><Img slot={r.img.slot} ratio="240/150" pos={r.img.pos} w={240} sizes="240px" /></a>}
          <span className="rows__no">{r.no}</span>
          <span className="rows__t">{r.href ? <a href={r.href}>{r.title}</a> : r.title}</span>
          <span className="rows__m">{r.meta}</span>
          <span className={cx('rows__go', r.here && 'is-here')}>{r.href && !r.here ? <a href={r.href}>{r.go}</a> : r.go}</span>
        </li>
      ))}
    </ul>
  );
}

export const LinkRow = ({ links }: { links: { label: string; href: string }[] }) => (
  <p className="linkrow">{links.map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}</p>
);
export const PillRow = ({ children }: { children: ReactNode }) => <div className="pills">{children}</div>;
export const Statement = ({ children, w }: { children: ReactNode; w?: string }) => <p className="statement" style={w ? { maxWidth: w } : undefined}>{children}</p>;
export const Lede = ({ children }: { children: ReactNode }) => <p className="lede">{children}</p>;
export { Pill, Raw, md };
