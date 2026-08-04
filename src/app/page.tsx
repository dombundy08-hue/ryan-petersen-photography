import Link from "next/link";
import { Aperture, Users, Trees, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";

const SPECIALTIES = [
  {
    icon: Aperture,
    title: "Senior Photos",
    description:
      "A milestone worth doing right — portraits that actually look like you.",
    href: "/portfolio#senior",
  },
  {
    icon: Users,
    title: "Family Photos",
    description:
      "Relaxed sessions built around your family, not a stiff studio pose.",
    href: "/portfolio#family",
  },
  {
    icon: Trees,
    title: "Nature Photos",
    description:
      "Landscapes and outdoor moments shot with an eye for natural light.",
    href: "/portfolio#nature",
  },
];

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
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Now booking sessions
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Creating memorable moments, one photo at a time.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Senior, family, and nature photography — honest, local, and focused
            on making you feel comfortable in front of the camera.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} render={<Link href="/portfolio" />}>
              View My Work
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false} render={<Link href="/contact" />}
            >
              Book a Session
            </Button>
          </div>
        </div>
      </Section>

      <Section className="border-t border-border">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            What I shoot
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {SPECIALTIES.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                See the gallery
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-secondary/40">
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

      <Section className="border-t border-border">
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

      <Section className="border-t border-border">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Let&apos;s build something to look back on.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whether it&apos;s senior portraits, a family session, or a shoot
            out in nature — I&apos;d be glad to help tell your story.
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

