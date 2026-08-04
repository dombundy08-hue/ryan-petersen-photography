"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/lib/photos";

const INTERVAL_MS = 5000;

export function HeroCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
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
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <div className="relative flex h-[85vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-background">
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className={
            "absolute inset-0 " +
            (reducedMotion
              ? i === index
                ? "opacity-100"
                : "opacity-0"
              : "transition-opacity duration-1000 ease-in-out " +
                (i === index ? "opacity-100" : "opacity-0"))
          }
          aria-hidden={i !== index}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover motion-safe:animate-[kenburns_9s_ease-out_forwards]"
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0.45) 0%, rgba(16,13,10,0.15) 40%, rgba(16,13,10,0.9) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-black/20 px-3 py-1 text-xs font-medium tracking-wide text-primary backdrop-blur-sm">
          Senior &middot; Family &middot; Nature Photography
        </span>
        <h1 className="mt-6 font-heading text-4xl font-medium italic tracking-tight text-foreground sm:text-6xl md:text-7xl">
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
                (i === index ? "w-6 bg-primary" : "w-2 bg-foreground/40")
              }
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}
