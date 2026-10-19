import { SiteChrome } from '@/components/site-chrome';
import { NOT_FOUND_METADATA } from '@/lib/seo';
import { NotFoundPage } from '@/views/info';

export const metadata = NOT_FOUND_METADATA;

/** An address no route matches: outside the (site) layout, so the chrome is drawn here. */
export default function NotFound() {
  return <SiteChrome><NotFoundPage /></SiteChrome>;
}
