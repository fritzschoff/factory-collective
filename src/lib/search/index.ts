/** k kind · n name · s sub line · h href · i thumbnail · p price */
export interface SearchEntry { k: string; n: string; s: string; h: string; i: string | null; p: string | null }

export const normalize = (s: string): string => s.toLowerCase().replace(/[\s/.\-–—]+/g, ' ').trim();

/**
 * Every word must appear (name, sub line or kind), or the query without spaces appears without spaces (sh001).
 * Codes first: a name that starts with the query ("SH / 001 …") beats a name that only contains its words,
 * which beats a hit somewhere else ("sh" inside "Fashion"). The old site had no ranking: "SH / 001" showed JK / 001 first.
 */
export function searchEntries(index: readonly SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(' ');
  const compact = q.replace(/ /g, '');
  const rank = (x: SearchEntry): number => {
    const name = normalize(x.n);
    if (name.replace(/ /g, '').startsWith(compact)) return 0;
    return words.every((w) => name.includes(w)) ? 1 : 2;
  };
  return index
    .filter((x) => {
      const hay = normalize(`${x.n} ${x.s} ${x.k}`);
      return words.every((w) => hay.includes(w)) || hay.replace(/ /g, '').includes(compact);
    })
    .map((x) => ({ x, r: rank(x) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .map(({ x }) => x);
}

export function groupByKind(entries: readonly SearchEntry[]): [string, SearchEntry[]][] {
  const groups = new Map<string, SearchEntry[]>();
  for (const e of entries) groups.set(e.k, [...(groups.get(e.k) ?? []), e]);
  return [...groups];
}
