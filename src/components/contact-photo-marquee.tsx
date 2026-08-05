import Image from "next/image";
import type { Photo } from "@/lib/shoots";

// Simple straight horizontal rows of photos drifting across the
// background at different speeds — no rotation, no path, no loop shape.
// Spread evenly across the full page height, not just the top portion.
const ROW_CONFIG = [
  { duration: 46, reverse: false, rotate: 0, top: "0%" },
  { duration: 60, reverse: true, rotate: 0, top: "19%" },
  { duration: 40, reverse: false, rotate: 0, top: "38%" },
  { duration: 52, reverse: true, rotate: 0, top: "57%" },
  { duration: 44, reverse: false, rotate: 0, top: "76%" },
  { duration: 58, reverse: true, rotate: 0, top: "95%" },
];

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
  if (photos.length === 0) return null;

  const rows = chunk(photos, ROW_CONFIG.length);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-40"
      aria-hidden="true"
    >
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
              className="animate-marquee-flow flex w-max gap-4"
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
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-md sm:h-24 sm:w-24"
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
