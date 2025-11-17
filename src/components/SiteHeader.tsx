import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SessionUser } from "@/types";
import { LogoutButton } from "./LogoutButton";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.4em]">
          Factory Collective
        </Link>
        <nav className="flex items-center gap-6 text-sm text-black/70">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-black/60">
                {user.displayName ?? user.email ?? user.uid}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
