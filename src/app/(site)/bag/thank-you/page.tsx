import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ThankYouPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/bag/thank-you/'));

export default function Page() {
  return <ThankYouPage />;
}
