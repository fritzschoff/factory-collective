import type { Metadata } from 'next';
import type { PageEntry } from '@/content/pages';
import { SITE } from '@/content/site';
import { slotSrc } from '@/lib/images';

/**
 * The public address of the site, without a trailing slash (Ruling P49): SITE_URL; without it, on a production deployment
 * on Vercel the project's production domain, on any other Vercel deployment its own address; off Vercel localhost.
 */
export function siteUrl(): string {
  const { SITE_URL, VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL } = process.env;
  const url = SITE_URL
    || (VERCEL_ENV === 'production' && VERCEL_PROJECT_PRODUCTION_URL && `https://${VERCEL_PROJECT_PRODUCTION_URL}`)
    || (VERCEL_URL && `https://${VERCEL_URL}`)
    || 'http://localhost:3000';
  return url.replace(/\/$/, '');
}

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
