import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ImprintPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/imprint/'));

export default function Page() {
  return <ImprintPage />;
}
