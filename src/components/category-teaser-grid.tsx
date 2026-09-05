"use client";

import Link from "next/link";
import { useCrossfade, CROSSFADE_INTERVAL_MS } from "@/hooks/use-crossfade";
import { CrossfadeLayers } from "@/components/crossfade-layers";

/**
 * A category's section on /portfolio: four small tiles, each shuffling
 * through everyone in that category, captioned with whoever is currently
 * showing.
 *
 * Structural type rather than importing from `@/lib/categories` — that
 * module reads the filesystem at load, so pulling it into a client
 * component would drag `node:fs` into the browser bundle.
 */
export interface TeaserPhoto {
  src: string;
  alt: string;
  objectPosition?: string;
  name: string;
}

export interface TeaserTile {
  key: string;
  photos: TeaserPhoto[];
}

/**
 * Each tile owns its own crossfade, which is why this is a component rather
 * than a loop — hooks can't be called per-iteration.
 *
 * The interval is nudged per tile so a row of them never swaps on the same
 * beat. In lockstep the grid reads as one machine ticking; a few hundred
 * milliseconds apart it reads as photographs shuffling.
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
  const { layers, current } = useCrossfade(tile.photos, {
    priorityFirst: priority,
    intervalMs: CROSSFADE_INTERVAL_MS + index * 900,
  });

  return (
    <Link
      /* Goes to the category's directory, NOT to the gallery of whoever is
         on screen. The tile changes every few seconds, so a link that
         followed it would mean reaching a particular person depended on
         catching their photo as it came round. The directory lists everyone
         by name and lets the reader choose. */
      href={`/portfolio/${categorySlug}/`}
      className="group relative aspect-[4/5] basis-[calc(50%-0.5rem)] overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:basis-[calc(25%-0.75rem)]"
    >
      <CrossfadeLayers
        layers={layers}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        objectPosition={(photo) => photo.objectPosition}
      />

      {/* Floor gradient so the caption always has something to sit on,
          whatever the photo underneath is doing. */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(180deg, transparent 45%, var(--scrim) 100%)",
        }}
      />

      {current && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3">
          {/* Keyed on the name so a change remounts the span and replays the
              fade — the caption arrives with its photo instead of snapping
              a second before it. Only re-fades when the NAME changes, not on
              every photo, so a run of frames from one session reads as one
              person rather than a flickering label. */}
          <span
            key={current.name}
            className="animate-in fade-in block text-sm font-medium text-foreground duration-700"
          >
            {current.name}
          </span>
        </div>
      )}
    </Link>
  );
}

export function CategoryTeaserGrid({
  tiles,
  categorySlug,
  priority = false,
}: {
  tiles: TeaserTile[];
  /** The directory every tile in this section links to. */
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
