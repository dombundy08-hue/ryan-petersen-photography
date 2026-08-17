import fs from "node:fs";
import path from "node:path";

/**
 * Single source of truth for the site's own URL and business facts.
 *
 * The URL used to be a fallback string copy-pasted into layout.tsx,
 * sitemap.ts and robots.ts. All three pointed at a domain that isn't the
 * one being registered, so a build without NEXT_PUBLIC_SITE_URL set would
 * publish canonicals, OG tags and a sitemap advertising the wrong host.
 * One constant, imported everywhere, makes that impossible to get wrong
 * in only two of the three places.
 */
const FALLBACK_URL = "https://ryanshutter.com";

/** The real domain. Anything else is a preview and must not be indexed. */
const PRODUCTION_HOST = "ryanshutter.com";

/**
 * Never a trailing slash — callers append their own path.
 *
 * `process.env.URL` is set by Netlify to the deploy's own address, so a
 * build on ryanshutter.netlify.app reports that rather than pretending to
 * be the production domain it isn't yet.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  FALLBACK_URL
).replace(/\/$/, "");

/**
 * True only on the real domain.
 *
 * Until ryanshutter.com is bought and connected, the site lives on a
 * netlify.app subdomain. Left alone it would be crawlable while every
 * canonical pointed at a domain that doesn't resolve — the fastest way to
 * confuse Google about which URL is real, and to get the temporary address
 * indexed under the client's name. Everything is served with noindex until
 * the domain is live, and it switches itself on the moment it is.
 */
export const IS_LIVE_DOMAIN = SITE_URL.includes(PRODUCTION_HOST);

/**
 * next.config.ts sets trailingSlash: true, so the page that actually
 * exists at build time is /about/, not /about. Canonicals and sitemap
 * entries have to agree with that or every URL costs a redirect hop and
 * two spellings compete for the same page.
 */
export function canonical(route = ""): string {
  if (!route || route === "/") return `${SITE_URL}/`;
  const clean = route.replace(/^\/|\/$/g, "");
  return `${SITE_URL}/${clean}/`;
}

export interface BusinessFacts {
  name: string;
  legalName: string;
  photographer: string;
  email: string;
  telephone: string;
  region: string;
  country: string;
  /** Blank until confirmed — see `hasLocation`. */
  city: string;
  /** Towns named in copy and schema. Confirm before extending. */
  serviceArea: string[];
  /** The wider region he'll travel to, spelled out. */
  serviceAreaState: string;
  priceRange: string;
  sameAs: string[];
}

/**
 * Read from content/settings/business.json so these stay editable without
 * a code change, matching how shoots and about settings already work.
 *
 * Fields left blank are OMITTED from structured data rather than guessed.
 * An invented address or service area in schema is worse than none — it is
 * a factual claim to a search engine.
 */
function loadBusiness(): BusinessFacts {
  const filePath = path.join(
    process.cwd(),
    "content",
    "settings",
    "business.json"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as BusinessFacts;
}

export const business: BusinessFacts = loadBusiness();

/**
 * The one-line description used for the home page and as the OG/Twitter
 * fallback. Names the service, the town and the current offer, because all
 * three are what someone actually types into a search box.
 */
export const SITE_DESCRIPTION =
  `Senior, family, and nature photography by Ryan Petersen, based in ` +
  `${business.city}, ${business.serviceAreaState}. Shot fully manual for ` +
  `light that looks the way you remember it. Sessions are free while he ` +
  `builds his portfolio.`;

/** True once a city is filled in — gates the local-business schema. */
export const hasLocation = Boolean(business.city.trim());
