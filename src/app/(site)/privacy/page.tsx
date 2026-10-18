import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { PrivacyPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/privacy/'));

export default function Page() {
  return <PrivacyPage />;
}
