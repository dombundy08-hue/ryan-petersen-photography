import { shootsByCategory, type PhotoCategory, type Photo } from "@/lib/shoots";

/**
 * The four shot categories, in the order they appear everywhere.
 *
 * One definition, used by the portfolio page, the category directories,
 * generateStaticParams and the sitemap — so adding a category is a single
 * edit rather than four that have to agree.
 */
export interface CategoryMeta {
  slug: PhotoCategory;
  /** Section heading on /portfolio */
  title: string;
  /** <h1> on the directory page */
  heading: string;
  description: string;
  /** What one entry in this category is called. */
  noun: string;
  /** Explicit plural — deriving it with +"s" gives "seriess". */
  nounPlural: string;
  metaTitle: string;
  metaDescription: string;
  /**
   * The `data-theme` this category paints itself in, everywhere it
   * appears — its portfolio section, its directory page, its galleries.
   * Declared here so a category is one edit rather than one per page, and
   * so a reader who clicks Senior on the portfolio lands on a page that is
   * still the same room. Values are defined in globals.css.
   */
  theme: "ember" | "cocoa" | "umber" | "tobacco";
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "senior",
    theme: "ember",
    title: "Senior Photos",
    heading: "Senior Sessions",
    description:
      "A milestone worth doing right — portraits that actually look like you.",
    noun: "senior",
    nounPlural: "seniors",
    metaTitle: "Senior Portraits",
    metaDescription:
      "Senior portrait sessions in Frederick, Firestone, Longmont and across northern Colorado — shot fully manual by Ryan Petersen.",
  },
  {
    slug: "family",
    theme: "cocoa",
    title: "Family Photos",
    heading: "Family Sessions",
    description:
      "Relaxed sessions built around your family, not a stiff studio pose.",
    noun: "family",
    nounPlural: "families",
    metaTitle: "Family Photography",
    metaDescription:
      "Family photography sessions in Frederick, Firestone, Longmont and across northern Colorado — relaxed, natural, and built around your family.",
  },
  {
    slug: "nature",
    theme: "umber",
    title: "Nature Photos",
    heading: "Nature & Landscape",
    description:
      "Landscapes and outdoor moments shot with an eye for natural light.",
    noun: "series",
    nounPlural: "series",
    metaTitle: "Nature & Landscape Photography",
    metaDescription:
      "Landscape and outdoor photography across the Colorado Front Range — shot fully manual by Ryan Petersen.",
  },
  {
    slug: "custom",
    theme: "tobacco",
    title: "Custom Shots",
    heading: "Custom Shots",
    description:
      "Cars, details and one-off ideas — the sessions that don't fit a category.",
    noun: "set",
    nounPlural: "sets",
    metaTitle: "Custom & Automotive Photography",
    metaDescription:
      "Automotive, detail and custom photography in Frederick, Firestone, Longmont and across northern Colorado — shot fully manual by Ryan Petersen.",
  },
];

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export interface CategoryEntry {
  slug: string;
  /** The person, family or series name shown on the card. */
  name: string;
  photo: Photo;
  photoCount: number;
}

/**
 * One card per shoot in a category — a person, a family, a series.
 *
 * This is what the directory page lists and what the rotating tile links
 * to. The tile used to link straight to whichever shoot happened to be
 * showing, which meant picking a specific person required waiting for
 * their photo to cycle round. Now the tile goes here and you choose.
 */
export function categoryEntries(category: PhotoCategory): CategoryEntry[] {
  return shootsByCategory(category)
    .map((shoot) => {
      const photo =
        shoot.photos.find((p) => p.heroEligible !== false) ?? shoot.photos[0];
      if (!photo) return null;
      return {
        slug: shoot.slug,
        name: shoot.subjectName ?? shoot.title,
        photo,
        photoCount: shoot.photos.length,
      };
    })
    .filter((e): e is CategoryEntry => e !== null);
}

export interface TeaserPhoto extends Photo {
  /** Whose session this frame is from. Captioned, and changes with the photo. */
  name: string;
}

export interface CategoryTeaserTile {
  key: string;
  photos: TeaserPhoto[];
}

/** Every profile on the site, for the portfolio-wide name search. */
export interface ProfileSummary {
  slug: string;
  name: string;
  category: PhotoCategory;
  categoryTitle: string;
  photo: Photo;
  photoCount: number;
}

export function allProfiles(): ProfileSummary[] {
  return CATEGORIES.flatMap((category) =>
    categoryEntries(category.slug).map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      category: category.slug,
      categoryTitle: category.title,
      photo: entry.photo,
      photoCount: entry.photoCount,
    }))
  );
}

/**
 * The tiles for a category's section on /portfolio — several small shuffling
 * photos rather than one big banner.
 *
 * Why not one tile per shoot: a category can have two shoots or twenty, and
 * the section should look the same either way. Tiles are dealt round-robin
 * across the shoots, so with four tiles and two shoots each person gets two
 * tiles, and adjacent tiles are different people wherever that's possible.
 *
 * Each tile gets a *disjoint slice* of its shoot's photos (`idx % n === j`),
 * so two tiles showing the same person never show the same photograph — and
 * the slice is taken by stride rather than by chunk, so a tile draws from
 * across the whole session instead of four near-identical frames from the
 * same two minutes of it.
 *
 * A tile's link is its shoot, decided here and fixed. Linking to whichever
 * photo happens to be showing would move the destination under the cursor.
 */
export function categoryTeaserTiles(
  category: PhotoCategory,
  count = 4
): CategoryTeaserTile[] {
  const shoots = shootsByCategory(category);
  if (shoots.length === 0) return [];

  // Interleave the shoots so consecutive pool entries are different people.
  // Dealing the pool out by stride then puts a different face in each tile
  // from the first frame, instead of tile 1 spending its first minute on
  // one long gallery while tile 2 waits its turn.
  const perShoot = shoots.map((shoot) =>
    // Every photo is fair game here, unlike the hero: heroEligible is about
    // a 21:9 banner cropping a face out, and these tiles are portrait.
    shoot.photos.map((photo) => ({
      ...photo,
      name: shoot.subjectName ?? shoot.title,
    }))
  );

  const pool: TeaserPhoto[] = [];
  for (let i = 0; ; i++) {
    const row = perShoot.map((photos) => photos[i]).filter(Boolean);
    if (row.length === 0) break;
    pool.push(...row);
  }
  if (pool.length === 0) return [];

  // Tiles are NOT bound to one person any more. Each cycles through the
  // whole category so the wall reads as a rotation of everyone Ryan has
  // shot, with the caption naming whoever is currently showing. Clicking
  // goes to the category's directory rather than to whichever gallery
  // happened to be on screen — picking a person should be a decision, not
  // a matter of waiting for their photo to come round.
  return Array.from({ length: count }, (_, i) => ({
    key: `tile-${i}`,
    photos:
      pool.length >= count
        ? pool.filter((_, idx) => idx % count === i)
        : // Fewer photos than tiles: repeat rather than leave a hole. A
          // category with one photo shows that photo four times, which the
          // client explicitly preferred to an empty or ragged row until
          // there are more sessions to show.
          [pool[i % pool.length]],
  }));
}
