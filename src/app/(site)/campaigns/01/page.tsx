import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { Campaign01 } from '@/views/campaigns';

export const metadata = pageMetadata(staticPage('/campaigns/01/'));

export default function Page() {
  return <Campaign01 />;
}
