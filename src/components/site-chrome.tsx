import { Suspense, type ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Header } from '@/components/header/Header';

/**
 * Everything around a public page: header, (menu, search, footer, dialogs follow), toast.
 * The boundary matters under cacheComponents: on a dynamic route the prerendered fallback shell cannot
 * resolve usePathname (the param is unknown until request time), so the chrome suspends there instead of failing the build.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ChromeProvider>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Toast />
      </ChromeProvider>
    </Suspense>
  );
}
