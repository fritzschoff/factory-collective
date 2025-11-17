"use client";

import type { CartItem } from "@/types";
import Image from "next/image";
import { useTransition } from "react";
import { removeFromCart, updateCartQuantity } from "@/app/actions/cart-actions";
import { formatCurrency } from "@/lib/currency";

type Props = {
  items: CartItem[];
};

export function CartLineItems({ items }: Props) {
  const [isPending, startTransition] = useTransition();

  if (!items.length) {
    return <p className="text-sm text-black/50">Your cart is empty.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 bg-white/70 p-4"
        >
          <Image
            src={item.imageUrl ?? "/globe.svg"}
            alt={item.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-2xl border border-black/5 object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-black/60">
              {formatCurrency(item.price, item.currency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                startTransition(() =>
                  updateCartQuantity({ productId: item.productId, quantity: item.quantity - 1 })
                )
              }
              disabled={isPending || item.quantity <= 1}
              className="h-9 w-9 rounded-full border border-black/10 text-lg disabled:opacity-50"
            >
              –
            </button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() =>
                startTransition(() =>
                  updateCartQuantity({ productId: item.productId, quantity: item.quantity + 1 })
                )
              }
              disabled={isPending}
              className="h-9 w-9 rounded-full border border-black/10 text-lg disabled:opacity-50"
            >
              +
            </button>
          </div>
          <button
            className="text-xs uppercase tracking-[0.2em] text-black/40"
            onClick={() => startTransition(() => removeFromCart({ productId: item.productId }))}
            disabled={isPending}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
