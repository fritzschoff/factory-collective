import type { Metadata } from 'next';
import { ProductRoute, productMetadata, productStaticParams } from '@/views/product';

export const ensureStatic = 'navigation';
export const generateStaticParams = () => productStaticParams('jewellery');

export async function generateMetadata({ params }: PageProps<'/atelier/jewellery/[slug]'>): Promise<Metadata> {
  return productMetadata('jewellery', (await params).slug);
}

export default async function Page({ params }: PageProps<'/atelier/jewellery/[slug]'>) {
  return <ProductRoute kind="jewellery" slug={(await params).slug} />;
}
