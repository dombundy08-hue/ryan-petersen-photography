"use client";

import Link from "next/link";
import { useCrossfade, CROSSFADE_INTERVAL_MS } from "@/hooks/use-crossfade";
import { CrossfadeLayers } from "@/components/crossfade-layers";

/**
 * A category's section on /portfolio: several small shuffling photos.
 *
 * This replaces a single 21:9 banner per category. Two reasons it's better
 * here: a portrait photograph put through a 21:9 crop shows a horizontal
 * slice of a person, and one big image can only ever advertise one session
 * at a time. Four portrait tiles show four different people at once and
 * crop the way the photos were actually shot.
 *
 * Structural type rather than importing CategoryTeaserTile from
 * `@/lib/categories` — that module reads the filesystem at load, so pulling
 * it into a client component would drag `node:fs` into the browser bundle.
 */
export interface TeaserTile {
  key: string;
  slug: string;
  name: string;
  photos: { src: string; alt: string; objectPosition?: string }[];
}

/**
 * Each tile owns its own crossfade, which is why this is a component rather
 * than a loop — hooks can't be called per-iteration.
 *
 * The interval is nudged per tile so a row of them never swaps on the same
 * beat. In lockstep the grid reads as one machine ticking; a few hundred
 * milliseconds apart it reads as photographs shuffling, which is the ask.
 */
function Tile({
  tile,
  categorySlug,
  index,
  priority,
}: {
  tile: TeaserTile;
  categorySlug: string;
  index: number;
  priority: boolean;
}) {
  const { layers } = useCrossfade(tile.photos, {
    priorityFirst: priority,
    intervalMs: CROSSFADE_INTERVAL_MS + index * 900,
  });

  return (
    <Link
      /* Shoot pages live at /portfolio/<category>/<shoot> — the category
         segment is not optional. Linking to /portfolio/<shoot> produced
         four 404s per section, which the build audit caught. */
      href={`/portfolio/${categorySlug}/${tile.slug}`}
      aria-label={`View ${tile.name}'s gallery`}
      className="group relative aspect-[4/5] basis-[calc(50%-0.5rem)] overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:basis-[calc(25%-0.75rem)]"
    >
      <CrossfadeLayers
        layers={layers}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        objectPosition={(photo) => photo.objectPosition}
      />
      {/* Nothing but a soft floor so the tiles sit as a set rather than as
          four bright rectangles. Names live on the directory page — these
          are a teaser, and captioning four of them turns a photo wall into
          a list. */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] transition-opacity duration-500 group-hover:opacity-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0) 60%, rgba(16,13,10,0.55) 100%)",
        }}
      />
    </Link>
  );
}

export function CategoryTeaserGrid({
  tiles,
  categorySlug,
  priority = false,
}: {
  tiles: TeaserTile[];
  /** The category segment of each tile's URL. */
  categorySlug: string;
  /** True for the first category on the page — its tiles are the LCP. */
  priority?: boolean;
}) {
  if (tiles.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {tiles.map((tile, i) => (
        <Tile
          key={tile.key}
          tile={tile}
          categorySlug={categorySlug}
          index={i}
          /* Only the very first tile of the first section preloads. Four
             priority images would preload four photos at once and trade
             one LCP problem for another. */
          priority={priority && i === 0}
        />
      ))}
    </div>
  );
}
