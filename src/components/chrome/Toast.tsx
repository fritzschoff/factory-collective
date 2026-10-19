'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useChrome } from './ChromeProvider';

/**
 * "SH / 001 // shirt, grey band is in your bag.  View bag →" — top right, under the header.
 * The live region is in the page from the start and stays; only what is in it changes. A region that is created
 * together with its text is often not read out, and the toast is the only confirmation of an Add.
 */
export function Toast() {
  const { toast } = useChrome();
  return (
    <div className="toast-live" role="status" aria-live="polite">
      {toast && (
        // keyed: the same text twice in a row is still a change of the region
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.link && <Link href={toast.link.href}>{toast.link.label}</Link>}
        </div>
      )}
    </div>
  );
}

/** The toast after every Add: the piece is in the bag, with a link to it. */
export function useInBagToast(): (p: { code: string; name: string }) => void {
  const { showToast } = useChrome();
  return useCallback((p) => showToast(`${p.code} // ${p.name} is in your bag.`, { href: '/bag/', label: 'View bag\u00a0\u00a0→' }), [showToast]);
}
