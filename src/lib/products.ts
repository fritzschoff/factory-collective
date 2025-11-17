import type { StorefrontProduct } from "@/types";
import { unstable_cache } from "next/cache";
import type Stripe from "stripe";
import { stripe } from "./stripe";

const FALLBACK_IMAGE = "/globe.svg";

const FALLBACK_PRODUCTS: StorefrontProduct[] = [
  {
    id: "studio-blueprint",
    name: "Studio Blueprint",
    description: "Discovery + strategy sprint for premium object factories.",
    price: 420000,
    priceId: "price_demo_blueprint",
    currency: "usd",
    imageUrl: FALLBACK_IMAGE,
    features: [
      "2-week async research block",
      "Executive workshop",
      "Roadmap + systems architecture",
    ],
  },
  {
    id: "factory-deploy",
    name: "Factory Deploy",
    description: "Dedicated pod that ships your collectible commerce stack.",
    price: 650000,
    priceId: "price_demo_deploy",
    currency: "usd",
    imageUrl: FALLBACK_IMAGE,
    features: ["Headless storefront", "Drop engine", "Observability suite"],
  },
  {
    id: "collective-care",
    name: "Collective Care",
    description: "Retainer for ops, finance, and fulfillment automation.",
    price: 180000,
    priceId: "price_demo_care",
    currency: "usd",
    imageUrl: FALLBACK_IMAGE,
    features: [
      "Finance agent",
      "Inventory telemetry",
      "Collaborative analytics desk",
    ],
  },
];

async function fetchStripeProducts(): Promise<StorefrontProduct[]> {
  if (!stripe) {
    return FALLBACK_PRODUCTS;
  }

  const response = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  const products = response.data
    .map((product) => {
      const price = product.default_price as Stripe.Price | null;
      if (!price || typeof price.unit_amount !== "number" || !price.currency) {
        return null;
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: price.unit_amount,
        priceId: price.id,
        currency: price.currency,
        imageUrl: product.images?.[0] ?? FALLBACK_IMAGE,
        metadata: product.metadata,
        features:
          product.marketing_features?.map((feature) => feature.name ?? "") ??
          undefined,
      } satisfies StorefrontProduct;
    })
    .filter(Boolean) as StorefrontProduct[];

  return products.length ? products : FALLBACK_PRODUCTS;
}

const getProductsCached = unstable_cache(fetchStripeProducts, ["storefront-products"], {
  revalidate: 300,
});

export async function getStorefrontProducts({
  forceFresh = false,
}: { forceFresh?: boolean } = {}): Promise<StorefrontProduct[]> {
  if (forceFresh) {
    return fetchStripeProducts();
  }

  return getProductsCached();
}
