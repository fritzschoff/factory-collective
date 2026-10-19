import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { Campaign02 } from '@/views/campaigns';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/campaigns/02/'));
}

export default function Page() {
  return <Campaign02 />;
}
