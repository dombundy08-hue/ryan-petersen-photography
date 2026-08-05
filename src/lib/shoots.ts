import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "@/lib/base-path";

export type PhotoCategory = "senior" | "family" | "nature";

export interface Photo {
  src: string;
  alt: string;
  /**
   * Whether this photo is a good candidate for the home page's rotating
   * hero carousel. The hero crops to a wide banner via object-cover, so a
   * profile shot, a photo where the subject is looking away, or an action
   * shot mid-motion can end up with the face cropped out or unrecognizable
   * even though the same photo works fine in a portfolio gallery. Defaults
   * to true when omitted — set explicitly to false on any photo where the
   * face isn't clearly visible/forward-facing.
   */
  heroEligible?: boolean;
}

export interface Shoot {
  slug: string;
  category: PhotoCategory;
  title: string;
  description: string;
  /** e.g. "Dominic" — shown on the senior teaser/directory/detail pages. */
  subjectName?: string;
  photos: Photo[];
}

/**
 * Shoots are read from content/shoots/*.json at build time — this is the
 * folder RyanShutter's admin panel (Decap CMS, public/admin/) manages, so a
 * shoot Ryan adds/edits there shows up here automatically on the next
 * rebuild. No code change needed to add a shoot; editing this file by hand
 * still works too (same JSON shape), it just won't show up in the CMS UI
 * until it matches a file in content/shoots/.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "shoots");

function loadShoots(): Shoot[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const shoot = JSON.parse(raw) as Shoot;
      return {
        ...shoot,
        photos: shoot.photos.map((photo) => ({
          ...photo,
          src: withBasePath(photo.src),
        })),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export const shoots: Shoot[] = loadShoots();

export function shootsByCategory(category: PhotoCategory): Shoot[] {
  return shoots.filter((shoot) => shoot.category === category);
}

export function getShoot(category: string, slug: string): Shoot | undefined {
  return shoots.find(
    (shoot) => shoot.category === category && shoot.slug === slug
  );
}

/**
 * Every photo across every shoot, flattened — used by the home hero
 * carousel. Filtered to heroEligible !== false so profile/away-facing/
 * action shots that read poorly once cropped into a wide banner never show
 * up there (they're still visible in the shoot's own gallery page).
 */
export const allPhotos: (Photo & { category: PhotoCategory })[] = shoots
  .flatMap((shoot) =>
    shoot.photos.map((photo) => ({ ...photo, category: shoot.category }))
  )
  .filter((photo) => photo.heroEligible !== false);

/**
 * Every photo across every shoot, unfiltered — for decorative uses (e.g. a
 * background marquee) where a profile shot or action shot is perfectly
 * fine, unlike the hero carousel above.
 */
export const everyPhoto: (Photo & { category: PhotoCategory })[] =
  shoots.flatMap((shoot) =>
    shoot.photos.map((photo) => ({ ...photo, category: shoot.category }))
  );

/**
 * A fixed pseudo-random sample of `count` photos from every shoot, picked
 * with a seeded shuffle so the selection is stable across a given build
 * (Math.random() would still work fine here since this is plain app code,
 * not a Workflow script, but a seed keeps the sample from jittering between
 * dev-server hot reloads).
 */
export function samplePhotos(count: number, seed = 42): Photo[] {
  const pool = [...everyPhoto];
  let s = seed;
  const nextRandom = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
