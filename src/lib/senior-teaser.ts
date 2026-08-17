import { shootsByCategory, type Photo } from "./shoots";

const SLOT_COUNT = 5;

export interface SeniorTeaserEntry {
  kind: "real";
  name: string;
  slug: string;
  photo?: Photo;
}

/**
 * The senior sessions Ryan has actually shot, one entry per person.
 *
 * Previously this padded the list out to SLOT_COUNT with "Coming Soon"
 * tiles so the grid looked full. Those are gone: empty placeholders
 * advertise that there is barely any work here, which is the opposite of
 * what the section is for. A short row of real people reads better than a
 * long row that is mostly nothing.
 */
export function seniorTeaserPool(): SeniorTeaserEntry[] {
  return shootsByCategory("senior")
    .slice(0, SLOT_COUNT)
    .map((shoot) => ({
      kind: "real" as const,
      name: shoot.subjectName ?? shoot.title,
      slug: shoot.slug,
      photo:
        shoot.photos.find((p) => p.heroEligible !== false) ?? shoot.photos[0],
    }));
}

/**
 * One representative photo per senior, for the portfolio's featured tile.
 *
 * The tile cycles across *people* rather than across every photo, so two
 * shots of the same person never follow each other — each fade shows a
 * different senior.
 */
export function seniorFeaturePhotos() {
  return shootsByCategory("senior")
    .map((shoot) => {
      const photo =
        shoot.photos.find((p) => p.heroEligible !== false) ?? shoot.photos[0];
      if (!photo) return null;
      return {
        ...photo,
        shootSlug: shoot.slug,
        shootTitle: shoot.subjectName ?? shoot.title,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}
