import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { shoots, getShoot } from "@/lib/shoots";

export function generateStaticParams() {
  return shoots.map((shoot) => ({
    category: shoot.category,
    slug: shoot.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await params;
  const shoot = getShoot(category, slug);
  if (!shoot) return {};
  return {
    title: shoot.title,
    description: shoot.description,
  };
}

export default async function ShootPage({
  params,
}: PageProps<"/portfolio/[category]/[slug]">) {
  const { category, slug } = await params;
  const shoot = getShoot(category, slug);
  if (!shoot) notFound();

  return (
    <Section className="pt-16 pb-20 sm:pt-20">
      <Link
        href={`/portfolio#${shoot.category}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Portfolio
      </Link>

      <div className="mt-6 max-w-2xl">
        <h1 className="font-heading text-3xl font-medium italic tracking-tight text-foreground sm:text-4xl">
          {shoot.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{shoot.description}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shoot.photos.map((photo) => (
          <div
            key={photo.src}
            className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <p className="text-muted-foreground">
          Like this style? Let&apos;s plan your own session.
        </p>
        <div className="mt-4">
          <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
            Book a Session
          </Button>
        </div>
      </div>
    </Section>
  );
}
