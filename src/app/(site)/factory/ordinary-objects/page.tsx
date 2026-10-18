import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { TextT02 } from '@/views/factory';

export const metadata = pageMetadata(staticPage('/factory/ordinary-objects/'));

export default function Page() {
  return <TextT02 />;
}
