import type { MetadataRoute } from "next";
import { SITE_URL, IS_LIVE_DOMAIN } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Pre-launch previews (netlify.app) are closed to crawlers entirely —
  // see IS_LIVE_DOMAIN. This flips to Allow automatically once the site is
  // being served from ryanshutter.com.
  if (!IS_LIVE_DOMAIN) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
