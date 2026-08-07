"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/shoots";

const INTERVAL_MS = 5000;

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
  // Hydration-safe shuffle (same pattern as HeroCarousel): `order` starts
  // as the identity permutation so SSR and first client paint match
  // exactly, then reshuffles positions 1+ after mount for a fresh
  // rotation per visit. Position 0 stays pinned so the already-painted/
  // priority-loaded photo never swaps out right after mount.
  const [index, setIndex] = useState(0);
  // Only the current + outgoing photo are ever mounted — see the note in
  // HeroCarousel for why mounting one <Image> per pool photo (even at
  // opacity-0) risks crashing mobile browsers with `images.unoptimized`.
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

  const currentPhoto = photos.length > 0 ? photos[order[index]] : null;
  const previousPhoto = prevIndex !== null ? photos[order[prevIndex]] : null;

  return (
    <div className={className}>
      {currentPhoto && (
        <div key={currentPhoto.src} className="absolute inset-0">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            fill
            priority={priorityFirst && prevIndex === null}
            sizes={sizes}
            className="object-cover object-[50%_25%]"
          />
        </div>
      )}
      {previousPhoto && (
        <div
          key={previousPhoto.src + "-out"}
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
            src={previousPhoto.src}
            alt=""
            fill
            sizes={sizes}
            className="object-cover object-[50%_25%]"
          />
        </div>
      )}
    </div>
  );
}
