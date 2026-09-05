"use client";

import Image from "next/image";
import type { CrossfadeItem, CrossfadeLayer } from "@/hooks/use-crossfade";

/**
 * The two stacked photo layers driven by `useCrossfade`. Every rotating
 * photo surface on the site renders this — the crossfade mechanism itself
 * lives in the hook, so there is exactly one implementation to fix.
 *
 * Renders a fragment, not a container: each caller owns its own positioned,
 * `overflow-hidden` wrapper (and whatever gradient/text sits above it).
 *
 * The layer `key` is per *slot*, not per photo, on purpose. Keying by src
 * would remount the <img> on every swap and re-decode the image at swap
 * time, which is the whole bug this replaced.
 */
export function CrossfadeLayers<T extends CrossfadeItem>({
  layers,
  sizes,
  objectPosition,
}: {
  layers: CrossfadeLayer<T>[];
  sizes: string;
  /** Resolved by the caller so each surface keeps its own default crop. */
  objectPosition: (item: T) => string | undefined;
}) {
  return (
    <>
      {layers.map((layer) =>
        layer.item ? (
          <div
            key={layer.key}
            className="absolute inset-0 overflow-hidden"
            style={layer.style}
            aria-hidden={layer.isCurrent ? undefined : true}
          >
            <Image
              src={layer.item.src}
              alt={layer.isCurrent ? layer.item.alt : ""}
              fill
              priority={layer.priority}
              sizes={sizes}
              className="object-cover"
              style={{ objectPosition: objectPosition(layer.item) }}
            />
          </div>
        ) : null
      )}
    </>
  );
}
