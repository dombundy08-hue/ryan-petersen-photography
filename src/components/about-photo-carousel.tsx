"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/shoots";

const INTERVAL_MS = 5000;

export function AboutPhotoCarousel({ photos }: { photos: Photo[] }) {
  // Same hydration-safe shuffle as HeroCarousel: `order` starts as the
  // identity permutation so SSR and first client paint match exactly, then
  // reshuffles positions 1+ after mount for a fresh rotation per visit.
  // Position 0 stays pinned so the already-painted/priority-loaded photo
  // never swaps out right after mount.
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>(() =>
    photos.map((_, i) => i)
  );
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

  useEffect(() => {
    if (photos.length <= 2) return;
    setOrder((prev) => {
      const [first, ...rest] = prev;
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      return [first, ...rest];
    });
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border">
      {photos.map((photo, i) => {
        const isActive = order[index] === i;
        return (
          <div
            key={photo.src}
            className={
              "absolute inset-0 " +
              (reducedMotion
                ? isActive
                  ? "opacity-100"
                  : "opacity-0"
                : "transition-opacity duration-1000 ease-in-out " +
                  (isActive ? "opacity-100" : "opacity-0"))
            }
            aria-hidden={!isActive}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 90vw, 480px"
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
