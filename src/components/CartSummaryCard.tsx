import type { CartItem } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { CheckoutButton } from './CheckoutButton';

export function CartSummaryCard({ cart }: { cart: CartItem[] }) {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currency = cart[0]?.currency ?? 'usd';

  return (
    <aside className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="mb-6 border-b border-black/5 pb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-black/50">
          Summary
        </p>
        <p className="text-3xl font-semibold">
          {formatCurrency(total, currency)}
        </p>
      </div>
      <ul className="space-y-3 text-sm text-black/70">
        {cart.map(item => (
          <li key={item.productId} className="flex justify-between">
            <span>
              {item.name}
              <span className="ml-2 text-black/50">×{item.quantity}</span>
            </span>
            <span>
              {formatCurrency(item.price * item.quantity, item.currency)}
            </span>
          </li>
        ))}
        {!cart.length && <li className="text-black/50">Cart is empty.</li>}
      </ul>
      <div className="mt-8">
        <CheckoutButton label="Proceed to Stripe" />
      </div>
    </aside>
  );
}
