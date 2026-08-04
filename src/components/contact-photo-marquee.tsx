"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import type { Photo } from "@/lib/shoots";

const PATH =
  "M -100 380 C 150 100, 350 620, 600 380 S 1050 100, 1300 380 S 1750 660, 2000 380";

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
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-25"
      aria-hidden="true"
    >
      <MarqueeAlongSvgPath
        path={PATH}
        viewBox="0 0 1900 760"
        baseVelocity={reducedMotion ? 0 : 4}
        repeat={2}
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
              className="h-full w-full object-cover grayscale"
            />
          </div>
        ))}
      </MarqueeAlongSvgPath>
    </div>
  );
}
