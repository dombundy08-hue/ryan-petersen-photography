"use client";

import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import { useCrossfade, CROSSFADE_INTERVAL_MS } from "@/hooks/use-crossfade";
import { CrossfadeLayers } from "@/components/crossfade-layers";

/**
 * One "What I shoot" tile on the home page. It slowly crossfades through
 * photos from its category — the same engine and pace as the tiles on
 * /portfolio — so the section keeps changing as sessions are added.
 *
 * Structural type rather than importing from `@/lib/shoots`: that module reads
 * the filesystem at load, so a value import here would pull `node:fs` into the
 * browser bundle.
 */
export interface SpecialtyPhoto {
  src: string;
  alt: string;
  objectPosition?: string;
}

export function SpecialtyTile({
  title,
  description,
  href,
  photos,
  index,
}: {
  title: string;
  description: string;
  href: string;
  photos: SpecialtyPhoto[];
  index: number;
}) {
  // Offset per tile so the row of four never swaps on the same beat — in
  // lockstep it reads as one machine ticking, not photographs shuffling.
  const { layers } = useCrossfade(photos, {
    priorityFirst: false,
    intervalMs: CROSSFADE_INTERVAL_MS + index * 900,
  });
  const hasPhotos = photos.length > 0;

  return (
    <Link
      href={href}
      className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-xl border border-border bg-secondary"
    >
      {hasPhotos ? (
        <div className="absolute inset-0 brightness-[0.92] transition-[filter] duration-500 group-hover:brightness-105">
          <CrossfadeLayers
            layers={layers}
            sizes="(max-width: 640px) 100vw, 33vw"
            objectPosition={(photo) => photo.objectPosition ?? "50% 35%"}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera
            className="size-10 text-foreground/20"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      )}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, var(--scrim) 100%)",
        }}
      />
      <div className="relative z-10 p-6">
        <h3 className="font-heading text-xl font-medium text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-sm text-foreground/75">{description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {hasPhotos ? "See the gallery" : "Coming soon"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
