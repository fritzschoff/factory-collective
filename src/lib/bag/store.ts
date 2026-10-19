'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { addLine, countItems, parseBag, setQty, type BagLine, type BagOptions } from './items';

const KEY = 'cfc.bag.v1';
const EVENT = 'cfc:bag';
const EMPTY: BagLine[] = [];

/** When localStorage is blocked (private mode, full quota) the bag lives in memory for this page view. */
let blocked = false;
let memory: string | null = null;
let cachedRaw: string | null | undefined;
let cachedItems: BagLine[] = EMPTY;

function getRaw(): string | null {
  if (blocked) return memory;
  try { return window.localStorage.getItem(KEY); } catch { blocked = true; return memory; }
}
function setRaw(raw: string): void {
  memory = raw;
  if (blocked) return;
  try { window.localStorage.setItem(KEY, raw); } catch { blocked = true; }
}
function read(): BagLine[] {
  const raw = getRaw();
  if (raw !== cachedRaw) { cachedRaw = raw; cachedItems = parseBag(raw); }
  return cachedItems;
}
function write(items: BagLine[]): void {
  setRaw(JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) onChange(); };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onStorage); };
}

export function useBag() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const add = useCallback((id: string, opts: BagOptions, qty = 1) => write(addLine(read(), id, opts, qty)), []);
  const set = useCallback((key: string, qty: number) => write(setQty(read(), key, qty)), []);
  const clear = useCallback(() => write([]), []);
  return { items, count: countItems(items), add, set, clear };
}
