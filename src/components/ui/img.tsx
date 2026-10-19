import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { A } from '@/components/link';
import { cx } from '@/lib/cx';
import { resolveSlot } from '@/lib/images';

export interface ImgProps {
  /** slot key = the file name in public/images, without extension */
  slot: string;
  /** a Storage URL, used instead of the slot file when the catalogue has one */
  src?: string;
  /** CSS aspect ratio of the box, e.g. "4/5"; omit when the parent sets the size */
  ratio?: string;
  pos?: string;
  sizes?: string;
  alt?: string;
  eager?: boolean;
  /** design width at 1440 px — documents the slot size (IMAGE-SLOTS.md) */
  w?: number;
  /** object photographs on a ground: shown whole, on paper */
  ground?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: 'span' | 'figure' | 'div';
}

export function Img({ slot, src, ratio, pos, sizes = '(min-width: 1440px) 1440px, 100vw', alt = '', eager, ground, className, style, children, as: Tag = 'span' }: ImgProps) {
  const r = src ? { src, source: 'remote' as const } : resolveSlot(slot);
  const st: CSSProperties = { ...(ratio ? { aspectRatio: ratio } : {}), ...style };
  if (!r.src) {
    return (
      <Tag className={cx('img', 'img--ph', className)} style={st} data-slot={slot} data-source="none" role="img" aria-label={alt || `Placeholder: ${slot}`}>
        <svg className="ph__x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="0" x2="100" y2="100" /><line x1="100" y1="0" x2="0" y2="100" />
          <line x1="50" y1="0" x2="50" y2="100" className="ph__axis" /><line x1="0" y1="50" x2="100" y2="50" className="ph__axis" />
        </svg>
        <span className="ph__id">{slot}</span>
        <span className="ph__ratio">{(ratio ?? 'fill').replace('/', ' : ')}</span>
        {children}
      </Tag>
    );
  }
  return (
    <Tag className={cx('img', ground && 'img--ground', className)} style={st} data-slot={slot} data-source={r.source}>
      <Image src={r.src} alt={alt} fill sizes={sizes} preload={eager} loading={eager ? 'eager' : undefined} style={pos ? { objectPosition: pos } : undefined} />
      {children}
    </Tag>
  );
}

/** A picture with marks laid over it; the marks' % refer to this box. */
export function Plate({ slot, ratio, pos, w, ground, children, className, alt, eager, sizes }: { slot: string; ratio?: string; pos?: string; w?: number; ground?: boolean; children?: ReactNode; className?: string; alt?: string; eager?: boolean; sizes?: string }) {
  return <Img slot={slot} ratio={ratio} pos={pos} w={w} ground={ground} className={cx('plate', className)} alt={alt} eager={eager} sizes={sizes} as="figure">{children && <span className="over">{children}</span>}</Img>;
}

export const RedFade = ({ h = 'clamp(90px, 10vw, 150px)' }: { h?: string }) => <span className="redfade" style={{ '--h': h } as CSSProperties} aria-hidden="true" />;

/** Closing plate: a big picture with a red fade at its lower edge and a line of text. */
export function OutPlate({ slot, pos, title, line, href, ratio = '1248/600' }: { slot: string; pos?: string; title: ReactNode; line?: ReactNode; href: string; ratio?: string }) {
  return (
    <A className="out" href={href}>
      <Img slot={slot} ratio={ratio} pos={pos} w={1248} className="out__img" sizes="(min-width:1440px) 1248px, 92vw">
        <RedFade />
        <span className="out__t"><b>{title}</b></span>
        {line && <span className="out__l">{line}</span>}
      </Img>
    </A>
  );
}
