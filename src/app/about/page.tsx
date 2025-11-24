export default function AboutPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          About
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Factory Collective</h1>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <p>
          We assemble pods across strategy, hardware integration, finance, and
          fulfillment. Everything ships with Stripe-native billing, Firebase
          auth, and SSR dashboards so your ops stay observable.
        </p>
        <p>
          Factory Collective is a platform for building collectible commerce
          systems that print new revenue lines. Our approach combines
          theoretical research with practical implementation, creating a bridge
          between concept and reality.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
              Factory
            </h3>
            <p className="text-sm text-black/60">
              Product Design and Manufacturing
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
              Atelier
            </h3>
            <p className="text-sm text-black/60">
              Creative Workspace and Collaboration
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
              Studio
            </h3>
            <p className="text-sm text-black/60">
              Artistic Expression and Innovation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
