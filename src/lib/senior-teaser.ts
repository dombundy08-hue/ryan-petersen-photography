import { shootsByCategory, type Photo } from "./shoots";

const SLOT_COUNT = 5;

export interface SeniorTeaserEntry {
  kind: "real" | "placeholder";
  name: string;
  slug?: string;
  photo?: Photo;
}

/**
 * The pool of senior "people" tiles shown on the portfolio overview's
 * teaser grid and the /portfolio/senior directory — real shoots first,
 * padded out to SLOT_COUNT with generic "coming soon" placeholders (never
 * fabricated photos/identities) so the section reads as intentionally
 * full even with few real sessions on file.
 */
export function seniorTeaserPool(): SeniorTeaserEntry[] {
  const real: SeniorTeaserEntry[] = shootsByCategory("senior")
    .slice(0, SLOT_COUNT)
    .map((shoot) => ({
      kind: "real",
      name: shoot.subjectName ?? shoot.title,
      slug: shoot.slug,
      photo: shoot.photos.find((p) => p.heroEligible !== false) ?? shoot.photos[0],
    }));

  const placeholders: SeniorTeaserEntry[] = Array.from(
    { length: Math.max(0, SLOT_COUNT - real.length) },
    () => ({ kind: "placeholder", name: "Coming Soon" })
  );

  return [...real, ...placeholders];
}
