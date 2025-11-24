import Link from "next/link";

const archiveCategories = [
  { label: "All", href: "/archive" },
  { label: "Studio", href: "/archive/studio" },
  { label: "Press", href: "/archive/press" },
  { label: "Info", href: "/archive/info" },
];

const communityCards = [
  {
    title: "Factory",
    description: "Product Design and Manufacturing",
    category: "Studio",
  },
  {
    title: "Atelier",
    description: "Creative Workspace and Collaboration",
    category: "Studio",
  },
  {
    title: "Studio",
    description: "Artistic Expression and Innovation",
    category: "Studio",
  },
  {
    title: "Press Release",
    description: "Latest News and Announcements",
    category: "Press",
  },
  {
    title: "Community",
    description: "Join our collective",
    category: "Info",
  },
  {
    title: "About Us",
    description: "Our story and mission",
    category: "Info",
  },
];

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const activeFilter = searchParams.filter || "All";
  const filteredCards =
    activeFilter === "All"
      ? communityCards
      : communityCards.filter((card) => card.category === activeFilter);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col gap-10 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Archive
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Community Archive</h1>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-black/10 pb-6">
        {archiveCategories.map((category) => (
          <Link
            key={category.href}
            href={`/archive${category.label === "All" ? "" : `?filter=${category.label}`}`}
            className={`text-sm uppercase tracking-[0.2em] transition-colors ${
              activeFilter === category.label
                ? "text-black font-semibold"
                : "text-black/60 hover:text-black"
            }`}
          >
            {category.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-black/10 bg-white/70 transition-all hover:shadow-lg"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-black/5 to-black/10" />
            <div className="p-6">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">
                {card.category}
              </p>
              <h3 className="mb-2 text-xl font-semibold">{card.title}</h3>
              <p className="text-sm text-black/60">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
