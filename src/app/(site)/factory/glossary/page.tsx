import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { GlossaryPage } from '@/views/factory';

export const metadata = pageMetadata(staticPage('/factory/glossary/'));

export default function Page() {
  return <GlossaryPage />;
}
