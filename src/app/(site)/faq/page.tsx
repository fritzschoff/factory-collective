import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { FaqPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/faq/'));

export default function Page() {
  return <FaqPage />;
}
