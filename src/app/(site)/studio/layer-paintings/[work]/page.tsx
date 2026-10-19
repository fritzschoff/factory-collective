import type { Metadata } from 'next';
import { WorkRoute, workMetadata, workStaticParams } from '@/views/studio';

export const ensureStatic = 'navigation';
export const generateStaticParams = () => workStaticParams('lp');

export async function generateMetadata({ params }: PageProps<'/studio/layer-paintings/[work]'>): Promise<Metadata> {
  return workMetadata('lp', (await params).work);
}

export default async function Page({ params }: PageProps<'/studio/layer-paintings/[work]'>) {
  return <WorkRoute series="lp" slug={(await params).work} />;
}
