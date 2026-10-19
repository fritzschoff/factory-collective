import { countedPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { FashionPage } from '@/views/atelier';

export async function generateMetadata() {
  return pageMetadata(await countedPage('/atelier/fashion/'));
}

export default function Page() {
  return <FashionPage />;
}
