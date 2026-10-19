import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { CIPage } from '@/views/studio';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/studio/conceptual-interference/'));
}

export default function Page() {
  return <CIPage />;
}
