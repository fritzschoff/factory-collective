import { siteConfig } from "@/config/site";

export default function ImprintPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Legal
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Imprint</h1>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Information according to § 5 TMG</h2>
          <p>{siteConfig.name}</p>
          <p className="mt-2">{siteConfig.footer.address}</p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Contact</h2>
          <p>Email: {siteConfig.footer.supportEmail}</p>
          <p>Phone: {siteConfig.footer.phone}</p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Responsible for content</h2>
          <p>{siteConfig.name}</p>
          <p className="mt-2">{siteConfig.footer.address}</p>
        </div>
      </div>
    </div>
  );
}
