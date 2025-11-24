'use client';

import { useTransition, useState } from 'react';

export function CheckoutButton({ label = 'Checkout' }: { label?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCheckout() {
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Unable to start checkout');
      }

      const data = (await response.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => startTransition(handleCheckout)}
        disabled={isPending}
        className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"
      >
        {isPending ? 'Redirecting…' : label}
      </button>
      {error && <p className="text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}
