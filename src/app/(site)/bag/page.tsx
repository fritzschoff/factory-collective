import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { BagPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/bag/'));

export default function Page() {
  return <BagPage />;
}
