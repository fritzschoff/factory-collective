import { describe, expect, it } from 'vitest';
import { allPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { buildSearchIndex, groupByKind, normalize, searchEntries } from './index';

describe('search', () => {
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
  it('an empty query finds nothing', async () => {
    const cat = await getCatalog();
    expect(searchEntries(buildSearchIndex(allPages(cat), cat), '   ')).toEqual([]);
  });
  it('groups results by kind in order of appearance', () => {
    const e = (k: string, n: string) => ({ k, n, s: '', h: '/', i: null, p: null });
    expect(groupByKind([e('Fashion', 'a'), e('Text', 'b'), e('Fashion', 'c')]).map(([k, l]) => [k, l.length])).toEqual([['Fashion', 2], ['Text', 1]]);
  });
});
