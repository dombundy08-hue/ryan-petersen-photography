"use client";

import Link from "next/link";
import { CrossfadeLayers } from "@/components/crossfade-layers";
import { useCrossfade } from "@/hooks/use-crossfade";
import type { Photo, PhotoCategory } from "@/lib/shoots";

/**
 * Default crop for the 21:9 featured tile.
 *
 * This is an extremely wide letterbox, so a centred crop of a portrait
 * photo keeps the torso and loses the head. 30% pulls the visible band up
 * to where faces actually sit. Any photo that still crops badly can set
 * its own `objectPosition` in the admin, which overrides this.
 */
const FEATURE_CROP = "50% 30%";

export interface CategoryFeaturePhoto extends Photo {
  shootSlug: string;
  shootTitle: string;
}

/**
 * FOCAL POINT — single source of this tile's object-position.
 * Add the build-time focal-point manifest lookup here (between the
 * per-photo override and the default) when it lands; nothing else in this
 * file reads object-position.
 */
const featureCrop = (photo: CategoryFeaturePhoto) =>
  photo.objectPosition ?? FEATURE_CROP;

/**
 * The single full-width featured tile that heads each portfolio category.
 * Cycles one representative photo per shoot, so consecutive fades show
 * different people rather than two shots of the same one.
 *
 * The whole tile links to the category directory, not to the shoot
 * currently on screen — see the note on the <Link>.
 *
 * Rotation, decode-ahead and the two-slot memory bound live in
 * `useCrossfade` — including why only two <Image> elements are ever mounted
 * regardless of pool size.
 *
 * No hover/zoom effect on the photo itself: the crossfade is the effect, and
 * a second one on top used to read as random zooming in and out on swap.
 */
export function CategoryFeatureTile({
  category,
  photos,
  noun,
  nounPlural,
  priority = false,
}: {
  category: PhotoCategory;
  photos: CategoryFeaturePhoto[];
  /** What one entry is called, e.g. "senior", "family", "series". */
  noun: string;
  nounPlural: string;
  /**
   * Set on the FIRST tile on a page only. Several of these render down
   * /portfolio and marking them all priority would preload four 21:9
   * photos at once — but the first one is above the fold and is the page's
   * Largest Contentful Paint element, so leaving it lazy costs seconds.
   * It measured LCP 6.0s and Lighthouse Performance 66 before this.
   */
  priority?: boolean;
}) {
  const count = photos.length;
  const { layers, current } = useCrossfade(photos, { priorityFirst: priority });

  if (count === 0) return null;

  return (
    /* Links to the category directory, NOT to whichever shoot happens to
       be on screen. Linking to the active photo meant that picking a
       specific person required waiting for their photo to cycle round —
       the destination changed under the cursor. The tile advertises the
       category; the directory is where you choose. */
    <Link
      href={`/portfolio/${category}`}
      className="group relative flex aspect-[21/9] flex-col justify-end overflow-hidden rounded-xl border border-border"
    >
      <CrossfadeLayers
        layers={layers}
        /* The tile is full-width only until the Section's max-w-6xl
           (1152px) takes over. Saying 100vw past that made a 1440px screen
           fetch the 1920px file to paint 1152px of tile. */
        sizes="(max-width: 1200px) 100vw, 1152px"
        objectPosition={featureCrop}
      />
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0) 50%, rgba(16,13,10,0.85) 100%)",
        }}
      />
      {/* The name still labels whoever is on screen, but the call to
          action says where the click actually goes, so the label changing
          mid-cycle never implies the destination changed with it. */}
      <div className="relative z-10 p-5">
        <p className="font-medium text-foreground">{current?.shootTitle}</p>
        <p className="text-sm text-foreground/70">
          See all {count} {count === 1 ? noun : nounPlural} &rarr;
        </p>
      </div>
    </Link>
  );
}
