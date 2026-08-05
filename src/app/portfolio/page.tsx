import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { SeniorTeaserGrid } from "@/components/senior-teaser-grid";
import { CategoryFeatureTile } from "@/components/category-feature-tile";
import { shootsByCategory } from "@/lib/shoots";
import { seniorTeaserPool } from "@/lib/senior-teaser";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Senior, family, and nature photography portfolio by Ryan Petersen.",
};

const CATEGORIES = [
  {
    id: "senior",
    category: "senior" as const,
    title: "Senior Photos",
    description:
      "A milestone worth doing right — portraits that actually look like you.",
  },
  {
    id: "family",
    category: "family" as const,
    title: "Family Photos",
    description:
      "Relaxed sessions built around your family, not a stiff studio pose.",
  },
  {
    id: "nature",
    category: "nature" as const,
    title: "Nature Photos",
    description:
      "Landscapes and outdoor moments shot with an eye for natural light.",
  },
];

// Progressive brightening ramp down the page, same technique/tokens as
// Home and About — each category section reads a little lighter than the
// last instead of one flat background throughout.
const SECTION_BG: Record<string, string> = {
  senior: "bg-muted",
  family: "bg-secondary",
  nature: "bg-border",
};

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

      {CATEGORIES.map(({ id, category, title, description }) => {
        if (category === "senior") {
          return (
            <Section
              key={id}
              id={id}
              className={`scroll-mt-16 border-t border-border ${SECTION_BG[id]}`}
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
              </div>
              <SeniorTeaserGrid entries={seniorTeaserPool()} />
            </Section>
          );
        }

        const categoryShoots = shootsByCategory(category);
        if (categoryShoots.length === 0) return null;

        const allCategoryPhotos = categoryShoots.flatMap((shoot) =>
          shoot.photos.map((photo) => ({
            ...photo,
            shootSlug: shoot.slug,
            shootTitle: shoot.title,
          }))
        );
        const heroSafePhotos = allCategoryPhotos.filter(
          (photo) => photo.heroEligible !== false
        );
        const featurePhotos =
          heroSafePhotos.length > 0 ? heroSafePhotos : allCategoryPhotos;

        return (
          <Section
            key={id}
            id={id}
            className={`scroll-mt-16 border-t border-border ${SECTION_BG[id]}`}
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
            </div>
            <CategoryFeatureTile category={category} photos={featurePhotos} />
          </Section>
        );
      })}

      <Section className="border-t border-border bg-[#5C4F3E]">
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
