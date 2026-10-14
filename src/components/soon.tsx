import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { SOON, isSoon, soonHref, withBrackets, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/**
 * Drawn, not built: red, with the empty brackets and the words "coming soon" — never a link.
 * A plain-text label gets " ( )" after it unless it contains the brackets already; pass `brackets={false}` where the
 * markup around the label draws them itself.
 * Once the entry is switched to 'live' in src/content/soon.ts: a plain link to its page (plain text if it has none),
 * the label as given — a link carries no brackets.
 */
export function Soon({ k, children, className, note = true, brackets = true }: { k: SoonKey; children?: ReactNode; className?: string; note?: boolean; brackets?: boolean }) {
  const label = children ?? SOON[k].label;
  if (!isSoon(k)) {
    const href = soonHref(k);
    return href ? <A href={href} className={className}>{label}</A> : <span className={className}>{label}</span>;
  }
  return (
    <span className={cx('soon', className)} data-soon={k}>
      <span className="soon__t">{brackets && typeof label === 'string' ? withBrackets(label) : label}</span>
      {note && <small className="soon__n">coming soon</small>}
    </span>
  );
}
