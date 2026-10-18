import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { LPPage } from '@/views/studio';

export const metadata = pageMetadata(staticPage('/studio/layer-paintings/'));

export default function Page() {
  return <LPPage />;
}
