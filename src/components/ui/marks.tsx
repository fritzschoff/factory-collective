import type { CSSProperties } from 'react';
import { A } from '@/components/link';
import { QuickAddButton } from '@/components/shop/QuickAdd';
import { cx } from '@/lib/cx';
import type { ProductSummary } from '@/lib/products/summary';

/* marks laid over a picture — coordinates in % of the picture */
const lc = (light?: boolean) => (light ? 'is-light' : '');

export function AxisV({ x, letter, light, y0 = 0 }: { x: number; letter?: string; light?: boolean; y0?: number }) {
  return <span className={cx('mk mk-axisv', lc(light))} style={{ left: `${x}%`, top: `${y0}%` }} aria-hidden="true">{letter && <i>{letter}</i>}</span>;
}
export function AxisH({ y, light, x0 = 0, x1 = 100 }: { y: number; light?: boolean; x0?: number; x1?: number }) {
  return <span className={cx('mk mk-axish', lc(light))} style={{ top: `${y}%`, left: `${x0}%`, right: `${100 - x1}%` }} aria-hidden="true" />;
}
export function LevelMark({ x, y, label, len = 150, light }: { x: number; y: number; label: string; len?: number; light?: boolean }) {
  return <span className={cx('mk mk-level', lc(light))} style={{ left: `${x}%`, top: `${y}%`, '--len': `${len}px` } as CSSProperties} aria-hidden="true"><svg viewBox="0 0 12 9" width="12" height="9"><path d="M.5 .5 H11.5 L6 8.5 Z" /></svg><em>{label}</em></span>;
}
export function SectionAA({ y, inset = 5, light, fs = 'clamp(14px,1.3vw,19px)' }: { y: number; inset?: number; light?: boolean; fs?: string }) {
  return <span className={cx('mk mk-aa', lc(light))} style={{ top: `${y}%`, left: `${inset}%`, right: `${inset}%`, '--fs': fs } as CSSProperties} aria-hidden="true"><b>(</b><b>A</b><i /><b>A</b><b>)</b></span>;
}

/** Capsule with a cross: the link from a picture to the piece named in it. */
export function Opening({ x, y, w = 11, label, href, light }: { x: number; y: number; w?: number; label?: string; href?: string; light?: boolean }) {
  const inner = (<><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><rect x=".5" y=".5" width="99" height="29" rx="9" ry="14.5" /><line x1="16" y1="1.5" x2="84" y2="28.5" /><line x1="16" y1="28.5" x2="84" y2="1.5" /></svg>{label && <em>{label}</em>}</>);
  const st = { left: `${x}%`, top: `${y}%`, '--w': `${w}%` } as CSSProperties;
  return href ? <A className={cx('mk mk-open', lc(light))} style={st} href={href}>{inner}</A> : <span className={cx('mk mk-open', lc(light))} style={st} aria-hidden="true">{inner}</span>;
}

export function NotIn({ x, y, lx, ly, label, note = 'not in the collection', light, side }: { x: number; y: number; lx: number; ly: number; label: string; note?: string; light?: boolean; side?: -1 }) {
  return (
    <>
      <svg className={cx('mk mk-svg mk-notin-l', lc(light))} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={x} y1={y} x2={lx} y2={ly} vectorEffect="non-scaling-stroke" /></svg>
      <span className="mk mk-dot" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
      <span className={cx('mk mk-notin', lc(light), side === -1 && 'is-left')} style={{ left: `${lx}%`, top: `${ly}%` }}><span className="r">( )</span>&nbsp; {label}<small>{note}</small></span>
    </>
  );
}
export function Diag({ x1, y1, x2, y2, label, lx, ly, light, lw = 30 }: { x1: number; y1: number; x2: number; y2: number; label?: string; lx?: number; ly?: number; light?: boolean; lw?: number }) {
  return (
    <>
      <svg className={cx('mk mk-svg mk-diag', lc(light))} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" /></svg>
      <span className={cx('mk mk-dot', lc(light), 'is-grey')} style={{ left: `${x2}%`, top: `${y2}%` }} aria-hidden="true" />
      {label && <span className={cx('mk mk-cap', lc(light))} style={{ left: `${lx ?? x1}%`, top: `${ly ?? y1 - 3}%`, width: `${lw}%` }}>{label}</span>}
    </>
  );
}
export function Redact({ x, y, w, h, label, light }: { x: number; y: number; w: number; h: number; label?: string; light?: boolean }) {
  return <span className={cx('mk mk-redact', lc(light))} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} aria-hidden="true">{label && <em><span className="r">( )</span>&nbsp; {label}</em>}</span>;
}
export function Dim({ x1, x2, y, label, light }: { x1: number; x2: number; y: number; label: string; light?: boolean }) {
  return <span className={cx('mk mk-dim', lc(light))} style={{ left: `${x1}%`, right: `${100 - x2}%`, top: `${y}%` }} aria-hidden="true"><em>{label}</em></span>;
}

/** A point in a picture with a card: code, name, price, Add (or View when there is no product). */
export function ShopPoint({ px, py, lx, ly, code, name, sub, price, href, side, product }: { px: number; py: number; lx: number; ly: number; code: string; name: string; sub?: string; price?: string; href: string; side?: -1; product?: ProductSummary }) {
  return (
    <>
      <svg className="mk mk-svg mk-diag is-light" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={px} y1={py} x2={lx} y2={ly} vectorEffect="non-scaling-stroke" /></svg>
      <A className="mk mk-sp" style={{ left: `${px}%`, top: `${py}%` }} href={href} aria-label={`${code} ${name}`}><i /></A>
      <span className={cx('mk mk-card', side === -1 && 'is-left')} style={{ left: `${lx}%`, top: `${ly}%` }}>
        <b>{code}</b>&nbsp; // {name}<small>{sub}</small>
        <span className="mk-card__buy">{price ?? '€ [price]'}&nbsp;&nbsp; {product ? <QuickAddButton product={product} /> : <A href={href}>View</A>}</span>
      </span>
    </>
  );
}

/** The three steps: C — ( ) — C. running diagonally through a picture. */
export function Steps({ fs = 'clamp(36px, 10.4vw, 150px)' }: { fs?: string }) {
  return (
    <span className="mk mk-steps" style={{ '--fs': fs } as CSSProperties} aria-hidden="true">
      <b style={{ left: '5%', top: '4%' }}>C</b><b style={{ left: '22%', top: '40%' }} className="dot">.</b>
      <b style={{ left: '38%', top: '44%' }}>(</b><b style={{ left: '66%', top: '44%' }}>)</b><b style={{ left: '74%', top: '74%' }}>C</b><b style={{ left: '92%', top: '86%' }} className="dot">.</b>
    </span>
  );
}
