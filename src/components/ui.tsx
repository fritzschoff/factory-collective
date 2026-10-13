import type { CSSProperties, ReactNode } from 'react';
import metrics from '../lib/font-metrics.json';
import { resolve, srcSet, track } from '../lib/images';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
export const Raw = ({ html, as: T = 'span', className }: { html: string; as?: any; className?: string }) => <T className={className} dangerouslySetInnerHTML={{ __html: html }} />;
/** `*italic*` and `&nbsp;` in authored copy */
export const md = (s: string) => s.replace(/\*([^*]+)\*/g, '<i>$1</i>');

/* ═════════ pictures ═════════ */
export interface ImgProps {
  /** slot key = the file name to drop into public/images (without extension) */
  slot: string;
  /** CSS aspect-ratio of the box, e.g. "4/5". Omit when the parent gives the size (fill). */
  ratio?: string;
  pos?: string;
  sizes?: string;
  alt?: string;
  eager?: boolean;
  /** design width in px at 1440 — only used for the image report */
  w?: number;
  /** object photographs on a ground: shown whole, on paper */
  ground?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: 'span' | 'figure' | 'div';
  /** render only the picture (no wrapper) for use as a css background */
  fill?: boolean;
}
export function Img({ slot, ratio, pos, sizes = '(min-width: 1440px) 1440px, 100vw', alt = '', eager, w, ground, className, style, children, as: As = 'span' }: ImgProps) {
  const r = resolve(slot);
  track(slot, (ratio ?? 'fill').replace('/', ':'), w);
  const st: CSSProperties = { ...(ratio ? { aspectRatio: ratio } : {}), ...style };
  const Tag = As as any;
  if (!r.src) {
    return (
      <Tag className={cx('img', 'img--ph', className)} style={st} data-slot={slot} data-source="none" role="img" aria-label={alt || `Placeholder: ${slot}`}>
        <svg className="ph__x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="0" x2="100" y2="100" /><line x1="100" y1="0" x2="0" y2="100" /><line x1="50" y1="0" x2="50" y2="100" className="ph__axis" /><line x1="0" y1="50" x2="100" y2="50" className="ph__axis" />
        </svg>
        <span className="ph__id">{slot}</span>
        <span className="ph__ratio">{(ratio ?? 'fill').replace('/', ' : ')}{w ? ` · ${w * 2} px` : ''}</span>
        {children}
      </Tag>
    );
  }
  const ss = srcSet(r);
  return (
    <Tag className={cx('img', ground && 'img--ground', className)} style={st} data-slot={slot} data-source={r.source}>
      <img
        src={r.src} srcSet={ss} sizes={ss ? sizes : undefined} alt={alt} width={r.w} height={r.h}
        loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : undefined}
        style={pos ? { objectPosition: pos } : undefined}
      />
      {children}
    </Tag>
  );
}

/* ═════════ the sign ═════════ */
const ADV = metrics.advEm as Record<string, number>;
const WORDS = (metrics as any).words as Record<string, number>;
export function signGeometry(word: string) {
  const wAdv = WORDS[word.toUpperCase()] ?? ADV.ATELIER;
  const tot = Object.values(ADV).reduce((a, c) => a + c, 0) - ADV.ATELIER + wAdv;
  const half = ADV['('] / 2;
  const before = ADV.C + ADV.ONCEPT + ADV['. '];
  return {
    tot, winLeft: (before + half) / tot,
    xF: 0.36 / tot,
    xA: (before + (ADV['('] + wAdv + ADV[')']) / 2) / tot,
    xS: (before + ADV['('] + wAdv + ADV[')'] + ADV[' C'] - 0.36) / tot,
    brL: (before + half) / tot,
    brR: (before + ADV['('] + wAdv + half) / tot
  };
}
export interface SignProps {
  word?: string;
  /** window: ink = black bar, open = see-through (shows the page), image = a picture runs through it */
  win?: 'ink' | 'open' | 'image' | 'red';
  image?: { slot: string; pos?: string };
  className?: string;
  style?: CSSProperties;
  /** visible word inside the brackets (instead of the empty window) */
  showWord?: boolean;
  children?: ReactNode;
}
/** The long-form sign:  C ONCEPT. ( ATELIER ) C OLLECTIVE .  — only the red marks and the window are visible. */
export function Sign({ word = 'ATELIER', win = 'ink', image, className, style, showWord, children }: SignProps) {
  const g = signGeometry(word);
  if (image) track(image.slot, 'band', 1440);
  const imgUrl = image ? resolve(image.slot).src : null;
  const st = { '--tot': g.tot.toFixed(4), '--wl': g.winLeft.toFixed(5), ...style } as CSSProperties;
  return (
    <span className={cx('sign', `sign--${win}`, className)} style={st} aria-hidden="true">
      <span className="sg-m">C</span><span className="sg-h">ONCEPT</span><span className="sg-m">. </span>
      <span className="sg-g">
        <span className="sg-win">
          {win === 'image' && <span className="sg-img" data-par style={imgUrl ? { backgroundImage: `url(${imgUrl})`, backgroundPosition: `50% ${image?.pos?.split(' ')[1] ?? '40%'}` } : undefined} />}
        </span>
        <span className="sg-m sg-br">(</span><span className={cx('sg-word', !showWord && 'sg-h')}>{word.toUpperCase()}</span><span className="sg-m sg-br">)</span>
      </span>
      <span className="sg-m"> C</span><span className="sg-h">OLLECTIVE</span><span className="sg-m"> .</span>
      {children}
    </span>
  );
}

/** the sign as a block on the page: bar, ghost, or big run-off */
export function MarkBar({ word = 'ATELIER', w = '82%', win = 'ink', ghost, caption, className, style }: { word?: string; w?: string; win?: 'ink' | 'red' | 'open'; ghost?: boolean; caption?: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx('markbar', ghost && 'markbar--ghost', className)} style={style}>
      <div className="markbar__in" style={{ width: w }}><Sign word={word} win={win} /></div>
      {caption && <p className="micro markbar__cap">{caption}</p>}
    </div>
  );
}
export function RunOff({ word = 'ATELIER', win = 'ink' }: { word?: string; win?: 'ink' | 'red' }) {
  return <div className="runoff" aria-hidden="true"><div className="runoff__in"><Sign word={word} win={win} /></div></div>;
}

/** ( ) glyphs as a decorative inline */
export const Br = ({ children = '' }: { children?: ReactNode }) => <span className="br">( {children}{children ? ' ' : ''})</span>;

/* ═════════ the bracket window ═════════ */
/** The picture exists only between the two red brackets and ends on their inner edge. */
export function BracketWindow({ h = 100, w = 232, slots, className, style, id }: { h?: number | string; w?: number | string; slots?: string[]; className?: string; style?: CSSProperties; id?: string }) {
  const st = { '--h': typeof h === 'number' ? `${h}px` : h, width: typeof w === 'number' ? `${w}px` : w, ...style } as CSSProperties;
  return (
    <div className={cx('bwin', className)} style={st} id={id} aria-hidden="true">
      <span className="bwin__g bwin__g--l">(</span>
      <span className="bwin__pic">{(slots ?? []).map((s, i) => <BwImg key={s} slot={s} on={i === 0} />)}</span>
      <span className="bwin__g bwin__g--r">)</span>
    </div>
  );
}
function BwImg({ slot, on }: { slot: string; on?: boolean }) {
  const r = resolve(slot);
  track(slot, 'window', 232);
  return <span className={cx('bwin__img', on && 'is-on')} style={r.src ? { backgroundImage: `url(${r.src})` } : undefined} data-slot={slot} />;
}

/** The lens: the page's picture, blurred — sharp only between the brackets, flush to their inner edge. */
export function Lens({ slot, ratio = '1248/700', pos = 'center', fx = 46, fy = 50, cw = 43, ch = 24, blur = 14, caption, className }: { slot: string; ratio?: string; pos?: string; fx?: number; fy?: number; cw?: number; ch?: number; blur?: number; caption?: string; className?: string }) {
  const r = resolve(slot);
  track(slot, ratio.replace('/', ':'), 1248);
  const bg = r.src ? { backgroundImage: `url(${r.src})`, backgroundPosition: pos } : undefined;
  const st = { aspectRatio: ratio, '--blur': `${blur}px`, '--lx': fx - cw / 2, '--ty': fy - ch / 2, '--cw': cw, '--chh': ch } as CSSProperties;
  return (
    <figure className={cx('lens', className)}>
      <div className="lens__box" style={st} data-slot={slot}>
        <div className={cx('lens__bg', !r.src && 'img--ph')} style={bg}>{!r.src && <span className="ph__id">{slot}</span>}</div>
        <div className="bwin lens__bw" aria-hidden="true">
          <span className="bwin__g bwin__g--l">(</span>
          <span className="bwin__pic"><span className="lens__sharp" style={bg} /></span>
          <span className="bwin__g bwin__g--r">)</span>
        </div>
      </div>
      {caption && <figcaption className="micro lens__cap">{caption}</figcaption>}
    </figure>
  );
}

/* ═════════ type & structure ═════════ */
export const Kick = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx('kick', className)}>{children}</p>;
export const Micro = ({ children, className, as: T = 'p' }: { children: ReactNode; className?: string; as?: any }) => <T className={cx('micro', className)}>{children}</T>;
export const Title = ({ children, className, as: T = 'h1' }: { children: ReactNode; className?: string; as?: any }) => <T className={cx('title', className)}>{children}</T>;
export function Narrate({ children, className, size, quiet, id }: { children: ReactNode; className?: string; size?: 'l'; quiet?: boolean; id?: string }) {
  return <div className={cx('narr', size === 'l' && 'narr--l', className)} id={id}><span className="narr__lead" aria-hidden="true" /><p className="narr__txt">{children}</p></div>;
}
export const Hair = ({ left, right, id, className, children }: { left?: ReactNode; right?: ReactNode; id?: string; className?: string; children?: ReactNode }) => (
  <div className={cx('hair', className)} id={id}><span className="hair__l">{left}</span>{right && <span className="hair__r">{right}</span>}{children}</div>
);
export const Rule = ({ title, note, right, id, className }: { title: ReactNode; note?: ReactNode; right?: ReactNode; id?: string; className?: string }) => (
  <div className={cx('rule', className)} id={id}><span className="rule__l"><b>{title}</b>{note && <span className="rule__note">{note}</span>}</span>{right && <span className="rule__r">{right}</span>}</div>
);
export const Crumb = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="crumb" aria-label="Breadcrumb">/// {items.map((c, i) => <span key={i}>{i > 0 && ' / '}{c.href ? <a href={c.href}>{c.label}</a> : c.label}</span>)}</nav>
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
export function Register({ rows }: { rows: { no: string; name: ReactNode; meta?: ReactNode; href?: string; link?: string; red?: boolean; current?: boolean }[] }) {
  return (
    <ul className="register">
      {rows.map((r, i) => (
        <li key={i} className={cx(r.red && 'is-red', r.current && 'is-current')}>
          <span className="register__no">{r.no}</span><span className="register__name">{r.name}</span><span className="register__meta">{r.meta}</span>
          <span className="register__go">{r.href ? <a href={r.href}>{r.link ?? 'Open'}&nbsp;&nbsp;→</a> : r.link}</span>
        </li>
      ))}
    </ul>
  );
}
export function Pill({ href, children, ghost, onClick, type, className, ...rest }: { href?: string; children: ReactNode; ghost?: boolean; onClick?: any; type?: 'button' | 'submit'; className?: string; [k: string]: any }) {
  const c = cx('pill', ghost && 'pill--ghost', className);
  return href ? <a className={c} href={href} {...rest}>{children}</a> : <button className={c} type={type ?? 'button'} {...rest}>{children}</button>;
}
export const Coming = ({ title, text, link, href, className, id }: { title: ReactNode; text?: ReactNode; link?: ReactNode; href?: string; className?: string; id?: string }) => (
  <aside className={cx('coming', className)} id={id}>
    <div className="coming__l"><h3 className="coming__t">{title}</h3>{text && <p className="coming__p">{text}</p>}</div>
    {link && <div className="coming__r">{href ? <a href={href}>{link}</a> : link}</div>}
  </aside>
);

/* ═════════ marks laid over a picture (coordinates in % of the picture) ═════════ */
const lc = (light?: boolean) => (light ? 'is-light' : '');
export function AxisV({ x, letter, light, y0 = 0 }: { x: number; letter?: string; light?: boolean; y0?: number } ) {
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
export function Opening({ x, y, w = 11, label, href, light }: { x: number; y: number; w?: number; label?: string; href?: string; light?: boolean }) {
  const inner = (<><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><rect x=".5" y=".5" width="99" height="29" rx="9" ry="14.5" /><line x1="16" y1="1.5" x2="84" y2="28.5" /><line x1="16" y1="28.5" x2="84" y2="1.5" /></svg>{label && <em>{label}</em>}</>);
  const st = { left: `${x}%`, top: `${y}%`, '--w': `${w}%` } as CSSProperties;
  return href ? <a className={cx('mk mk-open', lc(light))} style={st} href={href}>{inner}</a> : <span className={cx('mk mk-open', lc(light))} style={st} aria-hidden="true">{inner}</span>;
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
export function ShopPoint({ px, py, lx, ly, code, name, sub, price, href, side, id }: { px: number; py: number; lx: number; ly: number; code: string; name: string; sub?: string; price?: string; href: string; side?: -1; id?: string }) {
  return (
    <>
      <svg className="mk mk-svg mk-diag is-light" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={px} y1={py} x2={lx} y2={ly} vectorEffect="non-scaling-stroke" /></svg>
      <a className="mk mk-sp" style={{ left: `${px}%`, top: `${py}%` }} href={href} aria-label={`${code} ${name}`}><i /></a>
      <span className={cx('mk mk-card', side === -1 && 'is-left')} style={{ left: `${lx}%`, top: `${ly}%` }}>
        <b>{code}</b>&nbsp; // {name}<small>{sub}</small>
        <span className="mk-card__buy">{price ?? '€ [price]'}&nbsp;&nbsp; {id ? <button type="button" data-quickadd={id}>Add</button> : <a href={href}>View</a>}</span>
      </span>
    </>
  );
}
/** the three steps: C — ( ) — C. running diagonally through a picture */
export function Steps({ fs = 'clamp(36px, 10.4vw, 150px)' }: { fs?: string }) {
  return (
    <span className="mk mk-steps" style={{ '--fs': fs } as CSSProperties} aria-hidden="true">
      <b style={{ left: '5%', top: '4%' }}>C</b><b style={{ left: '22%', top: '40%' }} className="dot">.</b>
      <b style={{ left: '38%', top: '44%' }}>(</b><b style={{ left: '66%', top: '44%' }}>)</b><b style={{ left: '74%', top: '74%' }}>C</b><b style={{ left: '92%', top: '86%' }} className="dot">.</b>
    </span>
  );
}
/** a picture with marks laid over it. The marks are children; their % refer to this box. */
export function Plate({ slot, ratio, pos, w, ground, children, className, alt, eager, sizes }: { slot: string; ratio?: string; pos?: string; w?: number; ground?: boolean; children?: ReactNode; className?: string; alt?: string; eager?: boolean; sizes?: string }) {
  return <Img slot={slot} ratio={ratio} pos={pos} w={w} ground={ground} className={cx('plate', className)} alt={alt} eager={eager} sizes={sizes} as="figure">{children && <span className="over">{children}</span>}</Img>;
}
export const RedFade = ({ h = 'clamp(90px, 10vw, 150px)' }: { h?: string }) => <span className="redfade" style={{ '--h': h } as CSSProperties} aria-hidden="true" />;

/** closing plate: a big picture with a red fade at its lower edge and a line of text */
export function OutPlate({ slot, pos, title, line, href, ratio = '1248/600' }: { slot: string; pos?: string; title: ReactNode; line?: ReactNode; href: string; ratio?: string }) {
  return (
    <a className="out" href={href}>
      <Img slot={slot} ratio={ratio} pos={pos} w={1248} className="out__img" sizes="(min-width:1440px) 1248px, 92vw">
        <RedFade />
        <span className="out__t"><b>{title}</b></span>
        {line && <span className="out__l">{line}</span>}
      </Img>
    </a>
  );
}

/** wall elevation 1:10 with a 1.75 m figure */
export function Elevation({ slots, cw, ch, centre = 145, n = 1, gap = 0, label, dimW }: { slots: string[]; cw: number; ch: number; centre?: number; n?: number; gap?: number; label: string; dimW?: string }) {
  // all numbers in cm; the drawing is 0..W units wide, scaled with the box
  const W = 440, H = 250, floor = 215, k = 1.26;  // 1 cm = k units
  const pw = cw * k, phh = ch * k, tot = n * pw + (n - 1) * gap * k, cx0 = 180 - tot / 2, cy = floor - centre * k;
  const fx = cx0 + tot + 74;
  return (
    <figure className="elev">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <line x1="14" y1={floor} x2={W - 14} y2={floor} className="e-floor" />
        {Array.from({ length: n }).map((_, i) => {
          const x = cx0 + i * (pw + gap * k); const sl = slots[Math.min(i, slots.length - 1)]; track(sl, 'elevation', 260); const r = resolve(sl);
          return (<g key={i}><rect x={x} y={cy - phh / 2} width={pw} height={phh} className="e-work" />{r.src ? <image href={r.src} x={x + .5} y={cy - phh / 2 + .5} width={pw - 1} height={phh - 1} preserveAspectRatio="xMidYMid slice" /> : <text x={x + pw / 2} y={cy} className="e-ph" textAnchor="middle">{slots[i]}</text>}</g>);
        })}
        {/* figure 1.75 m */}
        <g className="e-fig">
          <circle cx={fx} cy={floor - 164 * k} r={11 * k * .9} /><line x1={fx} y1={floor - 153 * k} x2={fx} y2={floor - 92 * k} />
          <line x1={fx} y1={floor - 146 * k} x2={fx - 20} y2={floor - 100 * k} /><line x1={fx} y1={floor - 146 * k} x2={fx + 20} y2={floor - 100 * k} />
          <line x1={fx} y1={floor - 92 * k} x2={fx - 14} y2={floor} /><line x1={fx} y1={floor - 92 * k} x2={fx + 14} y2={floor} />
        </g>
        <g className="e-dim">
          <line x1={cx0} y1={cy + phh / 2 + 14} x2={cx0 + tot} y2={cy + phh / 2 + 14} /><text x={cx0 + tot / 2} y={cy + phh / 2 + 12} textAnchor="middle">{dimW ?? `${cw} cm`}</text>
          <line x1={cx0 - 16} y1={cy - phh / 2} x2={cx0 - 16} y2={cy + phh / 2} /><text x={cx0 - 20} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx0 - 20} ${cy})`}>{ch} cm</text>
          <line x1={W - 36} y1={floor} x2={W - 36} y2={cy} /><text x={W - 40} y={(floor + cy) / 2} textAnchor="middle" transform={`rotate(-90 ${W - 40} ${(floor + cy) / 2})`}>+ {(centre / 100).toFixed(2)} centre</text>
          <text x={fx} y={floor + 14} textAnchor="middle">1.75 m</text>
        </g>
      </svg>
      <figcaption className="micro">{label}</figcaption>
    </figure>
  );
}
