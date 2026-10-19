// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBag } from './store';

describe('useBag', () => {
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it('adds, counts and persists under cfc.bag.v1', () => {
    const { result } = renderHook(() => useBag());
    act(() => result.current.add('OB-011', {}));
    act(() => result.current.add('OB-011', {}));
    expect(result.current.count).toBe(2);
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)).toHaveLength(1);
  });

  it('drops the bag when another tab clears storage', () => {
    const { result } = renderHook(() => useBag());
    act(() => result.current.add('OB-011', {}));
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(result.current.count).toBe(0);
  });

  it('follows changes made in another tab', () => {
    const { result } = renderHook(() => useBag());
    act(() => {
      localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'JK-001', qty: 3, opts: {} }]));
      window.dispatchEvent(new StorageEvent('storage', { key: 'cfc.bag.v1' }));
    });
    expect(result.current.count).toBe(3);
  });

  it('keeps working in memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = renderHook(() => useBag());
    act(() => result.current.add('JK-001', {}));
    expect(result.current.count).toBe(1);
  });
});

describe('useBag when storage fails or holds garbage', () => {
  // The store keeps module-level state (a blocked flag that never resets, an in-memory copy, a parse cache),
  // so every test here loads its own copy of the module.
  async function freshBag() {
    vi.resetModules();
    const { useBag: useFreshBag } = await import('./store');
    return renderHook(() => useFreshBag());
  }
  const stored = () => JSON.parse(localStorage.getItem('cfc.bag.v1') ?? 'null');

  // restore first: some tests make localStorage itself throw, and clear() would then throw as well
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

  it('an unreadable store gives an empty bag, and adding still works in memory', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = await freshBag();
    expect(result.current.items).toEqual([]);
    act(() => result.current.add('JK-001', {}));
    act(() => result.current.add('JK-001', {}));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(2);
  });

  it('a localStorage that throws on access (cookies blocked) gives an empty bag; add, set and clear work in memory', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    const { result } = await freshBag();
    expect(result.current.items).toEqual([]);
    act(() => result.current.add('OB-011', { glaze: { v: 'cobalt', l: 'Cobalt' } }));
    expect(result.current.count).toBe(1);
    act(() => result.current.set('OB-011|glaze=cobalt', 3));
    expect(result.current.count).toBe(3);
    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
  });

  it('invalid JSON under cfc.bag.v1 gives an empty bag, and the next add replaces it', async () => {
    localStorage.setItem('cfc.bag.v1', '{not json');
    const { result } = await freshBag();
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    act(() => result.current.add('OB-011', {}));
    expect(result.current.count).toBe(1);
    expect(stored()).toHaveLength(1);
  });

  it('keeps the valid lines of a partly foreign bag', async () => {
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'JK-001', qty: 2, opts: {} }, 42, null, { id: 7, qty: 1 }, { qty: 3 }]));
    const { result } = await freshBag();
    expect(result.current.items).toEqual([{ key: 'JK-001|', id: 'JK-001', qty: 2, opts: {} }]);
    expect(result.current.count).toBe(2);
  });

  // Last on purpose: the tests above leave storage blocked in their own copies of the module; this one
  // checks the writes, so it also shows that a fresh copy is not blocked.
  it('set changes a quantity, 0 removes the line, clear empties the bag, and storage follows each step', async () => {
    const { result } = await freshBag();
    act(() => result.current.add('JK-001', { size: { v: '50', l: '50' } }));
    act(() => result.current.add('OB-011', {}));
    expect(stored().map((l: { id: string; qty: number }) => [l.id, l.qty])).toEqual([['JK-001', 1], ['OB-011', 1]]);

    act(() => result.current.set('JK-001|size=50', 4));
    expect(result.current.count).toBe(5);
    expect(stored().map((l: { qty: number }) => l.qty)).toEqual([4, 1]);

    act(() => result.current.set('OB-011|', 0));
    expect(result.current.items.map((i) => i.id)).toEqual(['JK-001']);
    expect(result.current.count).toBe(4);
    expect(stored()).toHaveLength(1);

    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
    expect(stored()).toEqual([]);
  });
});
