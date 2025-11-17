import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getStorefrontProducts } from "@/lib/products";
import { readCart, getCartSummary } from "@/lib/cart";
import { formatCurrency } from "@/lib/currency";
import { Layers3, ShieldCheck, Radar } from "lucide-react";

export const revalidate = 300;

export default async function HomePage() {
  const [products, cart] = await Promise.all([
    getStorefrontProducts(),
    Promise.resolve(readCart()),
  ]);
  const summary = getCartSummary(cart);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-14">
      <section className="grid gap-10 lg:grid-cols-[2fr_1fr]" id="products">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Factory Collective
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            Build collectible commerce systems that print new revenue lines.
          </h1>
          <p className="text-lg text-black/70">
            We assemble pods across strategy, hardware integration, finance, and
            fulfillment. Everything ships with Stripe-native billing, Firebase
            auth, and SSR dashboards so your ops stay observable.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/cart"
              className="rounded-full bg-black px-6 py-3 font-semibold text-white"
            >
              View cart ({summary.itemCount})
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-black/20 px-6 py-3 font-semibold"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Cart snapshot
          </p>
          <h2 className="mt-4 text-4xl font-semibold">
            {formatCurrency(summary.total, summary.currency)}
          </h2>
          <p className="text-sm text-black/60">
            Auto-cached server data refreshed every 5 minutes. Checkout uses
            Stripe sessions.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: "Ops observatory",
            description:
              "Server components stream telemetry from Stripe + Firebase with a 5-minute cache budget.",
            icon: Radar,
          },
          {
            label: "Fulfillment mesh",
            description:
              "Dashboard writes collapse into Firestore with optimistic fallbacks when keys are absent.",
            icon: Layers3,
          },
          {
            label: "Payments AI",
            description:
              "Stripe checkout sessions are created server-side so PCI never touches the browser.",
            icon: ShieldCheck,
          },
        ].map(({ label, description, icon: Icon }) => (
          <article
            key={label}
            className="rounded-3xl border border-black/10 bg-white/70 p-6 space-y-3"
          >
            <Icon className="h-10 w-10 text-black/60" />
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              {label}
            </p>
            <p className="text-sm text-black/60">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
