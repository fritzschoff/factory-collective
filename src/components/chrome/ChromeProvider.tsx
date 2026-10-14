'use client';

import { usePathname } from 'next/navigation';
import { createContext, Suspense, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { worldOf, type WorldId } from '@/lib/nav/world';

export interface ToastLink { href: string; label: string }
export interface ToastMessage { id: number; text: string; link?: ToastLink }

export interface Chrome {
  menu: { open: boolean; tab: WorldId };
  openMenu: (tab?: WorldId) => void;
  closeMenu: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  enquiry: { open: boolean; what: string; n: number };
  openEnquiry: (what: string) => void;
  closeEnquiry: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, link?: ToastLink) => void;
}

const ChromeContext = createContext<Chrome | null>(null);
const TOAST_MS = 4200;

/**
 * Tells the provider which page is showing, and renders nothing. It is the only reader of the address in here, and under
 * cacheComponents that read suspends on a route whose params are not known at build time: it gets a Suspense boundary of
 * its own (see ChromeProvider), so that boundary holds this and nothing else.
 */
function RouteWatch({ onRoute }: { onRoute: (pathname: string) => void }) {
  const pathname = usePathname() ?? '/';
  // a layout effect runs before the browser paints: no frame shows an overlay on the new page
  useLayoutEffect(() => onRoute(pathname), [pathname, onRoute]);
  return null;
}

/**
 * Shared state of the page chrome: menu, search, enquiry dialog, toast.
 * A change of page closes the menu, the search and the enquiry dialog, and going back does not reopen anything.
 *
 * The children stay outside any Suspense boundary. Once the shell passes about 12.8 KB (React's progressiveChunkSize),
 * React sends every boundary of more than 500 bytes after it and reveals it by a script that it holds back for about
 * 300 ms after the first paint: what sits in such a boundary shows up late, and round the page it would load blank.
 * Only RouteWatch is wrapped, and it renders nothing.
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState('/');
  const route = useRef<string | null>(null);
  const [menu, setMenu] = useState<{ open: boolean; tab: WorldId }>({ open: false, tab: 'atelier' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [enquiry, setEnquiry] = useState({ open: false, what: '', n: 0 });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // The first report is the page the visitor came to; every later one is a change of page.
  const onRoute = useCallback((next: string) => {
    const moved = route.current !== null && route.current !== next;
    route.current = next;
    setPathname(next);
    if (moved) {
      setMenu((m) => (m.open ? { ...m, open: false } : m));
      setSearchOpen(false);
      setEnquiry((e) => (e.open ? { ...e, open: false } : e));
    }
  }, []);

  const openMenu = useCallback((tab?: WorldId) => {
    setSearchOpen(false);
    setMenu({ open: true, tab: tab ?? worldOf(pathname) ?? 'atelier' });
  }, [pathname]);
  const closeMenu = useCallback(() => setMenu((m) => ({ ...m, open: false })), []);
  const openSearch = useCallback(() => {
    setMenu((m) => ({ ...m, open: false }));
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openEnquiry = useCallback((what: string) => setEnquiry((e) => ({ open: true, what, n: e.n + 1 })), []);
  const closeEnquiry = useCallback(() => setEnquiry((e) => ({ ...e, open: false })), []);
  const showToast = useCallback((text: string, link?: ToastLink) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, link });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const value = useMemo<Chrome>(() => ({
    menu, openMenu, closeMenu,
    searchOpen, openSearch, closeSearch,
    enquiry, openEnquiry, closeEnquiry,
    toast, showToast,
  }), [menu, searchOpen, openMenu, closeMenu, openSearch, closeSearch, enquiry, openEnquiry, closeEnquiry, toast, showToast]);

  return (
    <ChromeContext.Provider value={value}>
      <Suspense fallback={null}><RouteWatch onRoute={onRoute} /></Suspense>
      {children}
    </ChromeContext.Provider>
  );
}

export function useChrome(): Chrome {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error('useChrome() needs <ChromeProvider> around it');
  return chrome;
}
