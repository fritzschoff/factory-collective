export default function TermsPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Legal
        </p>
        <h1 className="text-4xl font-light md:text-5xl">
          Terms & Conditions
        </h1>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <div>
          <h2 className="mb-4 text-xl font-semibold">General Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be
            bound by the terms and provision of this agreement.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the
            materials on our website for personal, non-commercial transitory
            viewing only.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Purchases</h2>
          <p>
            All purchases are subject to availability. We reserve the right to
            refuse or cancel any order for any reason, including but not
            limited to product availability, errors in pricing, or errors in
            your order.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Returns & Refunds</h2>
          <p>
            Returns are accepted within 14 days of delivery. Items must be
            unused and in original packaging. Refunds will be processed within
            5-10 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
