import type { MetadataRoute } from "next";
import { canonical } from "@/lib/site";
import { shoots } from "@/lib/shoots";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-static";

/**
 * Derived from the same `shoots` data that generates the routes, so a shoot
 * added through the admin panel appears here on the next build.
 *
 * The previous version listed four static routes by hand and therefore
 * omitted every shoot detail page and /portfolio/senior — the richest,
 * most specific content on the site was absent from the sitemap entirely.
 * A hand-kept list drifts the moment content is added; this cannot.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { route: "", priority: 1 },
    { route: "/portfolio", priority: 0.9 },
    { route: "/about", priority: 0.7 },
    { route: "/contact", priority: 0.7 },
  ];

  // One directory per category, from the same list that generates them.
  const categoryRoutes = CATEGORIES.map((c) => ({
    route: `/portfolio/${c.slug}`,
    priority: 0.8,
  }));

  const shootRoutes = shoots.map((shoot) => ({
    route: `/portfolio/${shoot.category}/${shoot.slug}`,
    // The actual work. Ranks above the boilerplate pages, below the hubs.
    priority: 0.8,
  }));

  const lastModified = new Date();

  return [...staticRoutes, ...categoryRoutes, ...shootRoutes].map(({ route, priority }) => ({
    url: canonical(route),
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority,
  }));
}
