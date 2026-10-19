import type { ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Footer } from '@/components/footer/Footer';
import { EnquireDialog } from '@/components/forms/EnquireDialog';
import { Header } from '@/components/header/Header';
import { BagCatalog } from '@/components/shop/BagCount';
import { MenuPanel } from '@/components/menu/MenuPanel';
import { Search } from '@/components/search/Search';
import { buildMenu } from '@/content/menu';
import { allPages } from '@/content/pages';
import { labelled, pieces, workCount } from '@/lib/counts';
import { getCatalog } from '@/lib/data/catalog';
import { buildSearchIndex } from '@/lib/search/build';

/**
 * Everything around a public page: header, menu, search, footer, enquiry dialog, toast.
 * No Suspense boundary wraps any of it. Under cacheComponents the address cannot be read on a dynamic route whose
 * params are not known at build time, so what reads it (the route watcher in ChromeProvider, the room labels in the
 * Header) waits in boundaries of its own, each far under 500 bytes. A bigger one is sent after the shell and revealed
 * some 300 ms late: the page would load blank (see ChromeProvider).
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const cat = await getCatalog();
  const pages = allPages(cat);
  return (
    <ChromeProvider>
      <BagCatalog ids={cat.products.map((product) => product.id)}>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer sheets={Object.fromEntries(pages.map((p) => [p.path, p.sheet]))} />
        <MenuPanel worlds={buildMenu(cat)} />
        <Search index={buildSearchIndex(pages, cat)} quick={[
          { label: labelled('Fashion', pieces(cat, 'fashion')), href: '/atelier/fashion/' },
          { label: labelled('Bags', pieces(cat, 'bag')), href: '/atelier/bags/' },
          { label: labelled('Jewellery', pieces(cat, 'jewellery')), href: '/atelier/jewellery/' },
          { label: labelled('Scan Series', pieces(cat, 'scan')), href: '/atelier/scan-series/' },
          { label: labelled('Conceptual Interference', workCount('ci')), href: '/studio/conceptual-interference/' },
          { label: labelled('Layer Paintings', workCount('lp')), href: '/studio/layer-paintings/' },
          { label: 'Texts', href: '/factory/' },
        ]} />
        <EnquireDialog />
        <Toast />
      </BagCatalog>
    </ChromeProvider>
  );
}
