import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { PlaceholderPhoto } from "@/components/placeholder-photo";
import { photosByCategory } from "@/lib/photos";

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
    count: 6,
  },
  {
    id: "family",
    category: "family" as const,
    title: "Family Photos",
    description:
      "Relaxed sessions built around your family, not a stiff studio pose.",
    count: 6,
  },
  {
    id: "nature",
    category: "nature" as const,
    title: "Nature Photos",
    description:
      "Landscapes and outdoor moments shot with an eye for natural light.",
    count: 6,
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
            A few sample shots below to show how the gallery works — Ryan&apos;s
            real sessions will fill this out as they&apos;re delivered.
          </p>
        </div>
      </Section>

      {CATEGORIES.map(({ id, category, title, description, count }) => {
        const realPhotos = photosByCategory(category);
        const placeholderCount = Math.max(count - realPhotos.length, 0);
        return (
          <Section
            key={id}
            id={id}
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
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {realPhotos.map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
              {Array.from({ length: placeholderCount }).map((_, i) => (
                <PlaceholderPhoto
                  key={i}
                  category={category}
                  label={`${title.replace(" Photos", "")} ${realPhotos.length + i + 1}`}
                />
              ))}
            </div>
          </Section>
        );
      })}

      <Section className="border-t border-border">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Want to be featured in this gallery?
          </h2>
          <p className="mt-3 text-muted-foreground">
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

