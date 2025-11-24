"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart-actions";

type Props = {
  productId: string;
  priceId: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
};

export function AddToCartButton(props: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="rounded-full border border-black/20 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-black/5 disabled:bg-black/20 disabled:hover:bg-black/20 disabled:hover:text-white"
      onClick={() => {
        startTransition(async () => {
          await addToCart(props);
          setSuccess(`Added ${props.name}`);
          setTimeout(() => setSuccess(null), 3000);
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Adding…" : success ?? "Add"}
    </button>
  );
}
