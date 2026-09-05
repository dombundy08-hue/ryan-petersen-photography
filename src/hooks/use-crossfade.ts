"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/** How long a photo sits fully settled before the next one starts arriving. */
export const CROSSFADE_INTERVAL_MS = 5000;
/** How long the incoming photo takes to fade in on top of the outgoing one. */
export const CROSSFADE_FADE_MS = 1000;
/**
 * A photo's total time on screen: it fades in, holds, then is covered by the
 * next one fading in over it. The Ken Burns transform is stretched across
 * exactly this window so it can never be cut off and restarted mid-flight
 * (the old bug: a 9s `@keyframes kenburns` on a 5s swap cycle, killed and
 * restarted from `scale(1)` every cycle — the visible "jump").
 */
export const CROSSFADE_LIFETIME_MS =
  CROSSFADE_INTERVAL_MS + 2 * CROSSFADE_FADE_MS;
/**
 * If an image is slow (bad connection, cold cache) we swap anyway rather
 * than stalling the rotation forever. The outgoing layer stays painted the
 * whole time regardless, so the worst case is a late swap, never a flash.
 */
const DECODE_TIMEOUT_MS = 2500;
const KEN_BURNS_SCALE = 1.08;

type Slot = 0 | 1;
type Phase = "idle" | "staged" | "entering";

export interface CrossfadeItem {
  src: string;
  alt: string;
}

export interface CrossfadeLayer<T extends CrossfadeItem> {
  /** Stable per slot — the <img> element is reused, never remounted. */
  key: string;
  item: T | null;
  /** True for the photo the viewer is looking at (or fading in to). */
  isCurrent: boolean;
  priority: boolean;
  style: CSSProperties;
}

export interface CrossfadeOptions {
  /** Slow zoom on the visible layer. Off by default. */
  kenBurns?: boolean;
  /** Whether the very first photo should load with priority. */
  priorityFirst?: boolean;
  /**
   * How long each photo holds before the next one starts fading in.
   * Defaults to CROSSFADE_INTERVAL_MS.
   *
   * The reason this is adjustable: a grid of these side by side all
   * swapping on the same beat reads as one machine ticking, not as several
   * photos shuffling. Giving each tile a slightly different interval keeps
   * them permanently out of phase.
   */
  intervalMs?: number;
}

export interface CrossfadeResult<T extends CrossfadeItem> {
  /** Exactly two entries — see the memory note below. Render both. */
  layers: CrossfadeLayer<T>[];
  /** The photo currently on screen (or fading in), for labels/indicators. */
  current: T | null;
  /** Its index in the original `items` array, for dot indicators. */
  currentIndex: number;
}

/**
 * Decode `src` off-screen and resolve once it is ready to paint — or on
 * error, or after `timeoutMs`, whichever comes first. Never rejects: an
 * unhandled `decode()` rejection (it rejects on a broken image) must not
 * break the page, and a broken photo should not freeze the rotation.
 *
 * The detached element is dropped as soon as this resolves; what survives
 * is the browser's cached decode, which is what makes the subsequent swap
 * paint in the same frame.
 */
function decodeAhead(src: string, timeoutMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
    if (typeof img.decode === "function") {
      img.decode().then(finish, finish);
    } else {
      img.onload = finish;
      img.onerror = finish;
    }
  });
}

/**
 * Shared crossfade engine for every rotating-photo component on the site.
 *
 * ## Memory bound (do not "improve" this by preloading more)
 * `images.unoptimized: true` is required for static export, so every mounted
 * `<Image>` decodes its full-resolution source (~2400x1600) regardless of
 * display size. On 2026-08-05 these carousels mounted one `<Image>` per
 * photo in the pool and the hero's ~75-photo pool held 1GB+ of decoded
 * bitmap — mobile Safari/Chrome killed the tab and the page went blank.
 *
 * This hook holds exactly **two** mounted `<img>` elements (two fixed slots,
 * ping-ponged) plus **one** transient detached decode for the next photo:
 * three decoded bitmaps at the absolute peak, independent of pool size.
 *
 * ## One swap, frame by frame
 * 1. `idle` — front slot opaque, back slot opacity 0 holding the last photo.
 * 2. Interval fires; the *next* photo is decoded off-screen. Nothing on
 *    screen changes yet — the front layer stays fully painted.
 * 3. `staged` — the decoded photo is assigned to the back slot at opacity 0,
 *    underneath. Two rAFs pass so the browser has a from-state to animate
 *    from (a freshly styled element can't transition from a value it was
 *    never rendered at).
 * 4. `entering` — the back slot is raised above the front and fades 0 -> 1.
 *    The front layer never fades out; it just gets covered. There is
 *    therefore no frame where neither layer is opaque, which is what used to
 *    expose the `bg-background` (#100D0A) underneath as a "flash to black".
 * 5. Commit — the slots swap roles in one style recalculation: the new photo
 *    drops to the base z-index still at opacity 1, the old one snaps to
 *    opacity 0 with `transition: none` (so it can't fade back over the top).
 */
export function useCrossfade<T extends CrossfadeItem>(
  items: T[],
  {
    kenBurns = false,
    priorityFirst = true,
    intervalMs = CROSSFADE_INTERVAL_MS,
  }: CrossfadeOptions = {}
): CrossfadeResult<T> {
  // A photo's whole on-screen life: it fades in, holds, then is covered.
  // The Ken Burns ramp is tied to exactly this so it can never be cut off
  // partway and restart from scale(1) — that was the visible "cut".
  const lifetimeMs = intervalMs + 2 * CROSSFADE_FADE_MS;
  const count = items.length;
  // Read only inside the timer callback, so it can pick up a changed pool
  // without the interval effect re-running (and resetting the timer) every
  // time the caller hands us a new array identity.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Identity permutation on the server and on the first client paint, so
  // hydration matches exactly; shuffled after mount for a fresh rotation per
  // visit. Position 0 is pinned so the already-painted (and priority-loaded)
  // first photo never swaps out immediately.
  const [order, setOrder] = useState<number[]>(() =>
    items.map((_, i) => i)
  );
  const [front, setFront] = useState<Slot>(0);
  const [slotPos, setSlotPos] = useState<[number | null, number | null]>([
    0,
    null,
  ]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hasStarted, setHasStarted] = useState(false);
  // Ken Burns is a transform *transition*, not a keyframe animation, so it
  // restarts naturally when the target value changes and never needs the
  // element remounted (remounting would re-decode the image). Transitions
  // don't fire on first paint, so the first photo needs arming after mount.
  const [armed, setArmed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const arm = () => setArmed(true);
    const raf = requestAnimationFrame(arm);
    // Same backstop as the stage->enter step: a page that loads in a hidden
    // tab gets no rAF, and must still arm before it is looked at.
    const backstop = setTimeout(arm, 100);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(backstop);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // A backgrounded tab shouldn't burn mobile bandwidth and decode cycles
  // rotating photos nobody is looking at.
  useEffect(() => {
    const onChange = () => setPageHidden(document.visibilityState === "hidden");
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  useEffect(() => {
    // The server must render the unshuffled order and the client reorder
    // after mount; randomising during render is a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder((prev) => {
      if (count <= 2 && prev.length === count) return prev;
      const base = Array.from({ length: count }, (_, i) => i);
      if (count <= 2) return base;
      const [first, ...rest] = base;
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      return [first, ...rest];
    });
  }, [count]);

  const back: Slot = front === 0 ? 1 : 0;

  // 1 -> 3: wait out the interval, decode the next photo, then stage it.
  useEffect(() => {
    if (count <= 1 || pageHidden || phase !== "idle") return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const pool = itemsRef.current;
      if (pool.length <= 1) return;
      const currentPos = slotPos[front] ?? 0;
      const nextPos = (currentPos + 1) % pool.length;
      const nextItem = pool[order[nextPos] ?? nextPos];
      const stage = () => {
        if (cancelled) return;
        setSlotPos((prev) => {
          const next: [number | null, number | null] = [prev[0], prev[1]];
          next[back] = nextPos;
          return next;
        });
        setHasStarted(true);
        setPhase("staged");
      };
      if (!nextItem) return;
      void decodeAhead(nextItem.src, DECODE_TIMEOUT_MS).then(stage);
    }, intervalMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, pageHidden, count, front, back, slotPos, order, intervalMs]);

  // 3 -> 4: two frames at the from-state, then start the fade. The timeout
  // is a backstop, not a duplicate: rAF callbacks don't run at all while the
  // document is hidden, and without it a tab backgrounded in this two-frame
  // window would sit mid-swap until it was looked at again.
  useEffect(() => {
    if (phase !== "staged") return;
    let inner = 0;
    const enter = () => setPhase("entering");
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(enter);
    });
    const backstop = setTimeout(enter, 100);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      clearTimeout(backstop);
    };
  }, [phase]);

  // 4 -> 5: once the fade has finished, swap the slots' roles.
  useEffect(() => {
    if (phase !== "entering") return;
    const timer = setTimeout(
      () => {
        setFront((f) => (f === 0 ? 1 : 0));
        setPhase("idle");
      },
      reducedMotion ? 0 : CROSSFADE_FADE_MS
    );
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);

  const swapping = phase !== "idle";
  const zoom = kenBurns && armed && !reducedMotion;

  const layers: CrossfadeLayer<T>[] = ([0, 1] as Slot[]).map((slot) => {
    const pos = slotPos[slot];
    const item = pos === null ? null : (items[order[pos] ?? pos] ?? null);
    const isFront = slot === front;
    const isEntering = swapping && phase === "entering" && !isFront;
    const visible = isFront || isEntering;

    const transitions: string[] = [];
    if (isEntering && !reducedMotion) {
      transitions.push(`opacity ${CROSSFADE_FADE_MS}ms ease-in-out`);
    }
    if (zoom && visible) {
      transitions.push(`transform ${lifetimeMs}ms ease-out`);
    }

    return {
      key: `crossfade-slot-${slot}`,
      item,
      isCurrent: swapping ? !isFront : isFront,
      priority: priorityFirst && slot === 0 && !hasStarted,
      style: {
        opacity: visible ? 1 : 0,
        // The arriving layer sits above the settled one while it fades in,
        // then drops back to the base level in the same recalc that snaps
        // the outgoing layer to 0.
        zIndex: swapping && !isFront ? 2 : 1,
        transform: `scale(${zoom && visible ? KEN_BURNS_SCALE : 1}) translateZ(0)`,
        transition: transitions.length ? transitions.join(", ") : "none",
        // Keep both layers on their own compositor layer so the opacity and
        // transform run on the GPU — a full-viewport bitmap repainting a 1s
        // opacity ramp on the main thread is what made this choppy on phones.
        willChange: kenBurns ? "opacity, transform" : "opacity",
        backfaceVisibility: "hidden",
      },
    };
  });

  const leadSlot: Slot = swapping ? back : front;
  const leadPos = slotPos[leadSlot] ?? 0;
  const currentIndex = order[leadPos] ?? 0;

  return {
    layers,
    current: items[currentIndex] ?? null,
    currentIndex,
  };
}
