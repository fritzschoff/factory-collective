import type { Metadata } from 'next';
import { WorkRoute, workMetadata, workStaticParams } from '@/views/studio';

export const ensureStatic = 'navigation';
export const generateStaticParams = () => workStaticParams('ci');

export async function generateMetadata({ params }: PageProps<'/studio/conceptual-interference/[work]'>): Promise<Metadata> {
  return workMetadata('ci', (await params).work);
}

export default async function Page({ params }: PageProps<'/studio/conceptual-interference/[work]'>) {
  return <WorkRoute series="ci" slug={(await params).work} />;
}
