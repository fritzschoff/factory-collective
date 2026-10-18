import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ReturnsPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/returns/'));

export default function Page() {
  return <ReturnsPage />;
}
