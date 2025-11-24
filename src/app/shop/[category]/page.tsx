import { ProductCard } from "@/components/ProductCard";
import { getStorefrontProducts } from "@/lib/products";
import { notFound } from "next/navigation";

export const revalidate = 300;

const validCategories = ["jewellery", "garments", "objects", "art"];

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category.toLowerCase();
  
  if (!validCategories.includes(category)) {
    notFound();
  }

  const products = await getStorefrontProducts();
  const categoryProducts = products.filter((product) =>
    product.metadata?.category?.toLowerCase() === category
  );

  const categoryLabels: Record<string, string> = {
    jewellery: "Jewellery",
    garments: "Garments",
    objects: "Objects",
    art: "Art",
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col gap-10 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Shop
        </p>
        <h1 className="text-4xl font-light md:text-5xl">
          {categoryLabels[category]}
        </h1>
      </div>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-black/60">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
