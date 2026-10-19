import type { Metadata } from 'next';
import type { PageEntry } from '@/content/pages';
import { SITE } from '@/content/site';
import { slotSrc } from '@/lib/images';

export const siteUrl = (): string => (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** The head of every not-found page: its title, and never indexed. */
export const NOT_FOUND_METADATA: Metadata = { title: 'Not found', robots: { index: false } };

/** Title, description, canonical address and social picture of a page. */
export function pageMetadata(p: PageEntry): Metadata {
  const og = p.og ? slotSrc(p.og) : null;
  const home = p.path === '/';
  const full = home ? `${SITE.name} — ${SITE.tagline}` : `${p.title} — ${SITE.short}`;
  return {
    title: home ? { absolute: full } : p.title,
    description: p.description,
    alternates: p.noindex ? undefined : { canonical: p.path },
    robots: p.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title: full, description: p.description, type: 'website', url: p.path, images: og ? [{ url: og }] : undefined },
    twitter: { card: og ? 'summary_large_image' : 'summary' },
  };
}
