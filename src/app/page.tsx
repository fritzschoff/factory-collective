import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getStorefrontProducts } from '@/lib/products';
import { readCart, getCartSummary } from '@/lib/cart';
import { formatCurrency } from '@/lib/currency';

export const revalidate = 300;

export default async function HomePage() {
  const [products, cart] = await Promise.all([
    getStorefrontProducts(),
    readCart(),
  ]);
  const summary = getCartSummary(cart);

  return (
    <div className="flex flex-col">
      <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-black/10 to-black/5">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60 z-10" />
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="mb-6 text-6xl font-light tracking-tight md:text-8xl">
            Factory Collective
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
            Build collectible commerce systems that print new revenue lines.
          </p>
          <Link
            href="/shop"
            className="rounded-full border-2 border-white bg-white/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.3em] backdrop-blur-sm transition-all hover:bg-white hover:text-black"
          >
            Shop now
          </Link>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-black/40">
            Editorial
          </p>
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gradient-to-br from-black/5 to-black/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-black/40">
                Fullscreen image/video placeholder
              </p>
            </div>
          </div>
          <h2 className="mb-6 text-4xl font-light md:text-5xl">Cover Shot</h2>
          <Link
            href="/shop"
            className="inline-block rounded-full border border-black/20 bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
          >
            Shop now
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20" id="products">
        <div className="mb-12">
          <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
            Products
          </p>
          <h2 className="text-3xl font-light md:text-4xl">
            Shop the Collection
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full border border-black/20 bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
          >
            Shop now
          </Link>
        </div>
      </section>
    </div>
  );
}
