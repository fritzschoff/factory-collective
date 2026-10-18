import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { Campaign02 } from '@/views/campaigns';

export const metadata = pageMetadata(staticPage('/campaigns/02/'));

export default function Page() {
  return <Campaign02 />;
}
