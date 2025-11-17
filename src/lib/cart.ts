import type { CartItem } from "@/types";
import { cookies, type ReadonlyRequestCookies } from "next/headers";

const CART_COOKIE = "fc_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function parseCart(value?: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) =>
      Boolean(item && item.productId && item.priceId && item.quantity)
    );
  } catch (error) {
    console.warn("Unable to parse cart cookie", error);
    return [];
  }
}

function serializeCart(cart: CartItem[]): string {
  return JSON.stringify(cart);
}

export async function readCart(
  cookieStore?: ReadonlyRequestCookies,
): Promise<CartItem[]> {
  const store = cookieStore ?? (await cookies());
  const raw = store.get(CART_COOKIE)?.value;
  return parseCart(raw);
}

export async function writeCart(
  cart: CartItem[],
  cookieStore?: ReadonlyRequestCookies,
) {
  const store = cookieStore ?? (await cookies());
  store.set(CART_COOKIE, serializeCart(cart), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_MAX_AGE,
    path: "/",
  });
}

export async function clearCart(cookieStore?: ReadonlyRequestCookies) {
  const store = cookieStore ?? (await cookies());
  store.delete(CART_COOKIE);
}

export function getCartSummary(cart: CartItem[]) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currency = cart[0]?.currency ?? "usd";

  return {
    total,
    itemCount,
    currency,
  };
}
