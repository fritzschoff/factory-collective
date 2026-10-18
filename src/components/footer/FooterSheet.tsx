'use client';

import { usePathname } from 'next/navigation';

/** The sheet name of the current page in the footer title block. */
export function FooterSheet({ sheets }: { sheets: Record<string, string> }) {
  const path = usePathname() ?? '/';
  return <span>{sheets[path] ?? sheets[`${path}/`] ?? ''}</span>;
}
