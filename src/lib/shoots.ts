import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "@/lib/base-path";
import { resolveObjectPosition } from "@/lib/focal-points";

export type PhotoCategory = "senior" | "family" | "nature" | "custom";

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
  /**
   * CSS object-position value (e.g. "50% 25%") for this photo when shown
   * in a crop that doesn't match its native aspect ratio — e.g. the
   * portfolio's aspect-[21/9] featured tile. Defaults to center ("50%
   * 50%") when omitted. Only set this where the default crop genuinely
   * cuts off the subject; most photos don't need it.
   */
  objectPosition?: string;
}

export interface Shoot {
  slug: string;
  category: PhotoCategory;
  title: string;
  description: string;
  /** e.g. "Dominic" — shown on the senior teaser/directory/detail pages. */
  subjectName?: string;
  /**
   * Set from the admin portal's Hide button. A hidden shoot is dropped in
   * loadShoots below, so it has no page, no tile, no sitemap entry and no
   * photos in the hero — but its record and photos are kept, and Unhide
   * brings it back exactly as it was.
   */
  hidden?: boolean;
  photos: Photo[];
}

/**
 * What a photo looks like in the raw JSON, before normalization.
 *
 * The admin portal's bulk uploader lets Ryan select a hundred photos in one
 * go, and it can only write them as a flat array of path strings — there is
 * no way to make a multi-file picker also collect per-photo alt text. The
 * four hand-written shoots use the richer object form, which carries real
 * alt text and explicit flags. Both are valid on disk; `normalizePhoto`
 * below turns either into a `Photo`.
 */
type PhotoInput = string | Photo;

interface RawShoot extends Omit<Shoot, "photos"> {
  photos: PhotoInput[];
}

/** Human label per category, used to write alt text we didn't get typed. */
const CATEGORY_ALT_LABEL: Record<PhotoCategory, string> = {
  senior: "Senior portrait",
  family: "Family session photo",
  nature: "Nature photo",
  custom: "Custom shot",
};

/**
 * Alt text for a bulk-uploaded photo that has none.
 *
 * Asking Ryan to write a hundred alt strings means he writes none, and
 * empty alt on a content photo fails the accessibility gate. A derived
 * sentence naming the subject and the kind of session is honest, useful to
 * a screen reader, and always present. A photo that carries its own alt
 * text keeps it.
 */
function deriveAlt(shoot: RawShoot): string {
  const label = CATEGORY_ALT_LABEL[shoot.category] ?? "Photo";
  return shoot.subjectName
    ? `${label} of ${shoot.subjectName}`
    : `${label} — ${shoot.title}`;
}

/**
 * Whether a photo with no explicit flag should be allowed in the home
 * hero.
 *
 * The hero is a rotating band of faces, so it wants people. A bulk upload
 * carries no per-photo flags, and defaulting everything to eligible would
 * quietly fill the hero with wheel arches and landscapes the moment Ryan
 * adds a car shoot. Category is the honest proxy: senior and family are
 * people, nature and custom are not. An explicit per-photo value always
 * wins over this default.
 */
function defaultHeroEligible(category: PhotoCategory): boolean {
  return category === "senior" || category === "family";
}

function normalizePhoto(input: PhotoInput, shoot: RawShoot): Photo {
  const photo: Photo =
    typeof input === "string" ? { src: input, alt: "" } : { ...input };

  return {
    ...photo,
    src: withBasePath(photo.src),
    alt: photo.alt?.trim() ? photo.alt : deriveAlt(shoot),
    heroEligible: photo.heroEligible ?? defaultHeroEligible(shoot.category),
    /**
     * Resolved once, here, rather than in each of the six components that
     * display a photo. This runs at build time on the server, so the
     * computed crop is serialized into props and the focal-point manifest
     * never reaches the client bundle — which it would if the client-side
     * carousels each imported it themselves. A hand-written override still
     * wins; see resolveObjectPosition.
     */
    objectPosition: resolveObjectPosition(photo.src, photo.objectPosition),
  };
}

/**
 * A description for a shoot saved without one. The admin portal makes the
 * field optional, but the shoot page uses it as its meta description, so it
 * can never be blank. Built only from what Ryan typed — nothing invented.
 */
function deriveDescription(shoot: RawShoot): string {
  const label = CATEGORY_ALT_LABEL[shoot.category] ?? "Photo";
  const subject = shoot.subjectName ? ` of ${shoot.subjectName}` : "";
  return `${label}s${subject} by Ryan Petersen — ${shoot.title}.`;
}

/**
 * Shoots are read from content/shoots/*.json at build time.
 *
 * On Netlify that folder is rewritten before every build from Netlify Blobs,
 * where the admin portal (public/admin/) saves shoots — see
 * netlify/plugins/content-from-blobs. The JSON files committed here are the
 * one-time seed for that store and what `next dev` shows locally; editing
 * them no longer changes the live site.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "shoots");

function loadShoots(): Shoot[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      return JSON.parse(raw) as RawShoot;
    })
    .filter((shoot) => !shoot.hidden && shoot.photos?.length > 0)
    .map((shoot) => ({
      ...shoot,
      description: shoot.description?.trim()
        ? shoot.description
        : deriveDescription(shoot),
      photos: shoot.photos.map((photo) => normalizePhoto(photo, shoot)),
    }))
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
 * The home hero's pool — hero-eligible photos, but capped per shoot.
 *
 * `allPhotos` is every eligible photo, and photo counts between shoots are
 * wildly uneven: one senior gallery has 113 photos while another has one.
 * Feeding that straight to a shuffled carousel means the same face comes
 * up over and over and the hero reads as a gallery of one person. Taking
 * at most a few frames per shoot makes the rotation a rotation of *people*
 * — which is the point of it — and it self-balances as Ryan adds sessions:
 * every new person gets the same share as everyone already there.
 *
 * The per-shoot slice is spread across each gallery rather than taken from
 * the front, so a shoot doesn't contribute four near-identical frames from
 * the same two minutes of the same session.
 */
/** `n` photos spread across a gallery rather than its first `n` frames. */
export function spreadSample<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  const stride = items.length / n;
  return Array.from({ length: n }, (_, i) => items[Math.floor(i * stride)]);
}

/** Changes once a day, so each day's build features a different mix. */
const BUILD_SEED = Math.floor(Date.now() / 86_400_000);

function seededShuffle<T>(items: T[], seed = BUILD_SEED): T[] {
  const pool = [...items];
  let s = seed || 1;
  const nextRandom = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/**
 * A fixed photo budget shared fairly across galleries: up to `perGallery`
 * frames each, fewer as galleries multiply, never more than `max` in total.
 * With more galleries than the budget, a daily seeded pick decides who is
 * featured — the page stays the same size at 10 profiles or 500, and over a
 * few days of builds everyone takes a turn. The client still shuffles the
 * chosen set per visit (use-crossfade).
 */
export function budgetedSample<T>(galleries: T[][], max: number, perGallery: number): T[][] {
  const nonEmpty = galleries.filter((gallery) => gallery.length > 0);
  const chosen = nonEmpty.length > max ? seededShuffle(nonEmpty).slice(0, max) : nonEmpty;
  const share = Math.max(1, Math.min(perGallery, Math.floor(max / Math.max(chosen.length, 1))));
  return chosen.map((gallery) => spreadSample(gallery, share));
}

const HERO_MAX_PHOTOS = 24;
const HERO_MAX_PER_SHOOT = 4;

export const heroPhotos: (Photo & { category: PhotoCategory })[] = budgetedSample(
  shoots.map((shoot) =>
    shoot.photos
      .filter((photo) => photo.heroEligible !== false)
      .map((photo) => ({ ...photo, category: shoot.category }))
  ),
  HERO_MAX_PHOTOS,
  HERO_MAX_PER_SHOOT
).flat();

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
