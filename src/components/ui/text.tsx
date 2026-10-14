import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { Soon } from '@/components/soon';
import { isSoon, soonHref, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/** Authored copy from src/content may contain <i> and &nbsp; — rendered as HTML. Never user input. */
export const Raw = ({ html, as: T = 'span', className }: { html: string; as?: 'span' | 'p' | 'div'; className?: string }) => <T className={className} dangerouslySetInnerHTML={{ __html: html }} />;
/** `*italic*` in authored copy */
export const md = (s: string): string => s.replace(/\*([^*]+)\*/g, '<i>$1</i>');

export const Kick = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx('kick', className)}>{children}</p>;
export const Micro = ({ children, className, as: T = 'p' }: { children: ReactNode; className?: string; as?: 'p' | 'span' }) => <T className={cx('micro', className)}>{children}</T>;
export const Title = ({ children, className, as: T = 'h1' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' }) => <T className={cx('title', className)}>{children}</T>;

export function Narrate({ children, className, size, id }: { children: ReactNode; className?: string; size?: 'l'; id?: string }) {
  return <div className={cx('narr', size === 'l' && 'narr--l', className)} id={id}><span className="narr__lead" aria-hidden="true" /><p className="narr__txt">{children}</p></div>;
}
export const Hair = ({ left, right, id, className, children }: { left?: ReactNode; right?: ReactNode; id?: string; className?: string; children?: ReactNode }) => (
  <div className={cx('hair', className)} id={id}><span className="hair__l">{left}</span>{right && <span className="hair__r">{right}</span>}{children}</div>
);
export const Rule = ({ title, note, right, id, className }: { title: ReactNode; note?: ReactNode; right?: ReactNode; id?: string; className?: string }) => (
  <div className={cx('rule', className)} id={id}><span className="rule__l"><b>{title}</b>{note && <span className="rule__note">{note}</span>}</span>{right && <span className="rule__r">{right}</span>}</div>
);
export const Crumb = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="crumb" aria-label="Breadcrumb">{'/// '}{items.map((c, i) => <span key={i}>{i > 0 && ' / '}{c.href ? <A href={c.href}>{c.label}</A> : c.label}</span>)}</nav>
);
export function Museum({ rows, className, light }: { rows: [string, ReactNode][]; className?: string; light?: boolean }) {
  return <dl className={cx('museum', light && 'museum--light', className)}>{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}
export function TitleBlock({ rows, className }: { rows: [[string, ReactNode], ([string, ReactNode] | null)?][]; className?: string }) {
  return (
    <div className={cx('tblock', className)} role="group" aria-label="Sheet">
      {rows.map((r, i) => <div className="tblock__row" key={i}>{r.map((c, k) => c && <div key={k}><span>{c[0]}</span><b>{c[1]}</b></div>)}</div>)}
    </div>
  );
}

/** `soon`: red and unlinked while the entry is coming soon, linked to its page once it is live. */
export interface RegisterRow { no: string; name: ReactNode; meta?: ReactNode; href?: string; link?: string; red?: boolean; current?: boolean; soon?: SoonKey }
export function Register({ rows }: { rows: RegisterRow[] }) {
  return (
    <ul className="register">
      {rows.map((r, i) => {
        const soon = r.soon !== undefined && isSoon(r.soon);
        const href = r.soon ? soonHref(r.soon) : r.href;
        return (
          <li key={i} className={cx((r.red || soon) && 'is-red', r.current && 'is-current')}>
            <span className="register__no">{r.no}</span><span className="register__name">{r.name}</span><span className="register__meta">{r.meta}</span>
            <span className="register__go">{r.soon && soon ? <Soon k={r.soon}>( )</Soon> : href ? <A href={href}>{r.link ?? 'Open'}&nbsp;&nbsp;→</A> : r.link}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Pill({ href, children, ghost, className }: { href: string; children: ReactNode; ghost?: boolean; className?: string }) {
  return <A className={cx('pill', ghost && 'pill--ghost', className)} href={href}>{children}</A>;
}

export const Coming = ({ title, text, link, href, className, id }: { title: ReactNode; text?: ReactNode; link?: ReactNode; href?: string; className?: string; id?: string }) => (
  <aside className={cx('coming', className)} id={id}>
    <div className="coming__l"><h3 className="coming__t">{title}</h3>{text && <p className="coming__p">{text}</p>}</div>
    {link && <div className="coming__r">{href ? <A href={href}>{link}</A> : link}</div>}
  </aside>
);
