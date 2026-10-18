import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ContactPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/contact/'));

export default function Page() {
  return <ContactPage />;
}
