import type { ShopProduct } from './types';

export function forSale(cents: number | null | undefined): cents is number {
  return typeof cents === 'number' && Number.isInteger(cents) && cents > 0;
}

export function unitPriceCents(product: Pick<ShopProduct, 'priceCents' | 'variants' | 'options'>, key: string, config: Readonly<Record<string, string>>): number | null {
  const variant = product.variants.find((item) => item.key === key);
  const base = variant?.priceCents != null && variant.priceCents > 0 ? variant.priceCents : product.priceCents;
  if (!forSale(base)) return null;
  let extra = 0;
  for (const [id, valueId] of Object.entries(config)) {
    const option = product.options.find((item) => item.id === id && item.role === 'config');
    const value = option?.values?.find((item) => item.id === valueId);
    if (value?.priceCents && value.priceCents > 0) extra += value.priceCents;
  }
  return base + extra;
}

export function readPrices(raw: Readonly<Record<string, unknown>>, knownIds: ReadonlySet<string>): Map<string, number> {
  const prices = new Map<string, number>();
  const errors: string[] = [];
  for (const [id, value] of Object.entries(raw)) {
    if (id.startsWith('_')) continue;
    if (!knownIds.has(id)) {
      errors.push(`unknown product id ${id}`);
      continue;
    }
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      errors.push(`price for ${id} must be a positive whole number of euros`);
      continue;
    }
    prices.set(id, value * 100);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return prices;
}
