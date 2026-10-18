import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { CampaignsPage } from '@/views/campaigns';

export const metadata = pageMetadata(staticPage('/campaigns/'));

export default function Page() {
  return <CampaignsPage />;
}
