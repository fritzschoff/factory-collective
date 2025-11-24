export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Legal
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Privacy Policy</h1>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Data Protection</h2>
          <p>
            We take the protection of your personal data very seriously. This
            privacy policy explains how we collect, use, and protect your
            information.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Data Collection</h2>
          <p>
            We collect data that you provide to us directly, such as when you
            create an account, make a purchase, or contact us. This may include
            your name, email address, shipping address, and payment information.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Data Usage</h2>
          <p>
            We use your data to process orders, communicate with you, and
            improve our services. We do not sell your personal data to third
            parties.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Cookies</h2>
          <p>
            We use cookies to enhance your browsing experience and analyze site
            traffic. You can control cookie settings through your browser
            preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
