import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { CategoryTeaserGrid } from "@/components/category-teaser-grid";
import { PortfolioSearch } from "@/components/portfolio-search";
import {
  CATEGORIES,
  categoryTeaserTiles,
  allProfiles,
} from "@/lib/categories";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Senior, family, nature and custom photography across Frederick, Firestone, Longmont and the Colorado Front Range — real sessions by Ryan Petersen.",
  alternates: { canonical: canonical("portfolio") },
};

/**
 * Session types Ryan will shoot on request but has no gallery for yet.
 * Inventing a gallery for these would be a false claim about work he's
 * done, so they stay a plain list — and they live inside Custom Shots,
 * which is the catch-all category they belong to, rather than as a fifth
 * section competing with the four real ones.
 */
const REQUESTED: { title: string; description: string }[] = [
  {
    title: "Couples & Engagements",
    description: "Relaxed outdoor sessions — no stiff studio posing.",
  },
  {
    title: "Sports & Action",
    description: "Games, meets and practices, shot fully manual to keep up with the light.",
  },
  {
    title: "Events & Milestones",
    description: "Birthdays, graduations, anniversaries and the moments around them.",
  },
  {
    title: "Pets",
    description: "Your dog, outdoors, doing what it actually does.",
  },
  {
    title: "Headshots",
    description: "Clean, natural-light portraits for work or an online profile.",
  },
  {
    title: "Something Else",
    description: "If it's not listed, ask — the answer is usually yes.",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
            Portfolio
          </h1>
          <p className="mt-4 text-muted-foreground">
            Pick a category below, or search for a name.
          </p>
          <PortfolioSearch
            profiles={allProfiles().map((profile) => ({
              slug: profile.slug,
              name: profile.name,
              category: profile.category,
              categoryTitle: profile.categoryTitle,
              src: profile.photo.src,
              alt: profile.photo.alt,
              objectPosition: profile.photo.objectPosition,
              photoCount: profile.photoCount,
            }))}
          />
        </div>
      </Section>

      {CATEGORIES.map(({ slug, theme, title, description }, categoryIndex) => {
        const tiles = categoryTeaserTiles(slug);
        if (tiles.length === 0) return null;

        return (
          <Section
            key={slug}
            id={slug}
            data-theme={theme}
            className="scroll-mt-16"
          >
            <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-medium italic tracking-tight text-foreground">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
              <Link
                href={`/portfolio/${slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                See every session
              </Link>
            </div>
            <CategoryTeaserGrid
              tiles={tiles}
              categorySlug={slug}
              priority={categoryIndex === 0}
            />

            {/* Custom Shots is the catch-all, so the "I'll shoot this too"
                list belongs here rather than in a fifth section of its
                own. Someone looking for couples or pet photos finds it
                under the category that already means "something else". */}
            {slug === "custom" && (
              <div className="mt-12 border-t border-border pt-10">
                <h3 className="text-lg font-medium italic tracking-tight text-foreground">
                  Also on request
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Not everything I shoot is in the gallery yet. These are
                  sessions I&apos;m happy to take on — ask and we&apos;ll plan
                  it together.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {REQUESTED.map((request) => (
                    <li
                      key={request.title}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <h4 className="font-medium text-foreground">
                        {request.title}
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.description}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<Link href="/contact" />}
                  >
                    Request a Session
                  </Button>
                </div>
              </div>
            )}
          </Section>
        );
      })}

      <Section data-theme="night">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Want to be featured in this gallery?
          </h2>
          <p className="mt-3 text-foreground/80">
            Book a session now while it&apos;s free — your photos could be
            some of the first ones shown here.
          </p>
          <div className="mt-6">
            <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
              Book a Session
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
