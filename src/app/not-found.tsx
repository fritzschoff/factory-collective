import type { Metadata } from 'next';
import { SiteChrome } from '@/components/site-chrome';
import { NotFoundPage } from '@/views/info';

export const metadata: Metadata = { title: 'Not found', robots: { index: false } };

export default function NotFound() {
  return <SiteChrome><NotFoundPage /></SiteChrome>;
}
