"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import type { Photo } from "@/lib/shoots";

// A wide wave with an actual loop-the-loop dropped into the middle —
// two 90-radius arcs from (700,420) back to (520,420) and back again
// trace a full circle, so the path visibly loops before continuing.
const PATH =
  "M -100 450 " +
  "C 150 250, 350 650, 600 450 " +
  "C 650 420, 680 420, 700 420 " +
  "A 90 90 0 1 1 520 420 " +
  "A 90 90 0 1 1 700 420 " +
  "C 750 460, 850 500, 900 450 " +
  "C 1100 250, 1300 650, 1550 450 " +
  "C 1700 380, 1850 420, 2000 450";

export function ContactPhotoMarquee({ photos }: { photos: Photo[] }) {
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (photos.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-50"
      aria-hidden="true"
    >
      <MarqueeAlongSvgPath
        path={PATH}
        viewBox="0 0 1900 900"
        baseVelocity={reducedMotion ? 0 : 4}
        repeat={1}
        responsive
        className="h-full w-full scale-110"
      >
        {photos.map((photo, i) => (
          <div
            key={photo.src + i}
            className="h-24 w-20 overflow-hidden rounded-lg sm:h-32 sm:w-28"
          >
            <Image
              src={photo.src}
              alt=""
              width={160}
              height={200}
              className="h-full w-full object-cover brightness-110 saturate-110"
            />
          </div>
        ))}
      </MarqueeAlongSvgPath>
    </div>
  );
}
