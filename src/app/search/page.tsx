"use client";

import { useState } from "react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-10 px-6 py-14">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-black/40">
          Search
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Search</h1>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, collections, archive..."
          className="w-full rounded-lg border border-black/10 bg-white px-6 py-4 text-lg focus:border-black focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm text-black/60">
          Search functionality will filter products, collections, and archive
          content based on your query.
        </p>
      </div>
    </div>
  );
}
