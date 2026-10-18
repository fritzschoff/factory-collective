import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { FactoryPage } from '@/views/factory';

export const metadata = pageMetadata(staticPage('/factory/'));

export default function Page() {
  return <FactoryPage />;
}
