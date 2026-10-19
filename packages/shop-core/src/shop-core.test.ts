import { describe, expect, it } from 'vitest';
import { specForStore, specFromStore } from './document';
import { forSale, readPrices, unitPriceCents } from './price';
import { expandVariants, inventoryDocs, openingStock, optionRole, shopProductFromCode, skuFor, variantKey } from './sku';
import type { ShopOption, ShopProduct } from './types';
import { checkoutBodySchema, clampQty, enquireSchema } from './validate';

const colour: ShopOption = { id: 'colour', label: 'Colour', role: 'variant', type: 'swatch', values: [{ id: 'light-grey', label: 'Light grey' }, { id: 'white', label: 'White' }] };
const size: ShopOption = { id: 'size', label: 'Size', role: 'variant', type: 'size', values: [{ id: '50', label: '50' }, { id: '52', label: '52' }] };
const strap: ShopOption = { id: 'strap', label: 'Strap', role: 'config', type: 'choice', values: [{ id: 'hand', label: 'Hand, fixed', priceCents: 2000 }] };

function product(over: Partial<ShopProduct> = {}): ShopProduct {
  const options = over.options ?? [colour, size, strap];
  return {
    id: 'JK-001', kind: 'fashion', group: 'jackets', code: 'JK / 001', slug: 'jk-001', name: 'jacket, white',
    material: 'Cotton', description: 'A jacket.', spec: [], accordions: [], note: '', lead: '5 days', inv: '///',
    images: [], priceCents: 52000, options, variants: expandVariants(options), status: 'active', href: '/atelier/fashion/jk-001/',
    ...over,
  };
}

describe('documents', () => {
  it('stores a spec row as an object and reads it back', () => {
    expect(specForStore([['Cloth', 'Cotton']])).toEqual([{ label: 'Cloth', value: 'Cotton' }]);
    expect(specFromStore([{ label: 'Cloth', value: 'Cotton' }])).toEqual([['Cloth', 'Cotton']]);
  });
});

describe('variants and sku', () => {
  it('builds the key in option-id order', () => {
    expect(variantKey([size, colour], { size: '50', colour: 'light-grey' })).toBe('light-grey.50');
    expect(skuFor('JK-001', 'light-grey.50')).toBe('JK-001__light-grey.50');
    expect(skuFor('CI-07.P', '')).toBe('CI-07.P');
  });
  it('treats stone and strap as configuration, glaze and leather as variants', () => {
    expect(optionRole('stone')).toBe('config');
    expect(optionRole('strap')).toBe('config');
    expect(optionRole('glaze')).toBe('variant');
    expect(optionRole('leather')).toBe('variant');
  });
  it('expands every variant combination and one row when there is none', () => {
    expect(expandVariants([colour, size])).toHaveLength(4);
    expect(expandVariants([strap])).toEqual([{ key: '', priceCents: null, values: {} }]);
  });
});

describe('prices', () => {
  it('uses the variant price when it is set, then adds configuration', () => {
    const item = product();
    item.variants = item.variants.map((variant) => variant.key === 'light-grey.50' ? { ...variant, priceCents: 54000 } : variant);
    expect(unitPriceCents(item, 'light-grey.50', { strap: 'hand' })).toBe(56000);
    expect(unitPriceCents(item, 'white.50', {})).toBe(52000);
  });
  it('a missing or empty price is not for sale', () => {
    expect(forSale(null)).toBe(false);
    expect(forSale(0)).toBe(false);
    expect(unitPriceCents(product({ priceCents: null }), '', {})).toBeNull();
  });
  it('reads euro whole numbers and refuses a bad list', () => {
    expect(readPrices({ _readme: 'skip', _example: { 'JK-001': 1 }, 'JK-001': 540 }, new Set(['JK-001'])).get('JK-001')).toBe(54000);
    expect(() => readPrices({ 'NO-1': 10 }, new Set(['JK-001']))).toThrow(/unknown product id NO-1/);
    expect(() => readPrices({ 'JK-001': 10.5 }, new Set(['JK-001']))).toThrow(/positive whole number/);
    expect(() => readPrices({ 'JK-001': 0 }, new Set(['JK-001']))).toThrow(/positive whole number/);
  });
});

describe('stock and validation', () => {
  it('opens poster and archival editions at their editions and everything else as made to order', () => {
    expect(openingStock({ work: { edition: 'poster' } })).toBe(100);
    expect(openingStock({ work: { edition: 'archival' } })).toBe(25);
    expect(openingStock({})).toBeNull();
  });
  it('writes one inventory row per variant', () => {
    const docs = inventoryDocs(product());
    expect(docs).toHaveLength(4);
    expect(docs.every((doc) => doc.reserved === 0 && doc.onHand == null)).toBe(true);
  });
  it('turns a code product into a shop product', () => {
    const shop = shopProductFromCode({
      id: 'OB-011', code: 'OB / 011', slug: 'ob-011', kind: 'scan', group: 'vases', name: 'vase', material: 'Stoneware',
      description: 'A vase.', images: ['scan/OB-011'], options: [{ id: 'glaze', label: 'Glaze', type: 'swatch', values: [{ id: 'cobalt', label: 'Cobalt' }] }],
      spec: [], accordions: [], note: '', inv: '///', href: '/atelier/scan-series/ob-011/', lead: '2 weeks',
    }, null, []);
    expect(shop.options[0].role).toBe('variant');
    expect(shop.variants.map((variant) => variant.key)).toEqual(['cobalt']);
    expect(shop.status).toBe('active');
  });
  it('rejects a broken quantity and a bag line', () => {
    expect(clampQty(2)).toBe(2);
    expect(clampQty(30)).toBe(9);
    expect(clampQty(1.5)).toBeNull();
    expect(clampQty(Number.NaN)).toBeNull();
    expect(clampQty(-1)).toBeNull();
    expect(checkoutBodySchema.safeParse({ items: [{ id: 'JK-001', qty: 1 }] }).success).toBe(true);
    expect(checkoutBodySchema.safeParse({ items: [{ id: 'JK-001', qty: 0, opts: {} }] }).success).toBe(false);
    expect(enquireSchema.safeParse({ name: 'A', email: 'a@b.de', company: '' }).success).toBe(true);
    expect(enquireSchema.safeParse({ name: 'A', email: 'not-an-email' }).success).toBe(false);
  });
});
