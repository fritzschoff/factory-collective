import type { CodeProduct, InventoryDoc, OptionRole, ShopImage, ShopOption, ShopProduct, ShopVariant } from './types';

export type { ShopOption };

export const VARIANT_OPTION_IDS = ['colour', 'size', 'leather', 'metal', 'glaze', 'state'] as const;

export function optionRole(id: string): OptionRole {
  return (VARIANT_OPTION_IDS as readonly string[]).includes(id) ? 'variant' : 'config';
}

export function variantAxes(options: readonly ShopOption[]): ShopOption[] {
  return options
    .filter((o) => o.role === 'variant' && o.type !== 'text' && (o.values?.length ?? 0) > 0)
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function variantKey(options: readonly ShopOption[], chosen: Readonly<Record<string, string>>): string {
  return variantAxes(options).map((o) => chosen[o.id]).filter((v): v is string => Boolean(v)).join('.');
}

export function skuFor(productId: string, key: string): string {
  return key ? `${productId}__${key}` : productId;
}

export function expandVariants(options: readonly ShopOption[]): ShopVariant[] {
  const axes = variantAxes(options);
  if (!axes.length) return [{ key: '', priceCents: null, values: {} }];
  let combos: Record<string, string>[] = [{}];
  for (const axis of axes) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of axis.values ?? []) next.push({ ...combo, [axis.id]: value.id });
    }
    combos = next;
  }
  return combos.map((values) => ({
    key: axes.map((axis) => values[axis.id]).join('.'),
    priceCents: null,
    values,
  }));
}

export function availableCount(onHand: number | null, reserved: number): number | null {
  if (onHand == null) return null;
  return onHand - reserved;
}

export function openingStock(product: { work?: { edition: 'poster' | 'archival' } }): number | null {
  if (product.work?.edition === 'poster') return 100;
  if (product.work?.edition === 'archival') return 25;
  return null;
}

export function shopProductFromCode(product: CodeProduct, priceCents: number | null, images: ShopImage[], at = new Date().toISOString()): ShopProduct {
  const options: ShopOption[] = product.options.map((option) => ({ ...option, role: optionRole(option.id) }));
  return {
    id: product.id,
    kind: product.kind,
    group: product.group,
    code: product.code,
    slug: product.slug,
    name: product.name,
    material: product.material,
    sub: product.sub,
    description: product.description,
    spec: product.spec,
    accordions: product.accordions,
    note: product.note,
    lead: product.lead,
    dims: product.dims,
    inv: product.inv,
    tag: product.tag,
    textLink: product.text,
    work: product.work,
    images,
    ground: product.ground,
    pos: product.pos,
    priceCents,
    options,
    variants: expandVariants(options),
    status: 'active',
    href: product.href,
    updatedAt: at,
  };
}

export function inventoryDocs(product: ShopProduct, onHand: number | null = openingStock(product)): InventoryDoc[] {
  const variants = product.variants.length ? product.variants : expandVariants(product.options);
  return variants.map((variant) => ({
    sku: skuFor(product.id, variant.key),
    productId: product.id,
    onHand,
    reserved: 0,
  }));
}
