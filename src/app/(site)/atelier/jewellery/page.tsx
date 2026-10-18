import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { JewelleryPage } from '@/views/series';

export const metadata = pageMetadata(staticPage('/atelier/jewellery/'));

export default function Page() {
  return <JewelleryPage />;
}
