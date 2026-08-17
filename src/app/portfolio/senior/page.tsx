import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/section";
import { seniorTeaserPool } from "@/lib/senior-teaser";

export const metadata: Metadata = {
  title: "Senior Portraits",
  description: "Senior portrait sessions in Frederick, Firestone, Longmont and across northern Colorado — shot fully manual by Ryan Petersen.",
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
          {entries.map((entry) =>
            entry.photo ? (
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
            ) : null
          )}
        </div>
      </Section>
    </>
  );
}
