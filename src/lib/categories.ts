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

export interface CategoryTeaserTile {
  key: string;
  /** The shoot this tile links to. Fixed — it never changes as photos cycle. */
  slug: string;
  name: string;
  photos: Photo[];
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

  const buckets = shoots.map((shoot, shootIndex) => {
    // Round-robin share: the first (count % shoots.length) shoots get one extra.
    const tileCount =
      Math.floor(count / shoots.length) +
      (shootIndex < count % shoots.length ? 1 : 0);

    return Array.from({ length: tileCount }, (_, j) => ({
      key: `${shoot.slug}-${j}`,
      slug: shoot.slug,
      name: shoot.subjectName ?? shoot.title,
      // Every photo is fair game here, unlike the hero: heroEligible is about
      // a 21:9 banner cropping a face out, and these tiles are portrait.
      photos: shoot.photos.filter((_, idx) => idx % tileCount === j),
    })).filter((tile) => tile.photos.length > 0);
  });

  // Interleave the buckets so tile order alternates between people.
  const tiles: CategoryTeaserTile[] = [];
  for (let j = 0; tiles.length < count; j++) {
    const row = buckets.map((b) => b[j]).filter(Boolean);
    if (row.length === 0) break;
    tiles.push(...row);
  }
  return tiles.slice(0, count);
}
