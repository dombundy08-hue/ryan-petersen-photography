import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/section";
import { ProfileGrid } from "@/components/profile-grid";
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
        <Section data-theme={meta.theme}>
          <ProfileGrid
            categorySlug={meta.slug}
            noun={meta.noun}
            nounPlural={meta.nounPlural}
            cards={entries.map((entry) => ({
              slug: entry.slug,
              name: entry.name,
              src: entry.photo.src,
              alt: entry.photo.alt,
              objectPosition: entry.photo.objectPosition,
              photoCount: entry.photoCount,
            }))}
          />
        </Section>
      )}
    </>
  );
}
