import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { TermsPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/terms/'));

export default function Page() {
  return <TermsPage />;
}
