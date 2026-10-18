import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ShippingPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/shipping/'));

export default function Page() {
  return <ShippingPage />;
}
