export default function FactoryPage() {
  const categories = [
    {
      title: 'Theorie / Konzept',
      description: 'Theoretical texts, essays, brand manifest & workbook',
    },
    {
      title: 'Forschung / Analyse',
      description: 'Research and analysis documentation',
    },
    {
      title: 'Produktion / Prozess',
      description: 'Production processes and methodologies',
    },
    {
      title: 'Archiv / Dokumentation',
      description: 'Archived works and documentation',
    },
    {
      title: 'Kommunikation / Vermittlung',
      description: 'Communication and mediation',
    },
    {
      title: 'Präsentation / Display',
      description: 'Presentations and displays',
    },
  ];

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          C.I.C
        </p>
        <h1 className="text-4xl font-light md:text-5xl">FACTORY</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-black/40">
          Zweck: Denken, Forschung, Status, Text
        </p>
      </div>

      <div className="space-y-8 text-lg leading-relaxed text-black/70">
        <p>
          FACTORY focuses on theoretical research, philosophy, critical thought,
          and conceptual practice. It serves as the intellectual foundation for
          our work, exploring ideas through manifest, theory, research,
          conservation, archive, and language.
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
            'Manifest',
            'Theory',
            'Research',
            'Conservation',
            'Archive',
            'Language',
          ].map(concept => (
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
