import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { HeroCarousel } from "@/components/hero-carousel";
import { heroPhotos, shootsByCategory } from "@/lib/shoots";
import { CATEGORIES } from "@/lib/categories";
import type { Metadata } from "next";
import { canonical } from "@/lib/site";

// The home page inherits its title and description from the root layout,
// but the canonical must be declared here — the layout deliberately sets
// none, so that an unset page can never silently inherit the wrong one.
export const metadata: Metadata = {
  alternates: { canonical: canonical() },
};

/**
 * The "What I shoot" tiles, derived from CATEGORIES rather than repeated.
 *
 * This used to be a hand-written array whose descriptions were copies of
 * the ones in categories.ts, plus a hardcoded fourth "Requested" tile that
 * linked to an anchor. Custom Shots is a real category now, so all four
 * tiles come from one list and adding a fifth means editing categories.ts
 * only. Each tile links to that category's directory — the reader wants
 * the sessions, not a section heading.
 */
const SPECIALTIES = CATEGORIES.map((category) => ({
  title: category.title,
  description: category.description,
  href: `/portfolio/${category.slug}`,
  category: category.slug,
}));

const PROCESS = [
  { step: "1", title: "Reach Out", description: "Send a message with what you're looking for." },
  { step: "2", title: "We Talk It Through", description: "I'll respond personally to sort out time, place, and package." },
  { step: "3", title: "Book Your Session", description: "We lock in a date that works for you." },
  { step: "4", title: "Session Day", description: "We shoot — relaxed, fun, and comfortable." },
  { step: "5", title: "Gallery Delivered", description: "Edited photos land in your inbox, ready to share." },
];

export default function Home() {
  return (
    <>
      <HeroCarousel photos={heroPhotos} />

      <Section data-theme="ember">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-medium italic tracking-tight text-foreground">
            What I shoot
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SPECIALTIES.map(({ title, description, href, category }) => {
            const photo =
              shootsByCategory(category)
                .flatMap((shoot) => shoot.photos)
                .find((p) => p.heroEligible !== false) ??
              shootsByCategory(category)[0]?.photos[0];
            return (
              <Link
                key={title}
                href={href}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-xl border border-border bg-secondary"
              >
                {photo ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectPosition: photo.objectPosition ?? "50% 35%" }}
                    className="object-cover brightness-[0.92] transition-[filter] duration-500 group-hover:brightness-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera
                      className="size-10 text-foreground/20"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(16,13,10,0) 40%, rgba(16,13,10,0.9) 100%)",
                  }}
                />
                <div className="relative p-6">
                  <h3 className="font-heading text-xl font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/75">
                    {description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {photo ? "See the gallery" : "Coming soon"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section data-theme="cocoa">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Shot fully manual, on purpose.
            </h2>
            <p className="mt-4 text-muted-foreground">
              I don&apos;t rely on any auto settings on my camera — every photo&apos;s
              exposure and light is a deliberate choice, not left up to a
              computer. That&apos;s what gives each session its own look and
              feel, tuned to the moment and the light you&apos;re actually in.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              How it works
            </h2>
            <ol className="mt-6 space-y-5">
              {PROCESS.map(({ step, title, description }) => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section data-theme="hearth">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Free sessions, for now
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              I&apos;m offering sessions free of charge while I grow my
              portfolio — paid packages and special offers are coming soon.
              Book now while it lasts.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Reviews coming soon
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              I&apos;m just getting started, so I don&apos;t have reviews up
              yet — be one of my first clients and help me build that track
              record.
            </p>
          </div>
        </div>
      </Section>

      <Section data-theme="night">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Let&apos;s build something to look back on.
          </h2>
          <p className="mt-4 text-foreground/80">
            Whether it&apos;s senior portraits, a family session, a shoot out
            in nature, or your car in good light — I&apos;d be glad to help
            tell your story.
          </p>
          <div className="mt-8">
            <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
              Get in Touch
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

