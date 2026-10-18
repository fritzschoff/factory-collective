import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { BagsPage } from '@/views/series';

export const metadata = pageMetadata(staticPage('/atelier/bags/'));

export default function Page() {
  return <BagsPage />;
}
