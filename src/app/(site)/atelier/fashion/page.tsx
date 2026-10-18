import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { FashionPage } from '@/views/atelier';

export const metadata = pageMetadata(staticPage('/atelier/fashion/'));

export default function Page() {
  return <FashionPage />;
}
