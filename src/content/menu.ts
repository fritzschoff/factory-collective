import { NAV, type CountOf, type NavEntry, type NavWorld } from '@/content/nav';
import { SOON, soonHref, soonLabel } from '@/content/soon';
import type { Catalog } from '@/lib/data/catalog';
import { optimizedSrc } from '@/lib/image-url';
import { slotSrc } from '@/lib/images';
import type { WorldId } from '@/lib/nav/world';

/** A menu row as the browser receives it: plain data, pictures already URLs, href null = coming soon. */
export interface MenuEntry { label: string; href: string | null; count: string | null; win: string[]; cap: string }
export interface MenuGroup { head: MenuEntry; note: string | null; items: MenuEntry[] }
export interface MenuWorld {
  id: WorldId; label: string; quiet: boolean; verb: string | null; line: string | null;
  enter: { label: string; href: string }; win: string[]; cap: string; columns: MenuGroup[][];
}

/** What the window of the menu needs, in px (about 300 wide on a desktop, twice that on a dense screen). */
const WINDOW_WIDTH = 640;

/**
 * The pictures of a window: slots that have a picture, as optimizer URLs. The window is a CSS background, which
 * cannot be an <Image>, so the URL is built by hand (Ruling P27).
 */
const urls = (slots: readonly string[] | undefined): string[] =>
  (slots ?? []).map(slotSrc).filter((s): s is string => s !== null).map((s) => optimizedSrc(s, WINDOW_WIDTH));
const countOf = (cat: Catalog, c: CountOf): number => (c.group ? cat.group(c.kind, c.group) : cat.shop(c.kind)).length;

/** A coming-soon entry stays red until it is live and has a page; then it is an ordinary row. */
export function menuEntry(cat: Catalog, e: NavEntry): MenuEntry {
  if ('soon' in e) {
    const href = soonHref(e.soon);
    return href
      ? { label: SOON[e.soon].label, href, count: null, win: [], cap: '' }
      : { label: soonLabel(e.soon), href: null, count: null, win: [], cap: '' };
  }
  return { label: e.label, href: e.href, count: e.count ? `( ${countOf(cat, e.count)} )` : null, win: urls(e.win), cap: e.cap ?? '' };
}

export function buildMenu(cat: Catalog, nav: readonly NavWorld[] = NAV): MenuWorld[] {
  return nav.map((w) => ({
    id: w.id, label: w.label, quiet: !!w.quiet, verb: w.verb ?? null, line: w.line ?? null, enter: w.enter,
    win: urls(w.win), cap: w.cap,
    columns: w.columns.map((col) => col.map((g) => ({ head: menuEntry(cat, g.head), note: g.note ?? null, items: (g.items ?? []).map((i) => menuEntry(cat, i)) }))),
  }));
}
