import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { AboutPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/about/'));

export default function Page() {
  return <AboutPage />;
}
