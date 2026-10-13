// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ path: '/studio/conceptual-interference/' }));
vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => nav.path }));

import { ChromeProvider, useChrome } from './ChromeProvider';

const wrapper = ({ children }: { children: ReactNode }) => <ChromeProvider>{children}</ChromeProvider>;

describe('ChromeProvider', () => {
  afterEach(() => { nav.path = '/studio/conceptual-interference/'; vi.useRealTimers(); });

  it('opens the menu on the room of the page and closes it', () => {
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu());
    expect(result.current.menu).toEqual({ open: true, tab: 'studio' });
    act(() => result.current.closeMenu());
    expect(result.current.menu.open).toBe(false);
  });

  it('a navigation closes the menu without any effect', () => {
    const { result, rerender } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu('factory'));
    nav.path = '/factory/';
    rerender();
    expect(result.current.menu.open).toBe(false);
  });

  it('leaving the page closes the menu; coming back does not reopen it', () => {
    const { result, rerender } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu());
    nav.path = '/factory/';
    rerender();
    expect(result.current.menu.open).toBe(false);
    nav.path = '/studio/conceptual-interference/';
    rerender();
    expect(result.current.menu.open).toBe(false);
    act(() => result.current.openMenu());
    expect(result.current.menu.open).toBe(true);
  });

  it('leaving the page closes the search; coming back does not reopen it', () => {
    const { result, rerender } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openSearch());
    nav.path = '/factory/';
    rerender();
    expect(result.current.searchOpen).toBe(false);
    nav.path = '/studio/conceptual-interference/';
    rerender();
    expect(result.current.searchOpen).toBe(false);
  });

  it('leaving the page closes the enquiry dialog; coming back does not reopen it', () => {
    const { result, rerender } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openEnquiry('CI / 07'));
    nav.path = '/factory/';
    rerender();
    expect(result.current.enquiry.open).toBe(false);
    nav.path = '/studio/conceptual-interference/';
    rerender();
    expect(result.current.enquiry.open).toBe(false);
  });

  it('search and menu exclude each other', () => {
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu());
    act(() => result.current.openSearch());
    expect(result.current.searchOpen).toBe(true);
    expect(result.current.menu.open).toBe(false);
  });

  it('counts enquiry openings so the form starts fresh', () => {
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openEnquiry('CI / 07 — the original'));
    expect(result.current.enquiry).toEqual({ open: true, what: 'CI / 07 — the original', n: 1 });
  });

  it('the toast goes away after 4.2 s', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.showToast('In your bag.'));
    expect(result.current.toast?.text).toBe('In your bag.');
    act(() => { vi.advanceTimersByTime(4200); });
    expect(result.current.toast).toBeNull();
  });
});
