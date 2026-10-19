import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ScanPage } from '@/views/series';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/atelier/scan-series/'));
}

export default function Page() {
  return <ScanPage />;
}
