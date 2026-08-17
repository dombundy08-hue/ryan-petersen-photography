import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import { Mountain, Car, Trophy, Gamepad2, User } from "lucide-react";
import { Section } from "@/components/section";
import { PhotoCarousel } from "@/components/photo-carousel";
import { aboutPhoto, aboutMorePhotos } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Ryan Petersen — a local photographer focused on senior, family, and nature photography.",
  alternates: { canonical: canonical("about") },
};

const HOBBIES = [
  { icon: Mountain, label: "Hiking" },
  { icon: Car, label: "Cars" },
  { icon: Trophy, label: "Sports" },
  { icon: Gamepad2, label: "Gaming" },
];

export default function AboutPage() {
  const aboutPhotos = aboutPhoto
    ? [aboutPhoto, ...aboutMorePhotos].map((src) => ({
        src,
        alt: "Ryan Petersen",
      }))
    : [];

  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
            About Me
          </h1>
        </div>
      </Section>

      <Section className="border-t border-border bg-muted pt-0">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1.1fr_1fr] md:items-start">
          <div className="mx-auto w-full max-w-sm md:max-w-none">
            {aboutPhoto ? (
              <PhotoCarousel
                photos={aboutPhotos}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border"
                sizes="(max-width: 768px) 90vw, 480px"
              />
            ) : (
              <div
                role="img"
                aria-label="Photo of Ryan Petersen — coming soon"
                className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#D3A054]/20 via-[#5C4F3E]/15 to-[#1B1712]"
              >
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <User
                    className="size-8 text-foreground/40"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Photo of Ryan
                    <br />
                    coming soon
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 text-base leading-relaxed text-foreground/90">
          <p>
            Hi, I&apos;m Ryan. Photography has become one of my biggest
            passions because I love capturing moments that people can look
            back on for the rest of their lives. Whether it&apos;s a family,
            a couple, a senior, or someone celebrating a special milestone, I
            enjoy telling their story through my camera.
          </p>
          <p>
            When you work with me, my goal isn&apos;t just to take great
            photos — it&apos;s to make you feel comfortable, have fun, and
            enjoy the experience. I know not everyone feels natural in front
            of a camera, so I do my best to create a relaxed environment
            where you can simply be yourself.
          </p>
          <p>
            Outside of photography, I enjoy hiking, cars, sports, gaming, and
            anything that lets me be creative or work with my hands. Those
            interests have taught me to appreciate the little details, solve
            problems, and connect with people from all walks of life.
          </p>
          <p>
            Thank you for considering me to capture your memories. It truly
            means a lot, and I&apos;d be honored to help tell your story
            through my lens.
          </p>
          </div>
        </div>
      </Section>

      <Section className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-heading text-lg font-semibold text-foreground">
            When I&apos;m not shooting
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HOBBIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center"
              >
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
