import type { StorefrontProduct } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { AddToCartButton } from "./AddToCartButton";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white transition-all hover:shadow-lg">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-black/5">
          <Image
            src={product.imageUrl ?? "/globe.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-black/80">
            {product.name}
          </h3>
          {product.description && (
            <p className="mb-3 text-sm text-black/60 line-clamp-2">
              {product.description}
            </p>
          )}
          <p className="text-xl font-semibold">
            {formatCurrency(product.price, product.currency)}
          </p>
        </div>
        <div className="space-y-3">
          {product.metadata?.conceptualLayer && (
            <div className="flex flex-wrap gap-2">
              {[product.metadata.conceptualLayer]
                .flat()
                .filter(Boolean)
                .map((layer) => (
                  <span
                    key={layer}
                    className="text-xs uppercase tracking-[0.2em] text-black/40"
                  >
                    {layer}
                  </span>
                ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-black/50">
              {product.metadata?.tier ?? "Core"}
            </span>
            <AddToCartButton
              productId={product.id}
              priceId={product.priceId}
              name={product.name}
              price={product.price}
              currency={product.currency}
              imageUrl={product.imageUrl}
            />
          </div>
        </div>
      </div>
    </article>
  );
}