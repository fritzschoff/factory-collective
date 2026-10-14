/**
 * Everything that is drawn but not built yet — "coming soon".
 * Shown in red with ( ) and the words "coming soon", never linked.
 * Flip `status` to 'live' once the page exists (and its route is back in src/app):
 * the links switch on everywhere and the redirect from the old address disappears.
 */
export type SoonStatus = 'soon' | 'live';

export interface SoonEntry {
  label: string;
  /** the address the page had or will have */
  path?: string;
  /** where that address sends people while the entry is 'soon' */
  redirectTo?: string;
  status: SoonStatus;
}

export const SOON = {
  furniture: { label: 'Furniture', path: '/atelier/furniture/', redirectTo: '/atelier/', status: 'soon' },
  outerwear: { label: 'Outerwear', status: 'soon' },
  rings: { label: 'Rings', status: 'soon' },
  moreBags: { label: 'Six more bags', status: 'soon' },
  bagText: { label: 'Bag / Profile Series', path: '/factory/bag-profile-series/', redirectTo: '/factory/', status: 'soon' },
  theses: { label: 'T03 ( )  T04 ( )', status: 'soon' },
  publishing: { label: 'Publishing', path: '/factory/publishing/', redirectTo: '/factory/', status: 'soon' },
  archive: { label: 'Archive', path: '/factory/archive/', redirectTo: '/factory/', status: 'soon' },
  lectures: { label: 'Lectures', path: '/factory/lectures/', redirectTo: '/factory/', status: 'soon' },
  exhibitions: { label: 'Exhibitions', path: '/studio/exhibitions/', redirectTo: '/studio/', status: 'soon' },
  sound: { label: 'Sound', path: '/studio/sound/', redirectTo: '/studio/', status: 'soon' },
  scenography: { label: 'Scenography', path: '/studio/scenography/', redirectTo: '/studio/', status: 'soon' },
  architecture: { label: 'Architecture', path: '/studio/architecture/', redirectTo: '/studio/', status: 'soon' },
  campaign03: { label: '( 03 )', status: 'soon' },
  journal: { label: 'Journal', path: '/journal/', redirectTo: '/', status: 'soon' },
  press: { label: 'Press', path: '/press/', redirectTo: '/about/', status: 'soon' },
} as const satisfies Record<string, SoonEntry>;

export type SoonKey = keyof typeof SOON;
/** The registry as the functions below read it; tests pass a copy with an entry switched to 'live'. */
export type SoonRegistry = Readonly<Record<SoonKey, SoonEntry>>;

const entries = (registry: SoonRegistry): SoonEntry[] => Object.values(registry);

export const isSoon = (key: SoonKey, registry: SoonRegistry = SOON): boolean => registry[key].status === 'soon';

/** The page to link to once the entry is live; undefined while it is coming soon or has no page of its own. */
export function soonHref(key: SoonKey, registry: SoonRegistry = SOON): string | undefined {
  const e = registry[key];
  return e.status === 'live' ? e.path : undefined;
}

/** "Furniture" → "Furniture ( )" — any text with the empty brackets after it, unless it already shows them. */
export function withBrackets(text: string): string {
  return /\(\s\)/.test(text) ? text : `${text} ( )`;
}

/** "Furniture ( )" — the label with the empty brackets, unless it already has them. */
export function soonLabel(key: SoonKey): string {
  return withBrackets(SOON[key].label);
}

/** Old addresses of pages that are 'soon' — fed to next.config `redirects()`. */
export function soonRedirects(registry: SoonRegistry = SOON): { source: string; destination: string; permanent: false }[] {
  return entries(registry)
    .filter((e) => e.status === 'soon' && e.path && e.redirectTo)
    .map((e) => ({ source: e.path!, destination: e.redirectTo!, permanent: false as const }));
}

/** Addresses nothing on the site may link to while they are 'soon'. */
export const soonPaths = (registry: SoonRegistry = SOON): string[] =>
  entries(registry).filter((e) => e.status === 'soon' && e.path).map((e) => e.path!);
