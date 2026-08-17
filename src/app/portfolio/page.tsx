import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { CategoryFeatureTile } from "@/components/category-feature-tile";
import { CATEGORIES, categoryFeaturePhotos } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Senior, family and nature photography across Frederick, Firestone, Longmont and the Colorado Front Range — real sessions by Ryan Petersen.",
  alternates: { canonical: canonical("portfolio") },
};

// Progressive brightening ramp down the page, same technique/tokens as
// Home and About — each category section reads a little lighter than the
// last instead of one flat background throughout.
/* One theme per category so the three sections read as different rooms
   rather than three shades of the same brown. Nature gets moss. */
const SECTION_THEME: Record<string, string> = {
  senior: "ember",
  family: "dusk",
  nature: "moss",
};

/**
 * Session types Ryan will shoot on request. These are deliberately NOT in
 * CATEGORIES — there are no photos for them yet, and inventing a gallery
 * would be a false claim about work he's done.
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
            Click a session below to see the full shoot.
          </p>
        </div>
      </Section>

      {CATEGORIES.map(({ slug, title, description, noun }) => {
        const photos = categoryFeaturePhotos(slug);
        if (photos.length === 0) return null;

        return (
          <Section
            key={slug}
            id={slug}
            data-theme={SECTION_THEME[slug]}
            className="scroll-mt-16 border-t border-border"
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
            <CategoryFeatureTile
              category={slug}
              photos={photos}
              noun={noun}
              nounPlural={noun === "family" ? "families" : `${noun}s`}
            />
          </Section>
        );
      })}

      {/* Shoot types Ryan will take on request but hasn't photographed yet.
          Without this, someone wanting couples or event photos assumes he
          doesn't do it and leaves — and there's no page for those searches
          to land on either. */}
      <Section
        id="requested"
        data-theme="sand"
        className="scroll-mt-16 border-t border-border"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-medium italic tracking-tight text-foreground">
            By Request
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Not everything I shoot is in the gallery yet. These are sessions
            I&apos;m happy to take on — ask and we&apos;ll plan it together.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REQUESTED.map(({ title, description }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-background p-5"
            >
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
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
      </Section>

      <Section data-theme="night" className="border-t border-border">
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
