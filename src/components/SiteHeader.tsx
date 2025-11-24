"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SessionUser } from "@/types";
import { LogoutButton } from "./LogoutButton";
import { useState } from "react";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.4em]">
          (C.I.C)
        </Link>
        <nav className="flex items-center gap-8 text-sm text-black/70">
          {siteConfig.nav.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.submenu && setHoveredNav(item.href)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Link href={item.href} className="hover:text-black transition-colors">
                {item.label}
              </Link>
              {item.submenu && hoveredNav === item.href && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-black/10 bg-white shadow-lg py-2">
                  {item.submenu.map((subItem) => (
                    <div key={subItem.href || subItem.label} className="group">
                      <Link
                        href={subItem.href || item.href}
                        className="block px-4 py-2 text-sm hover:bg-black/5 transition-colors"
                      >
                        {subItem.label}
                      </Link>
                      {subItem.submenu && (
                        <div className="hidden group-hover:block absolute left-full top-0 ml-2 w-56 rounded-lg border border-black/10 bg-white shadow-lg py-2">
                          {subItem.submenu.map((subSubItem) => (
                            <Link
                              key={subSubItem}
                              href={`${subItem.href}/${subSubItem.toLowerCase().replace(/\s+/g, "-")}`}
                              className="block px-4 py-2 text-sm hover:bg-black/5 transition-colors"
                            >
                              {subSubItem}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="text-xs text-black/60 hover:text-black transition-colors"
          >
            Cart
          </Link>
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
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}