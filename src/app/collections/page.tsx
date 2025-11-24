import { ProductCard } from '@/components/ProductCard';
import { getStorefrontProducts } from '@/lib/products';
import Link from 'next/link';

export const revalidate = 300;

export default async function CollectionsPage() {
  const products = await getStorefrontProducts();
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] w-full overflow-hidden bg-gradient-to-br from-black/10 to-black/5">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="mb-4 text-5xl font-light tracking-tight md:text-7xl">
            Collections
          </h1>
          <p className="max-w-2xl text-lg text-white/90">
            Curated selections from our archive
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12">
          <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
            Featured
          </p>
          <h2 className="text-3xl font-light md:text-4xl">
            Curated Product Grid
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full border border-black/20 bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
          >
            View all products
          </Link>
        </div>
      </section>
    </div>
  );
}
