import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ScanPage } from '@/views/series';

export const metadata = pageMetadata(staticPage('/atelier/scan-series/'));

export default function Page() {
  return <ScanPage />;
}
