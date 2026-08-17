import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { Section } from "@/components/section";
import { seniorTeaserPool } from "@/lib/senior-teaser";

export const metadata: Metadata = {
  title: "Senior Sessions",
  description: "Every senior portrait session by Ryan Petersen.",
  alternates: { canonical: canonical("portfolio/senior") },
};

export default function SeniorDirectoryPage() {
  const entries = seniorTeaserPool();

  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
            Senior Sessions
          </h1>
          <p className="mt-4 text-muted-foreground">
            Click a name below to see their full gallery.
          </p>
        </div>
      </Section>

      <Section className="border-t border-border bg-muted">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry, i) =>
            entry.kind === "real" && entry.photo && entry.slug ? (
              <Link
                key={entry.slug}
                href={`/portfolio/senior/${entry.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl border border-border"
              >
                <Image
                  src={entry.photo.src}
                  alt={entry.photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                  <p className="text-sm font-medium text-foreground">
                    {entry.name}
                  </p>
                  <p className="text-xs text-foreground/70">
                    View gallery &rarr;
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                key={`placeholder-${i}`}
                href="/contact"
                role="img"
                aria-label="Future senior session — coming soon, click to book"
                className="group relative flex aspect-[4/5] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#D3A054]/20 via-[#5C4F3E]/15 to-[#1B1712] text-center"
              >
                <User
                  className="size-8 text-foreground/40"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  Coming Soon
                </span>
                <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Book a session &rarr;
                </span>
              </Link>
            )
          )}
        </div>
      </Section>
    </>
  );
}
