"use client";

import { CrossfadeLayers } from "@/components/crossfade-layers";
import { useCrossfade } from "@/hooks/use-crossfade";
import type { Photo } from "@/lib/shoots";

/**
 * Default crop for this carousel's tall portrait frame. Faces sit above
 * centre, so a straight centred crop takes the chin off.
 */
const DEFAULT_CROP = "50% 25%";

/**
 * FOCAL POINT — single source of this carousel's object-position.
 * Add the build-time focal-point manifest lookup here (between the
 * per-photo override and the default) when it lands; nothing else in this
 * file reads object-position.
 */
const carouselCrop = (photo: Photo) => photo.objectPosition ?? DEFAULT_CROP;

export function PhotoCarousel({
  photos,
  className,
  sizes,
  priorityFirst = true,
}: {
  photos: Photo[];
  className: string;
  sizes: string;
  priorityFirst?: boolean;
}) {
  // Rotation, decode-ahead and the two-slot memory bound live in
  // `useCrossfade`. No Ken Burns here — this frame is small and static.
  const { layers } = useCrossfade(photos, { priorityFirst });

  return (
    <div className={className}>
      <CrossfadeLayers
        layers={layers}
        sizes={sizes}
        objectPosition={carouselCrop}
      />
    </div>
  );
}
