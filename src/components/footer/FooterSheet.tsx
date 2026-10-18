'use client';

import { usePathname } from 'next/navigation';

/** The sheet name of the current page in the footer title block; an address no page answers is the 404 page (as on the old site). */
export function FooterSheet({ sheets }: { sheets: Record<string, string> }) {
  const path = usePathname() ?? '/';
  return <span>{sheets[path] ?? sheets[`${path}/`] ?? '404'}</span>;
}
