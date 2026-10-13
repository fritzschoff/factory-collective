'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
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
 * Shared state of the page chrome: menu, search, enquiry dialog, toast.
 * A change of page closes the menu, the search and the enquiry dialog. The reset happens during
 * render, so no frame shows an overlay on the new page, and going back does not reopen anything.
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [seenPath, setSeenPath] = useState(pathname);
  const [menu, setMenu] = useState<{ open: boolean; tab: WorldId }>({ open: false, tab: 'atelier' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [enquiry, setEnquiry] = useState({ open: false, what: '', n: 0 });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Adjusting state when a prop changes (no effect): remember the page, and close the overlays when it changes.
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setMenu((m) => (m.open ? { ...m, open: false } : m));
    setSearchOpen(false);
    setEnquiry((e) => (e.open ? { ...e, open: false } : e));
  }

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

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome(): Chrome {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error('useChrome() needs <ChromeProvider> around it');
  return chrome;
}
