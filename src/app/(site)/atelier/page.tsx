import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { AtelierPage } from '@/views/atelier';

export const metadata = pageMetadata(staticPage('/atelier/'));

export default function Page() {
  return <AtelierPage />;
}
