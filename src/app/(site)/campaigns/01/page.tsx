import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { Campaign01 } from '@/views/campaigns';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/campaigns/01/'));
}

export default function Page() {
  return <Campaign01 />;
}
