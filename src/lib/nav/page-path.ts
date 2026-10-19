import { usePathname } from 'next/navigation';

/**
 * The address of the current page. When Vercel re-renders the home page in the background (ISR, every 60 s since the
 * catalogue revalidates), Next renders it as "/index" — the footer then named the home page "404" in the server HTML
 * and the browser corrected it during hydration (React error 418). That address is "/" here too.
 */
export function usePagePath(): string {
  const path = usePathname() ?? '/';
  return path === '/index' || path === '/index/' ? '/' : path;
}
