"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrossfadeLayers } from "@/components/crossfade-layers";
import { useCrossfade } from "@/hooks/use-crossfade";
import type { Photo } from "@/lib/shoots";
import { TEL_HREF } from "@/lib/contact";

/**
 * Default crop for the hero's wide banner.
 *
 * A centred crop of a portrait photo cuts the head off, because the subject
 * sits in the upper third of the frame. 30% biases toward faces without
 * needing every photo tagged by hand — and any photo where that still
 * misses can set its own `objectPosition` in the admin, which this now
 * honours (it previously hardcoded the crop and ignored the field).
 */
const HERO_CROP = "50% 30%";

/**
 * FOCAL POINT — single source of this carousel's object-position.
 * Add the build-time focal-point manifest lookup here (between the
 * per-photo override and the default) when it lands; nothing else in this
 * file reads object-position.
 */
const heroCrop = (photo: Photo) => photo.objectPosition ?? HERO_CROP;

export function HeroCarousel({ photos }: { photos: Photo[] }) {
  // Rotation, decode-ahead, Ken Burns and the memory bound all live in
  // `useCrossfade` — including the reason only two <Image> elements are ever
  // mounted no matter how large this pool gets.
  const { layers, currentIndex } = useCrossfade(photos, { kenBurns: true });

  return (
    <div className="relative flex h-[85vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-background">
      <CrossfadeLayers
        layers={layers}
        sizes="100vw"
        objectPosition={heroCrop}
      />

      <div
        className="absolute inset-0 z-[3]"
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
          Senior, family, nature and custom photography — local to
          Frederick, Colorado, and focused on making you feel comfortable in
          front of the camera. Sessions are free while I build my portfolio.
        </p>
        {/* Book a Session leads, as the filled/primary button. View My Work
            is the secondary. On a phone the primary dials directly; on
            desktop a tel: link is a dead end, so it goes to the contact
            page instead. Both are rendered and swapped by CSS rather than
            by JS, so the correct one is right on first paint. */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="w-full sm:hidden"
            nativeButton={false}
            render={<a href={TEL_HREF} />}
          >
            <Phone className="size-4" aria-hidden="true" />
            Call to Book a Session
          </Button>
          <Button
            size="lg"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            Book a Session
          </Button>
          {/* Solid, not outlined. The rubric caps CTAs at solid fill — an
              outline button over a photograph is the classic AI-site tell,
              and it's also the least legible thing you can put on a frame
              whose brightness changes every five seconds. Secondary reads
              as subordinate to the gold primary without going hollow. */}
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/portfolio" />}
          >
            View My Work
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
                (currentIndex === i ? "w-6 bg-primary" : "w-2 bg-foreground/40")
              }
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}
