"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import type { SeniorTeaserEntry } from "@/lib/senior-teaser";

const TILE_SIZES = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw";

function RealSlot({ entry }: { entry: SeniorTeaserEntry }) {
  if (!entry.photo || !entry.slug) return null;
  return (
    // Links to the directory, not straight to this person's shoot page —
    // clicking any of the 5 teaser tiles goes to /portfolio/senior first,
    // where every person (real or "coming soon") is listed as its own card.
    <Link
      href="/portfolio/senior"
      className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-xl border border-border"
    >
      <Image
        src={entry.photo.src}
        alt={entry.photo.alt}
        fill
        sizes={TILE_SIZES}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,10,0) 55%, rgba(16,13,10,0.85) 100%)",
        }}
      />
      <div className="relative p-3">
        <p className="text-sm font-medium text-foreground">{entry.name}</p>
      </div>
    </Link>
  );
}

function PlaceholderSlot() {
  return (
    // Same destination as RealSlot — the directory, not a direct booking
    // link (that's what the directory's own placeholder cards are for).
    <Link
      href="/portfolio/senior"
      role="img"
      aria-label="Future senior session — coming soon"
      className="group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#D3A054]/20 via-[#5C4F3E]/15 to-[#1B1712] text-center"
    >
      <User
        className="size-7 text-foreground/40"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="text-xs font-medium text-muted-foreground">
        Coming Soon
      </span>
      <span className="text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
        View sessions &rarr;
      </span>
    </Link>
  );
}

export function SeniorTeaserGrid({
  entries,
}: {
  entries: SeniorTeaserEntry[];
}) {
  // Unlike the photo carousels (which only ever show one active photo at
  // a time, opacity-masking the rest), every tile here is visible
  // simultaneously — a post-mount reorder is a genuinely visible
  // rearrangement, not invisible index bookkeeping. useLayoutEffect
  // commits the shuffle before the browser's first post-hydration paint
  // to minimize that. No pinned position (unlike the carousels) — pinning
  // slot 0 would make it deterministic, undercutting the "random" intent.
  const [order, setOrder] = useState<number[]>(() =>
    entries.map((_, i) => i)
  );

  useLayoutEffect(() => {
    setOrder((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {order.map((entryIndex) => {
        const entry = entries[entryIndex];
        return entry.kind === "real" ? (
          <RealSlot key={entry.slug} entry={entry} />
        ) : (
          <PlaceholderSlot key={`placeholder-${entryIndex}`} />
        );
      })}
    </div>
  );
}
