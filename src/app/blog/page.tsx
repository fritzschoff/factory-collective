export default function BlogPage() {
  const posts = [
    {
      title: "Editorial",
      category: "Expression",
      description: "Editorial content and stories",
    },
    {
      title: "Body",
      category: "Substance",
      description: "Physical form and materiality",
    },
    {
      title: "Display",
      category: "Function",
      description: "Presentation and exhibition",
    },
    {
      title: "Campaign",
      category: "Expression",
      description: "Marketing and communication campaigns",
    },
  ];

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-12 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Blog
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Editorial Content</h1>
      </div>

      <div className="space-y-8">
        {posts.map((post, index) => (
          <article
            key={index}
            className="group rounded-lg border border-black/10 bg-white/70 p-6 transition-all hover:shadow-lg"
          >
            <div className="mb-2 flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.3em] text-black/40">
                {post.category}
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-semibold">{post.title}</h2>
            <p className="text-black/60">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
