"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

/**
 * Structural type — `@/lib/categories` reads the filesystem at load, so a
 * client component can't import from it without pulling `node:fs` into the
 * browser bundle.
 */
export interface SearchableProfile {
  slug: string;
  name: string;
  category: string;
  categoryTitle: string;
  src: string;
  alt: string;
  objectPosition?: string;
  photoCount: number;
}

/**
 * Name search across every profile on the site, at the top of /portfolio.
 *
 * The category sections below are how someone *browses*. This is for the
 * visitor who already knows the name they want — a client Ryan has just
 * handed the link to, looking for their own gallery. That reader should not
 * have to know whether they were filed under Senior or Family, so this
 * searches across all categories at once and says which one each result is
 * in.
 *
 * Results replace the browse view only while there's a query; an empty box
 * leaves the page exactly as it was.
 */
export function PortfolioSearch({
  profiles,
}: {
  profiles: SearchableProfile[];
}) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const matches = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return [];
    return profiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(q) ||
        profile.categoryTitle.toLowerCase().includes(q)
    );
  }, [profiles, trimmed]);

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name"
          aria-label="Search every session by name"
          className="h-12 w-full rounded-full border border-border bg-card pr-4 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </div>

      {trimmed && (
        <div aria-live="polite" className="mt-6">
          {matches.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Nothing matches &ldquo;{trimmed}&rdquo; yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {matches.map((profile) => (
                <li key={`${profile.category}-${profile.slug}`}>
                  <Link
                    href={`/portfolio/${profile.category}/${profile.slug}/`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={profile.src}
                        alt={profile.alt}
                        fill
                        sizes="56px"
                        style={{ objectPosition: profile.objectPosition }}
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">
                        {profile.name}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {profile.categoryTitle} · {profile.photoCount} photo
                        {profile.photoCount === 1 ? "" : "s"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
