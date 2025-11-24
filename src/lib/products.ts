import type { StorefrontProduct } from '@/types';
import { unstable_cache } from 'next/cache';
import type Stripe from 'stripe';
import { stripe } from './stripe';

const FALLBACK_IMAGE = '/globe.svg';

async function fetchStripeProducts(): Promise<StorefrontProduct[]> {
  if (!stripe) {
    console.warn('Stripe not configured. Using fallback products.');
    return [];
  }

  try {
    const allProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const response = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
        limit: 100,
        starting_after: startingAfter,
      });

      allProducts.push(...response.data);
      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    const products = allProducts
      .map((product) => {
        const price = product.default_price as Stripe.Price | null;
        if (
          !price ||
          typeof price.unit_amount !== 'number' ||
          !price.currency
        ) {
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
            product.marketing_features?.map((feature) => feature.name ?? '') ??
            undefined,
        } satisfies StorefrontProduct;
      })
      .filter(Boolean) as StorefrontProduct[];

    if (products.length === 0) {
      console.warn('No products found in Stripe. Using fallback products.');
      return FALLBACK_PRODUCTS;
    }

    return products;
  } catch (error) {
    console.error('Error fetching products from Stripe:', error);
    return FALLBACK_PRODUCTS;
  }
}

const getProductsCached = unstable_cache(
  fetchStripeProducts,
  ['storefront-products'],
  {
    revalidate: 300,
  }
);

export async function getStorefrontProducts({
  forceFresh = false,
}: { forceFresh?: boolean } = {}): Promise<StorefrontProduct[]> {
  if (forceFresh) {
    return fetchStripeProducts();
  }

  return getProductsCached();
}
