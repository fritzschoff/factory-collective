import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS, WORKS } from '@/content/catalog';
import { createCatalog, demoPriceCents, fromPrice, getCatalog, priceCentsFor } from './catalog';

// The price list is the owner's to edit, so nothing in this file may depend on what is in it.
vi.mock('@/content/prices.json', () => ({ default: {} }));

const cat = createCatalog(PRODUCTS.map((p) => ({ ...p, priceCents: null })));

describe('catalog', () => {
  it('holds the 80 products of the current site', () => {
    expect(cat.products).toHaveLength(80);
  });
  it('finds by id and by slug', () => {
    expect(cat.byId('SH-001')?.name).toBe('shirt, grey band');
    expect(cat.bySlug('fashion', 'sh-001')?.id).toBe('SH-001');
    expect(cat.bySlug('bag', 'sh-001')).toBeUndefined();
  });
  it('pick keeps the order and skips unknown ids', () => {
    expect(cat.pick(['TR-002', 'NOPE', 'JK-004']).map((p) => p.id)).toEqual(['TR-002', 'JK-004']);
  });
  it('counts series and groups', () => {
    expect(cat.shop('fashion')).toHaveLength(18);
    expect(cat.group('fashion', 'jackets')).toHaveLength(8);
    expect(cat.shop('bag')).toHaveLength(4);
    expect(cat.shop('jewellery')).toHaveLength(5);
    expect(cat.shop('scan')).toHaveLength(15);
  });
  it('lists the two editions of a work', () => {
    expect(cat.printsOf('CI-07').map((p) => p.id).sort()).toEqual(['CI-07.A', 'CI-07.P']);
  });
  it('bags point to the unwritten text as coming soon', () => {
    expect(cat.byId('BG-114')?.text).toEqual({ soon: 'bagText', label: 'Bag / Profile Series — the text' });
  });
});

describe('prices', () => {
  const sh = cat.byId('SH-001')!;
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it('takes the manual EUR price first', () => {
    expect(priceCentsFor(sh, { 'SH-001': 280 }, true)).toBe(28000);
  });
  it('ignores entries of the manual list that are not numbers', () => {
    expect(priceCentsFor(sh, { 'SH-001': '280', _readme: 'x' }, false)).toBeNull();
  });
  it('falls back to demo prices only when asked', () => {
    expect(priceCentsFor(sh, {}, true)).toBe(demoPriceCents(sh));
    expect(priceCentsFor(sh, {}, false)).toBeNull();
  });
  it('fromPrice shows the cheapest edition, or the placeholder', () => {
    const w = WORKS.find((x) => x.id === 'CI-07')!;
    expect(fromPrice(cat, w)).toBe('from € [price]');
    const priced = createCatalog(cat.products.map((p) => ({ ...p, priceCents: p.id === 'CI-07.P' ? 4500 : p.id === 'CI-07.A' ? 16000 : null })));
    expect(fromPrice(priced, w)).toBe('from € 45');
  });
  it('getCatalog has no prices without DEMO_PRICES', async () => {
    // '0' is a non-empty string: a truthiness check on the variable would wrongly switch demo prices on
    vi.stubEnv('DEMO_PRICES', '0');
    expect((await getCatalog()).byId('JK-001')?.priceCents).toBeNull();
  });
  it('getCatalog gives the demo price with DEMO_PRICES=1', async () => {
    vi.stubEnv('DEMO_PRICES', '1');
    const cents = (await getCatalog()).byId('JK-001')?.priceCents;
    expect(cents).toBe(demoPriceCents(cat.byId('JK-001')!));
    expect(Number.isInteger(cents)).toBe(true);
    expect(cents).toBeGreaterThan(0);
  });
});
