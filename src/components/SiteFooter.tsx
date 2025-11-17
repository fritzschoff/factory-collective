import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-black/60 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Factory Collective</p>
        <div className="flex flex-wrap gap-6">
          <span>{siteConfig.footer.supportEmail}</span>
          <span>{siteConfig.footer.phone}</span>
          <span>{siteConfig.footer.address}</span>
        </div>
      </div>
    </footer>
  );
}
