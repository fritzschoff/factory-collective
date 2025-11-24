import { siteConfig } from '@/config/site';

export default function ContactPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Contact
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Get in Touch</h1>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
              Email
            </h3>
            <a
              href={`mailto:${siteConfig.footer.supportEmail}`}
              className="text-lg text-black/70 hover:text-black transition-colors"
            >
              {siteConfig.footer.supportEmail}
            </a>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
              Phone
            </h3>
            <a
              href={`tel:${siteConfig.footer.phone}`}
              className="text-lg text-black/70 hover:text-black transition-colors"
            >
              {siteConfig.footer.phone}
            </a>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
              Address
            </h3>
            <p className="text-lg text-black/70">{siteConfig.footer.address}</p>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-black/40"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full rounded border border-black/10 bg-white px-4 py-3 text-black/70 focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-black/40"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded border border-black/10 bg-white px-4 py-3 text-black/70 focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-black/40"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              className="w-full rounded border border-black/10 bg-white px-4 py-3 text-black/70 focus:border-black focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-black/20 bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
