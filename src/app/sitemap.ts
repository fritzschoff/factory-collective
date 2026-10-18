import type { MetadataRoute } from 'next';
import { allPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { siteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = allPages(await getCatalog());
  return pages.filter((p) => !p.noindex).map((p) => ({ url: `${siteUrl()}${p.path}`, lastModified: process.env.NEXT_PUBLIC_BUILD_DATE }));
}
