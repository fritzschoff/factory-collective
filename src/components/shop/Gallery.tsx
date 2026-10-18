'use client';

import { useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/cx';

const SWIPE_PX = 40;

/** Product gallery: one picture at a time, thumbnails, swipe on touch. */
export function GalleryClient({ slides, thumbs, overlay }: { slides: ReactNode[]; thumbs: ReactNode[]; overlay: ReactNode }) {
  const [active, setActive] = useState(0);
  const x0 = useRef(0);
  const n = slides.length;
  const go = (i: number) => setActive(((i % n) + n) % n);
  return (
    <div className="gal">
      <div
        className="gal__main"
        onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > SWIPE_PX && n > 1) go(active + (dx < 0 ? 1 : -1)); }}
      >
        {slides.map((s, i) => <div key={i} className={cx('gal__i', i === active && 'is-on')} aria-hidden={i !== active}>{s}</div>)}
        {overlay}
        {n > 1 && <span className="mk gal__n" aria-hidden="true">{active + 1} of {n}</span>}
      </div>
      {n > 1 && (
        <div className="gal__th" role="tablist" aria-label="Pictures">
          {thumbs.map((t, i) => (
            <button type="button" key={i} role="tab" aria-selected={i === active} aria-label={`Picture ${i + 1}`} className={cx(i === active && 'is-on')} onClick={() => go(i)}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}
