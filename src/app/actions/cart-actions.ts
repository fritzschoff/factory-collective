"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { clearCart, readCart, writeCart } from "@/lib/cart";

const addSchema = z.object({
  productId: z.string(),
  priceId: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  imageUrl: z.string().nullable().optional(),
});

const quantitySchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0).max(99),
});

export async function addToCart(payload: z.infer<typeof addSchema>) {
  const data = addSchema.parse(payload);
  const store = await cookies();
  const cart = await readCart(store);
  const existing = cart.find((item) => item.productId === data.productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...data, quantity: 1 });
  }

  await writeCart(cart, store);
  revalidatePath("/");
  revalidatePath("/cart");
}

export async function updateCartQuantity(payload: z.infer<typeof quantitySchema>) {
  const data = quantitySchema.parse(payload);
  const store = await cookies();
  const cart = await readCart(store);

  const nextCart = cart
    .map((item) =>
      item.productId === data.productId ? { ...item, quantity: data.quantity } : item
    )
    .filter((item) => item.quantity > 0);

  await writeCart(nextCart, store);
  revalidatePath("/cart");
}

export async function removeFromCart(payload: Pick<z.infer<typeof quantitySchema>, "productId">) {
  const store = await cookies();
  const cart = await readCart(store);
  const nextCart = cart.filter((item) => item.productId !== payload.productId);
  await writeCart(nextCart, store);
  revalidatePath("/cart");
}

export async function resetCart() {
  await clearCart();
  revalidatePath("/cart");
}
