import type { Metadata } from 'next';
import { WorkRoute, workMetadata, workStaticParams } from '@/views/studio';

// An unknown work is answered with a real 404: the first request waits for the static result instead of getting the
// App Shell (status 200) and a not-found streamed in behind it.
export const ensureStatic = 'navigation';
export const generateStaticParams = () => workStaticParams('lp');

export async function generateMetadata({ params }: PageProps<'/studio/layer-paintings/[work]'>): Promise<Metadata> {
  return workMetadata('lp', (await params).work);
}

export default async function Page({ params }: PageProps<'/studio/layer-paintings/[work]'>) {
  return <WorkRoute series="lp" slug={(await params).work} />;
}
