import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">
              C.I.C
            </p>
            <div className="space-y-2 text-sm">
              <Link
                href="/factory"
                className="block text-black/60 hover:text-black transition-colors"
              >
                FACTORY
              </Link>
              <Link
                href="/atelier"
                className="block text-black/60 hover:text-black transition-colors"
              >
                ATELIER
              </Link>
              <Link
                href="/studio"
                className="block text-black/60 hover:text-black transition-colors"
              >
                STUDIO
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">
              Legal
            </p>
            <div className="space-y-2 text-sm">
              <Link
                href="/imprint"
                className="block text-black/60 hover:text-black transition-colors"
              >
                Imprint
              </Link>
              <Link
                href="/privacy"
                className="block text-black/60 hover:text-black transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-black/60 hover:text-black transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">
              Contact
            </p>
            <div className="space-y-2 text-sm text-black/60">
              <p>{siteConfig.footer.supportEmail}</p>
              <p>{siteConfig.footer.phone}</p>
              <p>{siteConfig.footer.address}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-black/10 pt-8 text-center text-sm text-black/60">
          <p>© {new Date().getFullYear()} Factory Collective</p>
        </div>
      </div>
    </footer>
  );
}
