import { describe, expect, it } from 'vitest';
import { soonPaths } from '@/content/soon';
import { getCatalog } from '@/lib/data/catalog';
import { allPages, staticPage } from './pages';

describe('page registry', () => {
  it('has the 87 pages of the rebuilt site, each once', async () => {
    const pages = allPages(await getCatalog());
    expect(pages).toHaveLength(87);
    expect(new Set(pages.map((p) => p.path)).size).toBe(87);
  });
  it('every address ends with a slash and none is coming soon', async () => {
    for (const p of allPages(await getCatalog())) {
      expect(p.path.endsWith('/')).toBe(true);
      expect(soonPaths()).not.toContain(p.path);
    }
  });
  it('products and works carry search entries with a picture', async () => {
    const sh = allPages(await getCatalog()).find((p) => p.path === '/atelier/fashion/sh-001/')!;
    expect(sh).toMatchObject({ title: 'SH / 001 // shirt, grey band', world: 'atelier', sheet: 'Atelier / Fashion / SH / 001', search: { kind: 'Fashion', slot: 'fashion/SH-001' } });
  });
  it('the bag is not indexed', () => {
    expect(staticPage('/bag/').noindex).toBe(true);
  });
  it('an unknown static path is an error, not a silent default', () => {
    expect(() => staticPage('/nowhere/')).toThrow('No page entry for /nowhere/');
  });
});
