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
 * Menu and search remember the path they were opened on, so any navigation closes them.
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [menuState, setMenuState] = useState<{ path: string; tab: WorldId }>({ path: '', tab: 'atelier' });
  const [searchPath, setSearchPath] = useState('');
  const [enquiry, setEnquiry] = useState({ open: false, what: '', n: 0 });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const openMenu = useCallback((tab?: WorldId) => {
    setSearchPath('');
    setMenuState({ path: pathname, tab: tab ?? worldOf(pathname) ?? 'atelier' });
  }, [pathname]);
  const closeMenu = useCallback(() => setMenuState((m) => ({ ...m, path: '' })), []);
  const openSearch = useCallback(() => {
    setMenuState((m) => ({ ...m, path: '' }));
    setSearchPath(pathname);
  }, [pathname]);
  const closeSearch = useCallback(() => setSearchPath(''), []);
  const openEnquiry = useCallback((what: string) => setEnquiry((e) => ({ open: true, what, n: e.n + 1 })), []);
  const closeEnquiry = useCallback(() => setEnquiry((e) => ({ ...e, open: false })), []);
  const showToast = useCallback((text: string, link?: ToastLink) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, link });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const value = useMemo<Chrome>(() => ({
    menu: { open: menuState.path === pathname, tab: menuState.tab }, openMenu, closeMenu,
    searchOpen: searchPath === pathname, openSearch, closeSearch,
    enquiry, openEnquiry, closeEnquiry,
    toast, showToast,
  }), [menuState, searchPath, pathname, openMenu, closeMenu, openSearch, closeSearch, enquiry, openEnquiry, closeEnquiry, toast, showToast]);

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome(): Chrome {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error('useChrome() needs <ChromeProvider> around it');
  return chrome;
}
