import { CartLineItems } from "@/components/CartLineItems";
import { CartSummaryCard } from "@/components/CartSummaryCard";
import { readCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await readCart();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col gap-10 px-6 py-14 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Cart
          </p>
          <h1 className="text-3xl font-semibold">Factory manifest</h1>
        </div>
        <CartLineItems items={cart} />
      </div>
      <div className="w-full max-w-md flex-shrink-0">
        <CartSummaryCard cart={cart} />
      </div>
    </div>
  );
}
