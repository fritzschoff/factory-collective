import { WORKS } from '@/content/catalog';
import type { Catalog } from '@/lib/data/catalog';
import type { ProductKind } from '@/lib/types';

export type WorkSeries = 'ci' | 'lp';

export function pieces(cat: Catalog, kind: ProductKind, group?: string): number {
  return (group ? cat.group(kind, group) : cat.shop(kind)).length;
}

export function workCount(series: WorkSeries): number {
  return WORKS.filter((work) => work.series === series).length;
}

export function workPanels(series: WorkSeries): number {
  return WORKS.filter((work) => work.series === series).reduce((sum, work) => sum + work.slots.length, 0);
}

export function paren(n: number): string {
  return `( ${n} )`;
}

export function labelled(name: string, n: number): string {
  return `${name} ( ${n} )`;
}
