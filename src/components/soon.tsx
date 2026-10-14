import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { SOON, isSoon, soonHref, soonLabel, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/**
 * Drawn, not built: red, empty brackets, "coming soon" — never a link.
 * Once the entry is switched to 'live' in src/content/soon.ts: a plain link to its page (plain text if it has none).
 */
export function Soon({ k, children, className, note = true }: { k: SoonKey; children?: ReactNode; className?: string; note?: boolean }) {
  if (!isSoon(k)) {
    const href = soonHref(k);
    const text = children ?? SOON[k].label;
    return href ? <A href={href} className={className}>{text}</A> : <span className={className}>{text}</span>;
  }
  return (
    <span className={cx('soon', className)} data-soon={k}>
      <span className="soon__t">{children ?? soonLabel(k)}</span>
      {note && <small className="soon__n">coming soon</small>}
    </span>
  );
}
