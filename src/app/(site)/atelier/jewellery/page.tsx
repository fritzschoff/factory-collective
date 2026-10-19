import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { JewelleryPage } from '@/views/series';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/atelier/jewellery/'));
}

export default function Page() {
  return <JewelleryPage />;
}
