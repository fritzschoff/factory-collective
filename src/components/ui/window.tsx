import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import { optimizedSrc } from '@/lib/image-url';
import { slotSrc } from '@/lib/images';

/** The lens: the picture blurred, sharp only between the brackets, flush to their inner edge. */
export function Lens({ slot, ratio = '1248/700', pos = 'center', fx = 46, fy = 50, cw = 43, ch = 24, blur = 14, caption, className }: { slot: string; ratio?: string; pos?: string; fx?: number; fy?: number; cw?: number; ch?: number; blur?: number; caption?: string; className?: string }) {
  const file = slotSrc(slot);
  // One optimised file for both layers: the blurred picture and the sharp one between the brackets have to line up exactly.
  const src = file && optimizedSrc(file, 1920);
  const bg = src ? { backgroundImage: `url(${src})`, backgroundPosition: pos } : undefined;
  const st = { aspectRatio: ratio, '--blur': `${blur}px`, '--lx': fx - cw / 2, '--ty': fy - ch / 2, '--cw': cw, '--chh': ch } as CSSProperties;
  return (
    <figure className={cx('lens', className)}>
      <div className="lens__box" style={st} data-slot={slot}>
        <div className={cx('lens__bg', !src && 'img--ph')} style={bg}>{!src && <span className="ph__id">{slot}</span>}</div>
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
