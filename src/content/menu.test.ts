import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NAV, type NavEntry } from '@/content/nav';
import { soonPaths } from '@/content/soon';
import { getCatalog } from '@/lib/data/catalog';
import { slotSrc } from '@/lib/images';
import { buildMenu, type MenuEntry } from './menu';

// Which picture a slot gets depends on the IMAGES switch and on the photographs the owner has put into public/images
// (the manifest). Neither may change this test: no real pictures, and local mode (Ruling P17, as in products.test.ts).
vi.mock('@/generated/image-manifest.json', () => ({ default: { slots: {} } }));

beforeEach(() => {
  vi.stubEnv('IMAGES', 'local');
});
afterEach(() => {
  vi.unstubAllEnvs();
});

const entries = (worlds: Awaited<ReturnType<typeof buildMenu>>): MenuEntry[] =>
  worlds.flatMap((w) => w.columns.flat().flatMap((g) => [g.head, ...g.items]));

describe('buildMenu', () => {
  it('has the five rooms in order', async () => {
    expect(buildMenu(await getCatalog()).map((w) => w.id)).toEqual(['factory', 'atelier', 'studio', 'campaigns', 'about']);
  });
  it('counts series and groups from the catalogue', async () => {
    const atelier = buildMenu(await getCatalog())[1];
    const fashion = atelier.columns[0][0];
    expect(fashion.head.count).toBe('( 18 )');
    expect(fashion.items[0]).toMatchObject({ label: 'Jackets', count: '( 8 )' });
  });
  it('the groups of a series add up to the series (a misspelt group would count 0)', async () => {
    const number = (e: MenuEntry) => Number(e.count!.replace(/\D/g, ''));
    const series = buildMenu(await getCatalog())[1].columns.flat().filter((g) => g.items.some((i) => i.count));
    expect(series.map((g) => g.head.label)).toEqual(['Fashion', 'Jewellery', 'Scan Series']);
    for (const g of series) expect(g.items.filter((i) => i.count).reduce((sum, i) => sum + number(i), 0)).toBe(number(g.head));
  });
  it('coming-soon rows have no link and carry the empty brackets', async () => {
    const all = entries(buildMenu(await getCatalog()));
    const soon = all.filter((e) => e.href === null);
    expect(soon.map((e) => e.label)).toEqual(expect.arrayContaining(['Outerwear ( )', 'Furniture ( )', 'Bag / Profile Series ( )', '( 03 ) ( )', 'Journal ( )']));
    expect(soon.every((e) => e.label.includes('( )'))).toBe(true);
  });
  it('no menu link points to a coming-soon address', async () => {
    const hrefs = entries(buildMenu(await getCatalog())).map((e) => e.href).filter((h): h is string => h !== null);
    for (const p of soonPaths()) expect(hrefs.some((h) => h.startsWith(p))).toBe(false);
  });
  // buildMenu drops a slot without a picture, so a slot misspelt in nav.ts would only make a window poorer, unseen.
  it('every picture slot of the nav has a picture', () => {
    const slots = new Set<string>();
    const take = (e: NavEntry | undefined) => { if (e && 'win' in e) e.win?.forEach((s) => slots.add(s)); };
    for (const w of NAV) {
      w.win.forEach((s) => slots.add(s));
      for (const g of w.columns.flat()) { take(g.head); g.items?.forEach(take); }
    }
    expect(slots.size).toBeGreaterThan(50);
    expect([...slots].filter((s) => slotSrc(s) === null)).toEqual([]);
  });
  // The window is a CSS background, so its pictures are optimizer URLs (Ruling P27), sized for the window: 640 px.
  it('window pictures are resolved to optimizer URLs', async () => {
    const factory = buildMenu(await getCatalog())[0];
    expect(factory.win[0]).toMatch(/^\/_next\/image\?/);
    expect(factory.win[0]).toContain(encodeURIComponent('/images/_sample/art/arch1.jpg'));
    expect(factory.win[0]).toContain('&w=640');
  });
});
