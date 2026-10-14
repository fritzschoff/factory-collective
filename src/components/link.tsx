import Link from 'next/link';
import type { ComponentProps } from 'react';

/** Links inside the site go through next/link; mail, other sites and #anchors stay a plain <a>. */
export const isInternal = (href: string): boolean => href.startsWith('/') && !href.startsWith('//');

export function A({ href, ...rest }: ComponentProps<'a'> & { href: string }) {
  return isInternal(href) ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}
