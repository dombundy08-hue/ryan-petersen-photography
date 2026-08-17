"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo, PhotoCategory } from "@/lib/shoots";

const INTERVAL_MS = 5000;

/**
 * Default crop for the 21:9 featured tile.
 *
 * This is an extremely wide letterbox, so a centred crop of a portrait
 * photo keeps the torso and loses the head. 30% pulls the visible band up
 * to where faces actually sit. Any photo that still crops badly can set
 * its own `objectPosition` in the admin, which overrides this.
 */
const FEATURE_CROP = "50% 30%";

export interface CategoryFeaturePhoto extends Photo {
  shootSlug: string;
  shootTitle: string;
}

/**
 * The single full-width featured tile that heads each portfolio category.
 * Cycles one representative photo per shoot, so consecutive fades show
 * different people rather than two shots of the same one.
 *
 * The whole tile links to the category directory, not to the shoot
 * currently on screen — see the note on the <Link>.
 *
 * Only the current + outgoing photo are ever mounted — see the note in
 * HeroCarousel for why mounting one <Image> per pool photo (even at
 * opacity-0) risks crashing mobile browsers with `images.unoptimized`.
 */
export function CategoryFeatureTile({
  category,
  photos,
  noun,
  nounPlural,
}: {
  category: PhotoCategory;
  photos: CategoryFeaturePhoto[];
  /** What one entry is called, e.g. "senior", "family", "series". */
  noun: string;
  nounPlural: string;
}) {
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const indexRef = useRef(0);
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
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setPrevIndex(indexRef.current);
      setFadingOut(false);
      setIndex((i) => (i + 1) % photos.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  useEffect(() => {
    if (prevIndex === null) return;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setFadingOut(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [prevIndex]);

  if (photos.length === 0) return null;
  const active = photos[order[index]];
  const previous = prevIndex !== null ? photos[order[prevIndex]] : null;

  return (
    /* Links to the category directory, NOT to whichever shoot happens to
       be on screen. Linking to the active photo meant that picking a
       specific person required waiting for their photo to cycle round —
       the destination changed under the cursor. The tile advertises the
       category; the directory is where you choose. */
    <Link
      href={`/portfolio/${category}`}
      className="group relative flex aspect-[21/9] flex-col justify-end overflow-hidden rounded-xl border border-border"
    >
      <div key={active.src} className="absolute inset-0">
        <Image
          src={active.src}
          alt={active.alt}
          fill
          sizes="100vw"
          style={{ objectPosition: active.objectPosition ?? FEATURE_CROP }}
          /* No hover scale here. Each cycle mounts a NEW element for the
             incoming photo, so with the cursor over the tile it mounted
             already-scaled while the outgoing one sat at 1.0 — a visible
             jump on every swap, which read as random zooming in and out.
             The crossfade is the effect; it doesn't need a second one. */
          className="object-cover"
        />
      </div>
      {previous && (
        <div
          key={previous.src + "-out"}
          className={
            "absolute inset-0 " +
            (reducedMotion
              ? "opacity-0"
              : "transition-opacity duration-1000 ease-in-out " +
                (fadingOut ? "opacity-0" : "opacity-100"))
          }
          aria-hidden="true"
        >
          <Image
            src={previous.src}
            alt=""
            fill
            sizes="100vw"
            style={{ objectPosition: previous.objectPosition ?? FEATURE_CROP }}
            className="object-cover"
          />
        </div>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0) 50%, rgba(16,13,10,0.85) 100%)",
        }}
      />
      {/* The name still labels whoever is on screen, but the call to
          action says where the click actually goes, so the label changing
          mid-cycle never implies the destination changed with it. */}
      <div className="relative p-5">
        <p className="font-medium text-foreground">{active.shootTitle}</p>
        <p className="text-sm text-foreground/70">
          See all {count} {count === 1 ? noun : nounPlural} &rarr;
        </p>
      </div>
    </Link>
  );
}
