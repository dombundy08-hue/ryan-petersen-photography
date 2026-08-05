import Image from "next/image";
import type { Photo } from "@/lib/shoots";

// Simple horizontal rows of photos drifting across the background at
// different speeds/directions — no path or loop shape, just a flow.
const ROW_CONFIG = [
  { duration: 46, reverse: false, rotate: -2, top: "2%" },
  { duration: 60, reverse: true, rotate: 1, top: "27%" },
  { duration: 40, reverse: false, rotate: -1, top: "52%" },
  { duration: 52, reverse: true, rotate: 2, top: "77%" },
];

function chunk<T>(items: T[], parts: number): T[][] {
  const rows: T[][] = Array.from({ length: parts }, () => []);
  items.forEach((item, i) => rows[i % parts].push(item));
  return rows;
}

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
        const track = [...rowPhotos, ...rowPhotos];

        return (
          <div
            key={i}
            className="absolute left-1/2 w-[200%] -translate-x-1/2"
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
