import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/json-ld";
import { canonical } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/schema";
import { CATEGORIES, getCategory, categoryEntries } from "@/lib/categories";

/**
 * The directory for one category — one profile card per person, family or
 * series, each leading to that shoot's full gallery.
 *
 * Replaces the hand-written /portfolio/senior page so Family and Nature
 * get the same thing without three near-identical files.
 */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[category]">): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategory(category);
  if (!meta) return {};
  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    alternates: { canonical: canonical(`portfolio/${meta.slug}`) },
  };
}

export default async function CategoryDirectoryPage({
  params,
}: PageProps<"/portfolio/[category]">) {
  const { category } = await params;
  const meta = getCategory(category);
  if (!meta) notFound();

  const entries = categoryEntries(meta.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", route: "" },
          { name: "Portfolio", route: "portfolio" },
          { name: meta.heading, route: `portfolio/${meta.slug}` },
        ])}
      />

      <Section data-theme="night" className="pt-16 pb-12 sm:pt-20">
        <Link
          href={`/portfolio#${meta.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Portfolio
        </Link>
        <div className="mx-auto mt-6 max-w-2xl text-center">
          <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
            {meta.heading}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {entries.length > 0
              ? "Pick a session below to see the full gallery."
              : "No sessions here yet — check back soon."}
          </p>
        </div>
      </Section>

      {entries.length > 0 && (
        <Section data-theme="ember" className="border-t border-border">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/portfolio/${meta.slug}/${entry.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl border border-border"
              >
                <Image
                  src={entry.photo.src}
                  alt={entry.photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  /* Cards are portrait-shaped, so a centred crop is fine
                     here — unlike the 21:9 tile. Per-photo overrides still
                     win where a shot needs one. */
                  style={{ objectPosition: entry.photo.objectPosition ?? "50% 40%" }}
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
                    {entry.photoCount} photo{entry.photoCount === 1 ? "" : "s"}
                    {" · "}View gallery &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
