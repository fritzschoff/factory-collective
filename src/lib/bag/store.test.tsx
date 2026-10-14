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
