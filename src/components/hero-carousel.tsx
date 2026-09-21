"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Pause, Phone, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroPhoto } from "@/lib/shoots";
import { TEL_HREF } from "@/lib/contact";

/** How fast the strip slides left. Slow enough to take a photo in. */
const SPEED_PX_PER_S = 40;
/** Keep this much strip queued past the right edge so nothing pops in on screen. */
const RIGHT_BUFFER_PX = 400;

interface Entry {
  id: number;
  photo: HeroPhoto;
  /** Queued on the client after load — fades in rather than appearing. */
  fresh: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/**
 * Endless random picks from the pool: a shuffled bag that is emptied before it
 * is reshuffled, so every photo comes round once per cycle, and one that is
 * already on screen is skipped whenever the pool is big enough to allow it.
 */
function createPicker(photos: HeroPhoto[]) {
  let bag: HeroPhoto[] = [];
  return (onScreen: Set<string>): HeroPhoto => {
    if (bag.length === 0) bag = shuffle(photos);
    if (photos.length > onScreen.size) {
      for (let tries = bag.length; tries > 0 && onScreen.has(bag[bag.length - 1].src); tries--) {
        bag.unshift(bag.pop()!);
      }
    }
    return bag.pop()!;
  };
}

const ratioOf = (photo: HeroPhoto) =>
  Math.round((photo.width / photo.height) * 10000) / 10000;

/**
 * The hero: a filmstrip of whole photographs, edge to edge, sliding left.
 *
 * Every slot is exactly as tall as the hero and as wide as its photo's own
 * aspect ratio, so nothing is cropped — no face can be cut off, whatever the
 * screen. Photos touch with no gap. Each slot is a random pick from the
 * portfolio pool (`heroPhotos`), so the strip differs on every visit and grows
 * with the portfolio; the first photo is the one baked into the page so it
 * paints before any script runs.
 *
 * The strip moves by a transform written straight to the DOM each frame (no
 * React render per frame). React re-renders only when a photo has fully left
 * the screen — it is dropped from the front and a new random one is queued at
 * the back — so only a handful of <img> elements are ever mounted however big
 * the portfolio gets (see use-crossfade for why that matters on phones).
 */
export function HeroCarousel({ photos }: { photos: HeroPhoto[] }) {
  const [queue, setQueue] = useState<Entry[]>(() =>
    photos.slice(0, 1).map((photo, i) => ({ id: i, photo, fresh: false }))
  );
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const nextId = useRef(1);
  const pausedRef = useRef(false);
  const pickRef = useRef<ReturnType<typeof createPicker> | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /**
   * Drop the front photo once it is fully past the left edge, and queue a new
   * random one at the back whenever the strip is shorter than the screen plus a
   * buffer. `commit` lets the animation loop apply the change synchronously so
   * the offset reset and the DOM change land in the same frame — otherwise the
   * strip would jump back for one frame.
   */
  const rebalance = useCallback(
    (commit: (update: () => void) => void) => {
      const track = trackRef.current;
      const view = viewRef.current;
      if (!track || !view || photos.length === 0) return;
      pickRef.current ??= createPicker(photos);

      const first = track.firstElementChild as HTMLElement | null;
      const firstWidth = first ? first.getBoundingClientRect().width : 0;
      const drop = first !== null && track.childElementCount > 1 && offsetRef.current >= firstWidth;
      const offset = drop ? offsetRef.current - firstWidth : offsetRef.current;
      const length = track.getBoundingClientRect().width - (drop ? firstWidth : 0);
      const grow = length - offset < view.clientWidth + RIGHT_BUFFER_PX;
      if (!drop && !grow) return;

      offsetRef.current = offset;
      commit(() => {
        setQueue((current) => {
          const kept = drop ? current.slice(1) : current;
          if (!grow) return kept;
          const photo = pickRef.current!(new Set(kept.map((entry) => entry.photo.src)));
          return [...kept, { id: nextId.current++, photo, fresh: true }];
        });
      });
    },
    [photos]
  );

  // Reduced motion: the strip stands still, so all that's left to do is fill
  // the screen with photos — once on mount and again on every resize.
  useEffect(() => {
    const view = viewRef.current;
    if (!reducedMotion || !view) return;
    const fill = () => rebalance((update) => update());
    fill();
    const observer = new ResizeObserver(fill);
    observer.observe(view);
    return () => observer.disconnect();
  }, [rebalance, reducedMotion, queue.length]);

  useEffect(() => {
    if (reducedMotion) {
      offsetRef.current = 0;
      if (trackRef.current) trackRef.current.style.transform = "";
      return;
    }
    let raf = 0;
    let last = 0;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const track = trackRef.current;
      if (!track) return;
      const dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      if (!pausedRef.current) offsetRef.current += (SPEED_PX_PER_S * dt) / 1000;
      rebalance((update) => flushSync(update));
      track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [rebalance, reducedMotion]);

  return (
    <div
      ref={viewRef}
      className="relative w-full overflow-hidden bg-background"
      style={
        {
          // One height for the strip, every slot and the `sizes` hints below.
          "--hero-h": "max(85vh, 560px)",
          height: "var(--hero-h)",
        } as CSSProperties
      }
    >
      <div ref={trackRef} className="absolute top-0 left-0 flex w-max will-change-transform">
        {queue.map(({ id, photo, fresh }) => {
          const ratio = ratioOf(photo);
          return (
            <div
              key={id}
              className={"relative flex-none" + (fresh ? " animate-in fade-in duration-700" : "")}
              style={{
                height: "var(--hero-h)",
                width: `calc(var(--hero-h) * ${ratio})`,
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={id === 0}
                sizes={`calc(max(85vh, 560px) * ${ratio})`}
                className="object-contain"
              />
            </div>
          );
        })}
      </div>

      <div
        className="absolute inset-0 z-[3]"
        /* Heavier than a card's floor: this one carries the H1 and both
           CTAs over a photograph whose brightness changes as the strip
           slides, so it has to hold the worst frame in the rotation, not
           the average one. */
        style={{
          background:
            "linear-gradient(180deg, var(--scrim-soft) 0%, var(--scrim-faint) 40%, var(--scrim) 100%)",
        }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-heading text-4xl font-medium italic tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Creating memorable moments, one photo at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-foreground/80 sm:text-lg">
            Senior, family, nature and custom photography — local to
            Frederick, Colorado, and focused on making you feel comfortable in
            front of the camera.
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
                whose brightness keeps changing. Secondary reads as
                subordinate to the gold primary without going hollow. */}
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
      </div>

      {!reducedMotion && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-4 bottom-4 z-10"
          aria-label={paused ? "Play the photo slideshow" : "Pause the photo slideshow"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? (
            <Play className="size-4" aria-hidden="true" />
          ) : (
            <Pause className="size-4" aria-hidden="true" />
          )}
        </Button>
      )}
    </div>
  );
}
