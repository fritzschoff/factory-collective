import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { allPages } from '@/content/pages';
import { createCatalog, getCatalog } from '@/lib/data/catalog';
import { buildSearchIndex } from './build';
import { groupByKind, normalize, searchEntries } from './index';

// The price list is the owner's to edit, and the environment of the machine is not ours: nothing here may depend on either.
vi.mock('@/content/prices.json', () => ({ default: {} }));

describe('search', () => {
  it('keeps the picture manifest out of the module the browser imports', () => {
    const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/slotSrc|image-manifest|samples/);
  });

  beforeEach(() => {
    vi.stubEnv('DEMO_PRICES', '0');
    vi.stubEnv('IMAGES', 'local');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it('normalises codes and punctuation', () => {
    expect(normalize('SH / 001 — Shirt')).toBe('sh 001 shirt');
  });
  it('finds a code with or without its spaces and slash', async () => {
    const cat = await getCatalog();
    const index = buildSearchIndex(allPages(cat), cat);
    expect(searchEntries(index, 'SH / 001')[0]).toMatchObject({ n: 'SH / 001 shirt, grey band', h: '/atelier/fashion/sh-001/', p: '€ [price]' });
    expect(searchEntries(index, 'sh001')[0].h).toBe('/atelier/fashion/sh-001/');
  });
  it('the typed code comes before pieces that merely contain its words', async () => {
    const cat = await getCatalog();
    const hits = searchEntries(buildSearchIndex(allPages(cat), cat), 'SH / 001');
    expect(hits.map((h) => h.h)).toContain('/atelier/fashion/jk-001/'); // "sh" is in "Fashion", "001" in the code
    expect(hits[0].h).toBe('/atelier/fashion/sh-001/');
  });
  it('a piece carries its price once it has one', () => {
    const priced = createCatalog(PRODUCTS.map((p) => ({ ...p, priceCents: p.id === 'SH-001' ? 28000 : null })));
    expect(searchEntries(buildSearchIndex(allPages(priced), priced), 'SH / 001')[0].p).toBe('€ 280');
  });
  it('an empty query finds nothing', async () => {
    const cat = await getCatalog();
    expect(searchEntries(buildSearchIndex(allPages(cat), cat), '   ')).toEqual([]);
  });
  it('groups results by kind in order of appearance', () => {
    const e = (k: string, n: string) => ({ k, n, s: '', h: '/', i: null, p: null });
    expect(groupByKind([e('Fashion', 'a'), e('Text', 'b'), e('Fashion', 'c')]).map(([k, l]) => [k, l.length])).toEqual([['Fashion', 2], ['Text', 1]]);
  });
});
