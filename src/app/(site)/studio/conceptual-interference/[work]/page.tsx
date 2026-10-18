import type { Metadata } from 'next';
import { WorkRoute, workMetadata, workStaticParams } from '@/views/studio';

// An unknown work is answered with a real 404: the first request waits for the static result instead of getting the
// App Shell (status 200) and a not-found streamed in behind it.
export const ensureStatic = 'navigation';
export const generateStaticParams = () => workStaticParams('ci');

export async function generateMetadata({ params }: PageProps<'/studio/conceptual-interference/[work]'>): Promise<Metadata> {
  return workMetadata('ci', (await params).work);
}

export default async function Page({ params }: PageProps<'/studio/conceptual-interference/[work]'>) {
  return <WorkRoute series="ci" slug={(await params).work} />;
}
