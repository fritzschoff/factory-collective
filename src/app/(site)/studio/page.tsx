import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { StudioPage } from '@/views/studio';

export const metadata = pageMetadata(staticPage('/studio/'));

export default function Page() {
  return <StudioPage />;
}
