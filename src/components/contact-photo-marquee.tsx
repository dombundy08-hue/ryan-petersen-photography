"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/shoots";

// Simple straight horizontal rows of photos drifting across the
// background at different speeds — no rotation, no path, no loop shape.
// Spread far apart across the full page height so rows read as calm,
// independent bands instead of a dense, disorienting wall of motion.
const ROW_CONFIG = [
  { duration: 46, reverse: false, rotate: 0, top: "0%" },
  { duration: 60, reverse: true, rotate: 0, top: "33%" },
  { duration: 40, reverse: false, rotate: 0, top: "66%" },
  { duration: 52, reverse: true, rotate: 0, top: "92%" },
];

const POOL_SIZE = 48;

function chunk<T>(items: T[], parts: number): T[][] {
  const rows: T[][] = Array.from({ length: parts }, () => []);
  items.forEach((item, i) => rows[i % parts].push(item));
  return rows;
}

// How many times a row's unique photo set repeats before the loop-closing
// duplicate — needs to be wide enough that one copy alone spans past the
// widest expected viewport, or the track runs out of photos before it
// reaches the right edge and the animation just loops within a narrow
// band on the left.
const REPEAT = 4;

export function ContactPhotoMarquee({ photos }: { photos: Photo[] }) {
  // `pool` starts as the first POOL_SIZE photos in their original order so
  // SSR and the first client paint match exactly (avoids hydration
  // mismatches), then a one-time effect reshuffles the full photo library
  // client-side after mount for a fresh random selection on every visit —
  // same idiom as `HeroCarousel`.
  const [pool, setPool] = useState(() => photos.slice(0, POOL_SIZE));

  useEffect(() => {
    if (photos.length === 0) return;
    const shuffled = [...photos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPool(shuffled.slice(0, POOL_SIZE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  if (pool.length === 0) return null;

  const rows = chunk(pool, ROW_CONFIG.length);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-50"
      aria-hidden="true"
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-primary/10 via-transparent to-primary/10" />
      {rows.map((rowPhotos, i) => {
        if (rowPhotos.length === 0) return null;
        const config = ROW_CONFIG[i];
        const half = Array.from({ length: REPEAT }, () => rowPhotos).flat();
        const track = [...half, ...half];

        return (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{ top: config.top, transform: `rotate(${config.rotate}deg)` }}
          >
            <div
              className="animate-marquee-flow flex w-max gap-8"
              style={
                {
                  "--marquee-duration": `${config.duration}s`,
                  "--marquee-direction": config.reverse ? "reverse" : "normal",
                } as React.CSSProperties
              }
            >
              {track.map((photo, j) => (
                <div
                  key={photo.src + j}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-28"
                >
                  <Image
                    src={photo.src}
                    alt=""
                    width={192}
                    height={192}
                    className="h-full w-full object-cover brightness-110 saturate-110"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
