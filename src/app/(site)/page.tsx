import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/views/home';

export const metadata = pageMetadata(staticPage('/'));

export default function Page() {
  return <HomePage />;
}
