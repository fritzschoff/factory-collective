import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { TextT01 } from '@/views/factory';

export const metadata = pageMetadata(staticPage('/factory/tectonics-without-origin/'));

export default function Page() {
  return <TextT01 />;
}
