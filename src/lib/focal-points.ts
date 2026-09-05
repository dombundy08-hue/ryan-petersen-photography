import focalPoints from "../../content/generated/focal-points.json";

/**
 * Build-time focal points for everything under `public/images/`, produced by
 * `scripts/focal-points.mjs` (wired into `prebuild`, so a photo uploaded
 * through the CMS gets one on the next Netlify build with no manual step).
 *
 * The manifest is imported statically rather than read from disk: this is a
 * static export, every consumer is a server component, and it keeps the lookup
 * usable from anywhere `shoots.ts`-style synchronous content loading is.
 *
 * This is the FALLBACK layer, not the top one. A hand-tuned
 * `Photo.objectPosition` in `content/shoots/*.json` always wins - see
 * `resolveObjectPosition` below for the intended precedence.
 */

interface FocalPointEntry {
  objectPosition: string;
}

const manifest: Record<string, FocalPointEntry> = focalPoints;

/**
 * Used when an image has no manifest entry at all (unreadable file, or an
 * image added since the last manifest build). Slightly above centre, which is
 * the least-bad crop for an unknown photo of a person.
 */
export const DEFAULT_OBJECT_POSITION = "50% 35%";

/**
 * `withBasePath()` prefixes image paths for the GitHub Pages deploy, but the
 * manifest is keyed by the raw path. Accept either form so callers do not have
 * to care which side of that helper they are on.
 */
const basePath = process.env.GH_PAGES_BASE_PATH ?? "";

function normalize(src: string): string {
  let key = src;

  // Tolerate a full URL as well as a path.
  if (/^https?:\/\//i.test(key)) {
    try {
      key = new URL(key).pathname;
    } catch {
      // fall through with the original string
    }
  }

  if (basePath && key.startsWith(basePath)) {
    key = key.slice(basePath.length);
  }
  if (!key.startsWith("/")) {
    key = `/${key}`;
  }

  // Strip a query string or hash if a caller passed a cache-busted src.
  const cut = key.search(/[?#]/);
  return cut === -1 ? key : key.slice(0, cut);
}

/**
 * The computed `object-position` for an image, or `undefined` when the image
 * is not in the manifest. Accepts a raw public path (`/images/...`) or one
 * already run through `withBasePath()`.
 */
export function getFocalPoint(src: string): string | undefined {
  if (!src) return undefined;
  return manifest[normalize(src)]?.objectPosition;
}

/**
 * Full precedence for a crop: an explicit per-photo override wins, then the
 * computed focal point, then the default. Components should call this rather
 * than reimplementing the fallback chain.
 *
 *   style={{ objectPosition: resolveObjectPosition(photo.src, photo.objectPosition) }}
 */
export function resolveObjectPosition(src: string, override?: string): string {
  return override ?? getFocalPoint(src) ?? DEFAULT_OBJECT_POSITION;
}
