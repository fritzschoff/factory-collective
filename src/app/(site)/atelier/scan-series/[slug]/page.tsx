import type { Metadata } from 'next';
import { ProductRoute, productMetadata, productStaticParams } from '@/views/product';

// An unknown slug is answered with a real 404: the first request waits for the static result instead of getting the
// App Shell (status 200) and a not-found streamed in behind it.
export const ensureStatic = 'navigation';
export const generateStaticParams = () => productStaticParams('scan');

export async function generateMetadata({ params }: PageProps<'/atelier/scan-series/[slug]'>): Promise<Metadata> {
  return productMetadata('scan', (await params).slug);
}

export default async function Page({ params }: PageProps<'/atelier/scan-series/[slug]'>) {
  return <ProductRoute kind="scan" slug={(await params).slug} />;
}
