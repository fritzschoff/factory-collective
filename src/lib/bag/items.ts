import { clampQty, MAX_QTY } from '@cfc/shop-core/validate';

/** A chosen option: v = value id, l = label shown in the bag. */
export interface BagOption { v: string; l: string }
export type BagOptions = Record<string, BagOption>;
export interface BagLine { key: string; id: string; qty: number; opts: BagOptions }

export { MAX_QTY };

/** One line per product + chosen options: "JK-001|colour=white&size=50". */
export const lineKey = (id: string, opts: BagOptions): string =>
  `${id}|${Object.keys(opts).sort().map((k) => `${k}=${opts[k].v}`).join('&')}`;

export function addLine(items: readonly BagLine[], id: string, opts: BagOptions, qty = 1): BagLine[] {
  const add = clampQty(qty);
  if (add == null) return items as BagLine[];
  const key = lineKey(id, opts);
  if (items.some((i) => i.key === key)) {
    return items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + add) } : i));
  }
  return [...items, { key, id, qty: add, opts }];
}

export function setQty(items: readonly BagLine[], key: string, qty: number): BagLine[] {
  if (qty === 0) return items.filter((i) => i.key !== key);
  const next = clampQty(qty);
  if (next == null) return items as BagLine[];
  return items.map((i) => (i.key === key ? { ...i, qty: next } : i)).filter((i) => i.qty > 0);
}

export const countItems = (items: readonly BagLine[]): number => items.reduce((n, i) => n + i.qty, 0);

const isOption = (o: unknown): o is BagOption =>
  typeof o === 'object' && o !== null && typeof (o as BagOption).v === 'string' && typeof (o as BagOption).l === 'string';

/** What localStorage holds, cleaned: anything broken or foreign is dropped instead of breaking the bag. */
export function parseBag(raw: string | null): BagLine[] {
  let data: unknown;
  try { data = JSON.parse(raw ?? '[]'); } catch { return []; }
  if (!Array.isArray(data)) return [];
  const lines = data.flatMap((x): BagLine[] => {
    if (typeof x !== 'object' || x === null) return [];
    const { id, qty, opts } = x as Record<string, unknown>;
    const next = clampQty(qty);
    if (typeof id !== 'string' || next == null) return [];
    const clean: BagOptions = typeof opts === 'object' && opts !== null
      ? Object.fromEntries(Object.entries(opts).filter(([, v]) => isOption(v))) as BagOptions
      : {};
    return [{ key: lineKey(id, clean), id, qty: next, opts: clean }];
  });
  const merged = new Map<string, BagLine>();
  for (const line of lines) {
    const prev = merged.get(line.key);
    merged.set(line.key, prev ? { ...prev, qty: Math.min(MAX_QTY, prev.qty + line.qty) } : line);
  }
  return [...merged.values()];
}
