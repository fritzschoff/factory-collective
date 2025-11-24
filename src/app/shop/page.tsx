import { ProductCard } from '@/components/ProductCard';
import { getStorefrontProducts } from '@/lib/products';
import Link from 'next/link';

export const revalidate = 300;

const categories = [
  { label: 'Jewellery', href: '/shop/jewellery' },
  { label: 'Garments', href: '/shop/garments' },
  { label: 'Objects', href: '/shop/objects' },
  { label: 'Art', href: '/shop/art' },
];

export default async function ShopPage() {
  const products = await getStorefrontProducts();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col gap-10 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Shop
        </p>
        <h1 className="text-4xl font-light md:text-5xl">All Products</h1>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-black/10 pb-6">
        {categories.map(category => (
          <Link
            key={category.href}
            href={category.href}
            className="text-sm uppercase tracking-[0.2em] text-black/60 transition-colors hover:text-black"
          >
            {category.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 flex-shrink-0 md:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">
                Filter
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="mb-2 font-semibold">Price</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span>Low to High</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span>High to Low</span>
                    </label>
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-semibold">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                      <button
                        key={size}
                        className="rounded border border-black/10 px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-semibold">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {['Black', 'White', 'Gray', 'Blue', 'Red'].map(color => (
                      <button
                        key={color}
                        className="rounded border border-black/10 px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors"
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">
                Sort by
              </p>
              <select className="w-full rounded border border-black/10 bg-white px-3 py-2 text-sm">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <button className="rounded-full border border-black/20 bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black">
              Load more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
