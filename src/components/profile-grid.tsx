"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

/**
 * One card in a category directory.
 *
 * Deliberately a plain structural type rather than an import of
 * `CategoryEntry` from `@/lib/categories` — that module reaches through to
 * `@/lib/shoots`, which reads the filesystem at module load. Importing it
 * from a client component would pull `node:fs` into the browser bundle and
 * fail the build. The server page maps its entries into this shape.
 */
export interface ProfileCard {
  slug: string;
  name: string;
  src: string;
  alt: string;
  objectPosition?: string;
  photoCount: number;
}

export function ProfileGrid({
  cards,
  categorySlug,
  noun,
  nounPlural,
}: {
  cards: ProfileCard[];
  categorySlug: string;
  noun: string;
  nounPlural: string;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((card) => card.name.toLowerCase().includes(q));
  }, [cards, query]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {cards.length} {cards.length === 1 ? noun : nounPlural}
        </p>

        {/* Sized to a name, not to the page. This list grows one shoot at a
            time and is meant to be scrolled; the search is for when you
            already know whose gallery you came for. */}
        <div className="relative w-full sm:w-56">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            aria-label={`Search ${nounPlural} by name`}
            className="h-10 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        </div>
      </div>

      {matches.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No one here matches &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        /* flex-wrap rather than a grid so a partial last row centres itself
           instead of hanging off to the left — with two or three sessions in
           a category, a four-column grid leaves an obvious hole. Four across
           is the ceiling at every width. */
        <div className="flex flex-wrap justify-center gap-4">
          {matches.map((card) => (
            <Link
              key={card.slug}
              href={`/portfolio/${categorySlug}/${card.slug}`}
              className="group relative flex aspect-[4/5] basis-[calc(50%-0.5rem)] flex-col justify-end overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:basis-[calc(33.333%-0.667rem)] lg:basis-[calc(25%-0.75rem)]"
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectPosition: card.objectPosition ?? "50% 35%" }}
                /* Brightness, not a zoom — the rubric rules out zoom-on-hover
                   as the default image transition, and on a portrait card a
                   scale nudges the face out of the crop it was centred in. */
                className="object-cover brightness-[0.92] transition-[filter] duration-500 group-hover:brightness-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 55%, var(--scrim) 100%)",
                }}
              />
              <div className="relative p-3">
                <p className="text-sm font-medium text-foreground">
                  {card.name}
                </p>
                <p className="text-xs text-foreground/70">
                  {card.photoCount} photo{card.photoCount === 1 ? "" : "s"}
                  {" · "}View gallery &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
