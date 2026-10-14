// @vitest-environment jsdom
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// `pending` makes the address suspend, as it does under cacheComponents on a route whose params are not known at build time
const nav = vi.hoisted(() => ({ path: '/studio/conceptual-interference/', pending: false, never: new Promise<string>(() => {}) }));
vi.mock('next/navigation', async (importOriginal) => {
  const { use } = await import('react');
  return { ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => (nav.pending ? use(nav.never) : nav.path) };
});

import { ChromeProvider, useChrome } from './ChromeProvider';

const wrapper = ({ children }: { children: ReactNode }) => <ChromeProvider>{children}</ChromeProvider>;

/** The menu state of the chrome, on screen. */
function Probe() {
  const { menu, openMenu, closeMenu } = useChrome();
  return (
    <>
      <button type="button" onClick={() => openMenu()}>open</button>
      <button type="button" onClick={closeMenu}>close</button>
      <output>{menu.open ? menu.tab : 'closed'}</output>
    </>
  );
}

describe('ChromeProvider', () => {
  afterEach(() => { nav.path = '/studio/conceptual-interference/'; nav.pending = false; vi.useRealTimers(); });

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

  // A Suspense boundary around the page is sent after the shell once its HTML passes about 12.8 KB, and revealed late:
  // the page would load blank. So the only thing that waits for the address is the part that reads it.
  // (A component that suspends inside act needs an awaited act, or React does not flush the effects of the others.)
  it('the page stays on show while the address is pending', async () => {
    nav.pending = true;
    await act(async () => { render(<ChromeProvider><p>the page</p></ChromeProvider>); });
    expect(screen.getByText('the page')).toBeInTheDocument();
  });

  it('works while the address is pending: opens on Atelier, then on the room of the page once it is known', async () => {
    const page = () => <ChromeProvider><Probe /></ChromeProvider>; // a new element each time: the same one would not render again
    const press = (name: string) => act(async () => { fireEvent.click(screen.getByRole('button', { name })); });
    nav.pending = true;
    const view = render(<div />);
    await act(async () => view.rerender(page()));
    await press('open');
    expect(screen.getByRole('status')).toHaveTextContent('atelier');
    await press('close');
    nav.pending = false;
    await act(async () => view.rerender(page()));
    await press('open');
    expect(screen.getByRole('status')).toHaveTextContent('studio');
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
