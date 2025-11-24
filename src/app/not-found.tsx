import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-8 px-6 py-14 text-center">
      <h1 className="text-6xl font-light md:text-8xl">404</h1>
      <p className="text-xl text-black/60">Page not found</p>
      <Link
        href="/"
        className="rounded-full border border-black/20 bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
      >
        Return Home
      </Link>
    </div>
  );
}
