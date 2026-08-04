import type { Metadata } from "next";
import Image from "next/image";
import { Mountain, Car, Trophy, Gamepad2, User } from "lucide-react";
import { Section } from "@/components/section";
import { aboutPhoto, aboutMorePhotos, aboutPersonalPhotos } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Ryan Petersen — a local photographer focused on senior, family, and nature photography.",
};

const HOBBIES = [
  { icon: Mountain, label: "Hiking" },
  { icon: Car, label: "Cars" },
  { icon: Trophy, label: "Sports" },
  { icon: Gamepad2, label: "Gaming" },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
            About Me
          </h1>
        </div>
      </Section>

      <Section className="border-t border-border pt-0">
        <div className="mx-auto grid max-w-2xl gap-8 sm:grid-cols-[220px_1fr] sm:items-start">
          {aboutPhoto ? (
            <div className="relative mx-auto aspect-[4/5] w-44 overflow-hidden rounded-xl border border-border sm:mx-0 sm:w-full">
              <Image
                src={aboutPhoto}
                alt="Ryan Petersen"
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              role="img"
              aria-label="Photo of Ryan Petersen — coming soon"
              className="relative mx-auto flex aspect-[4/5] w-44 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#D3A054]/20 via-[#5C4F3E]/15 to-[#1B1712] sm:mx-0 sm:w-full"
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

        {aboutMorePhotos.length > 0 && (
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="grid grid-cols-4 gap-3">
              {aboutMorePhotos.map((src) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={src}
                    alt="Ryan Petersen"
                    fill
                    sizes="(max-width: 640px) 25vw, 140px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto mt-14 max-w-2xl">
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
          {aboutPersonalPhotos.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {aboutPersonalPhotos.map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 33vw, 220px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-border bg-secondary/50 p-8 text-center">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Behind the camera
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fully manual shooting style, local to the area, and a brand-new
            business built on care, honesty, and making the experience fun —
            not just the photos.
          </p>
        </div>
      </Section>
    </>
  );
}
