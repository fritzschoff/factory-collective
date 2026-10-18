import type { Metadata } from 'next';
import { ProductRoute, productMetadata, productStaticParams } from '@/views/product';

// An unknown slug is answered with a real 404: the first request waits for the static result instead of getting the
// App Shell (status 200) and a not-found streamed in behind it.
export const ensureStatic = 'navigation';
export const generateStaticParams = () => productStaticParams('fashion');

export async function generateMetadata({ params }: PageProps<'/atelier/fashion/[slug]'>): Promise<Metadata> {
  return productMetadata('fashion', (await params).slug);
}

export default async function Page({ params }: PageProps<'/atelier/fashion/[slug]'>) {
  return <ProductRoute kind="fashion" slug={(await params).slug} />;
}
