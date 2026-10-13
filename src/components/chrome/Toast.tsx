'use client';

import Link from 'next/link';
import { useChrome } from './ChromeProvider';

/** "SH / 001 // shirt, grey band is in your bag.  View bag →" — top right, under the header. */
export function Toast() {
  const { toast } = useChrome();
  if (!toast) return <div className="toast" role="status" aria-live="polite" hidden />;
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span>{toast.text}</span>
      {toast.link && <Link href={toast.link.href}>{toast.link.label}</Link>}
    </div>
  );
}
