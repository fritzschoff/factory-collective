export default function AtelierPage() {
  const categories = [
    {
      title: "Material / Textur",
      description: "Material studies and texture exploration",
    },
    {
      title: "Form / Struktur",
      description: "Form and structural design",
    },
    {
      title: "Oberfläche / Finish",
      description: "Surface treatments and finishes",
    },
    {
      title: "Display / Präsentation",
      description: "Display and presentation methods",
    },
    {
      title: "Kontext / Narrativ",
      description: "Context and narrative development",
    },
    {
      title: "Prozess / Technik",
      description: "Process and technique documentation",
    },
    {
      title: "Funktion / Gebrauch",
      description: "Function and usage studies",
    },
    {
      title: "Wert / Bedeutung",
      description: "Value and meaning analysis",
    },
  ];

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          C.I.C
        </p>
        <h1 className="text-4xl font-light md:text-5xl">ATELIER</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-black/40">
          Zweck: Physische Produktion / Objekte
        </p>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <p>
          ATELIER focuses on physical production, fashion, jewelry, objects,
          material culture, and craft. It encompasses all actual objects and
          manufacturing processes, workshop notes, material studies, prototypes,
          and documentation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category, index) => (
          <div
            key={index}
            className="rounded-lg border border-black/10 bg-white/70 p-6 transition-all hover:shadow-lg"
          >
            <h3 className="mb-2 text-lg font-semibold">{category.title}</h3>
            <p className="text-sm text-black/60">{category.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-black/10 pt-8">
        <h2 className="text-xl font-semibold">Core Concepts</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "System",
            "Texture",
            "Substance",
            "Objects",
            "Teaching",
            "Process",
          ].map((concept) => (
            <span
              key={concept}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
