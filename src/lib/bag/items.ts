/** A chosen option: v = value id, l = label shown in the bag. */
export interface BagOption { v: string; l: string }
export type BagOptions = Record<string, BagOption>;
export interface BagLine { key: string; id: string; qty: number; opts: BagOptions }

export const MAX_QTY = 9;

/** One line per product + chosen options: "JK-001|colour=white&size=50". */
export const lineKey = (id: string, opts: BagOptions): string =>
  `${id}|${Object.keys(opts).sort().map((k) => `${k}=${opts[k].v}`).join('&')}`;

export function addLine(items: readonly BagLine[], id: string, opts: BagOptions, qty = 1): BagLine[] {
  const key = lineKey(id, opts);
  if (items.some((i) => i.key === key)) {
    return items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
  }
  return [...items, { key, id, qty: Math.min(MAX_QTY, Math.max(1, qty)), opts }];
}

export function setQty(items: readonly BagLine[], key: string, qty: number): BagLine[] {
  return items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)).filter((i) => i.qty > 0);
}

export const countItems = (items: readonly BagLine[]): number => items.reduce((n, i) => n + i.qty, 0);

const isOption = (o: unknown): o is BagOption =>
  typeof o === 'object' && o !== null && typeof (o as BagOption).v === 'string' && typeof (o as BagOption).l === 'string';

/** What localStorage holds, cleaned: anything broken or foreign is dropped instead of breaking the bag. */
export function parseBag(raw: string | null): BagLine[] {
  let data: unknown;
  try { data = JSON.parse(raw ?? '[]'); } catch { return []; }
  if (!Array.isArray(data)) return [];
  return data.flatMap((x): BagLine[] => {
    if (typeof x !== 'object' || x === null) return [];
    const { id, qty, opts } = x as Record<string, unknown>;
    if (typeof id !== 'string' || typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) return [];
    const clean: BagOptions = typeof opts === 'object' && opts !== null
      ? Object.fromEntries(Object.entries(opts).filter(([, v]) => isOption(v))) as BagOptions
      : {};
    return [{ key: lineKey(id, clean), id, qty: Math.min(MAX_QTY, qty), opts: clean }];
  });
}
