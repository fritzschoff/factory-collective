import type { StorefrontProduct } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { AddToCartButton } from "./AddToCartButton";
import Image from "next/image";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-black/5 bg-white">
            <Image
              src={product.imageUrl ?? "/globe.svg"}
              alt={product.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-black/60">
              {product.description ?? "Tailored capability"}
            </p>
          </div>
        </div>
        <p className="text-3xl font-semibold">
          {formatCurrency(product.price, product.currency)}
        </p>
        {product.features && product.features.length > 0 && (
          <ul className="space-y-1 text-sm text-black/70">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black/40" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between">
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
    </article>
  );
}
