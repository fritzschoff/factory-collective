export default function StudioPage() {
  const categories = [
    {
      title: "Architektur / Szenografie",
      description: "Architecture and scenography projects",
    },
    {
      title: "Grafikdesign / Visuelle Kommunikation",
      description: "Graphic design and visual communication",
    },
    {
      title: "Art / Musik / Performance",
      description: "Art, music, and performance works",
    },
    {
      title: "Text / Sprache",
      description: "Text and language projects",
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
        <h1 className="text-4xl font-light md:text-5xl">STUDIO</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-black/40">
          Zweck: Immaterielle Produktion / Erscheinung
        </p>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <p>
          STUDIO focuses on immaterial production, art, music, performance, and
          visual identity. It includes archived and exhibition plans, artistic
          works, graphic design and visual communication, and documentation of
          stagings and music.
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
            "Architecture",
            "Art",
            "Presentation",
            "Graphic Design",
            "Collaboration",
            "Performance",
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
