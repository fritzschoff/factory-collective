import { Suspense, type ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Header } from '@/components/header/Header';

/**
 * Everything around a public page: header, (menu, search, footer, dialogs follow), toast.
 * Under cacheComponents the address cannot be read on a dynamic route whose params are not known at build time, so
 * whatever reads it (the Header here, the route watcher inside ChromeProvider) waits in a Suspense boundary of its own.
 * The page and the rest of the chrome stay outside any boundary: one that wraps them is sent after the shell once its
 * HTML passes about 12.8 KB and is revealed late — the page would load blank (see ChromeProvider).
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <ChromeProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Suspense fallback={null}><Header /></Suspense>
      <main id="main" tabIndex={-1}>{children}</main>
      <Toast />
    </ChromeProvider>
  );
}
