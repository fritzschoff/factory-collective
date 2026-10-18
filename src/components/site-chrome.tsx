import type { ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Header } from '@/components/header/Header';
import { MenuPanel } from '@/components/menu/MenuPanel';
import { Search } from '@/components/search/Search';
import { buildMenu } from '@/content/menu';
import { allPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { buildSearchIndex } from '@/lib/search/index';

/**
 * Everything around a public page: header, menu, search, (footer and dialogs follow), toast.
 * No Suspense boundary wraps any of it. Under cacheComponents the address cannot be read on a dynamic route whose
 * params are not known at build time, so what reads it (the route watcher in ChromeProvider, the room labels in the
 * Header) waits in boundaries of its own, each far under 500 bytes. A bigger one is sent after the shell and revealed
 * some 300 ms late: the page would load blank (see ChromeProvider).
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const cat = await getCatalog();
  return (
    <ChromeProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <MenuPanel worlds={buildMenu(cat)} />
      <Search index={buildSearchIndex(allPages(cat), cat)} />
      <Toast />
    </ChromeProvider>
  );
}
