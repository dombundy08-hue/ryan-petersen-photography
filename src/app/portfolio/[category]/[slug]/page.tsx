import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { shoots, getShoot } from "@/lib/shoots";
import { getCategory } from "@/lib/categories";
import { JsonLd } from "@/components/json-ld";
import { canonical } from "@/lib/site";
import { shootSchema, breadcrumbSchema } from "@/lib/schema";

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
    alternates: {
      canonical: canonical(`portfolio/${shoot.category}/${shoot.slug}`),
    },
    openGraph: {
      title: shoot.title,
      description: shoot.description,
      type: "article",
      images: shoot.photos.slice(0, 1).map((p) => ({ url: p.src })),
    },
  };
}

export default async function ShootPage({
  params,
}: PageProps<"/portfolio/[category]/[slug]">) {
  const { category, slug } = await params;
  const shoot = getShoot(category, slug);
  if (!shoot) notFound();

  return (
    // The gallery stays in its category's own colour — clicking through
    // from Senior shouldn't land you in a different room.
    <Section
      data-theme={getCategory(shoot.category)?.theme ?? "night"}
      className="pt-16 pb-20 sm:pt-20"
    >
      <JsonLd data={shootSchema(shoot)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", route: "" },
          { name: "Portfolio", route: "portfolio" },
          { name: shoot.title, route: `portfolio/${shoot.category}/${shoot.slug}` },
        ])}
      />
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
        {shoot.subjectName && (
          <p className="mt-1 text-sm font-medium text-primary">
            {shoot.subjectName}
          </p>
        )}
        <p className="mt-2 text-muted-foreground">{shoot.description}</p>
      </div>

      {/* Every gallery renders identically, whatever its photo count. This
          used to branch: one photo became a full-bleed 21:9 banner and two
          photos got their own column count, which is why the family and
          nature shoots read as enormous next to a senior gallery of the
          same thing. A one-photo shoot is now simply a one-card gallery.
          flex-wrap centres a partial last row instead of leaving a hole. */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {shoot.photos.map((photo, i) => (
          <div
            key={photo.src}
            className="relative aspect-[4/5] basis-[calc(50%-0.5rem)] overflow-hidden rounded-xl border border-border lg:basis-[calc(33.333%-0.667rem)]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              style={{ objectPosition: photo.objectPosition ?? "50% 35%" }}
              className="object-cover"
              priority={i === 0}
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
