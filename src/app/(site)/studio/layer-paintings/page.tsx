import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { LPPage } from '@/views/studio';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/studio/layer-paintings/'));
}

export default function Page() {
  return <LPPage />;
}
