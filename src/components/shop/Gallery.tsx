'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '@/lib/cx';

const SWIPE_PX = 40;

/** Product gallery: one picture at a time, thumbnails, swipe on touch. */
export function GalleryClient({ slides, thumbs, overlay }: { slides: ReactNode[]; thumbs: ReactNode[]; overlay: ReactNode }) {
  const [active, setActive] = useState(0);
  const x0 = useRef(0);
  const uid = useId();
  const n = slides.length;
  const go = (i: number) => setActive(((i % n) + n) % n);
  const onTabs = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? active + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? active - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const i = ((next % n) + n) % n;
    go(i);
    document.getElementById(`${uid}-tab-${i}`)?.focus();
  };
  return (
    <div className="gal">
      <div
        className="gal__main"
        id={n > 1 ? `${uid}-panel` : undefined}
        role={n > 1 ? 'tabpanel' : undefined}
        aria-labelledby={n > 1 ? `${uid}-tab-${active}` : undefined}
        onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > SWIPE_PX && n > 1) go(active + (dx < 0 ? 1 : -1)); }}
      >
        {slides.map((s, i) => <div key={i} className={cx('gal__i', i === active && 'is-on')} aria-hidden={i !== active}>{s}</div>)}
        {overlay}
        {n > 1 && <span className="mk gal__n" aria-hidden="true">{active + 1} of {n}</span>}
      </div>
      {n > 1 && (
        <div className="gal__th" role="tablist" aria-label="Pictures" onKeyDown={onTabs}>
          {thumbs.map((t, i) => (
            <button type="button" key={i} id={`${uid}-tab-${i}`} role="tab" aria-selected={i === active} aria-controls={`${uid}-panel`} tabIndex={i === active ? 0 : -1} aria-label={`Picture ${i + 1}`} className={cx(i === active && 'is-on')} onClick={() => go(i)}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}
