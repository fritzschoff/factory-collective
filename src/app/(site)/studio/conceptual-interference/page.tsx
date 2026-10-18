import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { CIPage } from '@/views/studio';

export const metadata = pageMetadata(staticPage('/studio/conceptual-interference/'));

export default function Page() {
  return <CIPage />;
}
