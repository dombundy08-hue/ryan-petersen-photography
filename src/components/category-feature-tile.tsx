"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo, PhotoCategory } from "@/lib/shoots";

const INTERVAL_MS = 5000;

export interface CategoryFeaturePhoto extends Photo {
  shootSlug: string;
  shootTitle: string;
}

/**
 * The single full-width featured tile for a category with only one (or a
 * few) shoots — e.g. Family/Nature. Cycles through every photo across the
 * category (not just one shoot), each linking to its own parent shoot.
 * Separate from PhotoCarousel because the caption + href change per photo
 * as it cycles, which that component's fixed-box design doesn't support.
 */
export function CategoryFeatureTile({
  category,
  photos,
}: {
  category: PhotoCategory;
  photos: CategoryFeaturePhoto[];
}) {
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

  if (photos.length === 0) return null;
  const active = photos[order[index]];

  return (
    <Link
      href={`/portfolio/${category}/${active.shootSlug}`}
      className="group relative flex aspect-[21/9] flex-col justify-end overflow-hidden rounded-xl border border-border"
    >
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
              sizes="100vw"
              style={{ objectPosition: photo.objectPosition ?? "50% 50%" }}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        );
      })}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0) 50%, rgba(16,13,10,0.85) 100%)",
        }}
      />
      <div className="relative p-5">
        <p className="font-medium text-foreground">{active.shootTitle}</p>
        <p className="text-sm text-foreground/70">View shoot &rarr;</p>
      </div>
    </Link>
  );
}
