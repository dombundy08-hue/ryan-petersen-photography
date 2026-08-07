"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/lib/shoots";

const INTERVAL_MS = 5000;

export function HeroCarousel({ photos }: { photos: Photo[] }) {
  // `index` is a position within `order`, not within `photos` — the dot
  // indicators below track every position, but only the current photo and
  // the one it's fading out from are ever mounted as an <Image> (see the
  // memory note below). `order` starts as the identity permutation so SSR
  // and the first client paint match exactly, then a one-time effect
  // reshuffles positions 1+ after mount for a fresh random rotation on
  // every visit. Position 0 stays pinned so the photo already painted (and
  // already priority-loaded) never swaps out right after mount.
  const [index, setIndex] = useState(0);
  // Position (in `order`) of the photo fading out, or null before the
  // first transition. Deliberately NOT one <Image> per photo — with
  // `images.unoptimized: true` (required for static export) every <Image>
  // decodes its full-resolution source regardless of display size, and a
  // site-wide pool this size can run 1GB+ of simultaneous decoded bitmap
  // data if every photo stays mounted — enough to crash the tab on mobile
  // Safari/Chrome (page flashes in, then goes blank). Only ever mounting
  // the current + outgoing photo bounds that to ~2 photos regardless of
  // pool size.
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

  // The outgoing layer needs to mount at full opacity first, then flip to
  // 0 a frame later — a freshly mounted element can't CSS-transition from
  // a state it was never rendered at.
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
    <div className="relative flex h-[85vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-background">
      {currentPhoto && (
        <div key={currentPhoto.src} className="absolute inset-0">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            fill
            priority={prevIndex === null}
            sizes="100vw"
            className="object-cover object-[50%_25%] motion-safe:animate-[kenburns_9s_ease-out_forwards]"
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
            sizes="100vw"
            className="object-cover object-[50%_25%]"
          />
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0.45) 0%, rgba(16,13,10,0.15) 40%, rgba(16,13,10,0.9) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="font-heading text-4xl font-medium italic tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Creating memorable moments, one photo at a time.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-foreground/80 sm:text-lg">
          Honest, local photography focused on making you feel comfortable in
          front of the camera.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/portfolio" />}>
            View My Work
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-foreground/40 bg-black/10 text-foreground backdrop-blur-sm hover:bg-black/30"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            Book a Session
          </Button>
        </div>
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {photos.map((photo, i) => (
            <span
              key={photo.src}
              className={
                "h-1 rounded-full transition-all duration-500 " +
                (order[index] === i ? "w-6 bg-primary" : "w-2 bg-foreground/40")
              }
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}
