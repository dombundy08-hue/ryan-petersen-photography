/**
 * The descent: golden hour at the top of a page, night at the bottom.
 *
 * Every page walks some contiguous slice of this order, and a <Bridge>
 * carries the eye across each join. Sections must appear in this order —
 * skipping backwards (night then clay) is the hard cut the whole scheme
 * exists to avoid.
 */
export const GROUNDS = ["sun", "clay", "dusk", "slate", "night"] as const;

export type Ground = (typeof GROUNDS)[number];

/** Position in the descent, for asserting a page runs downward. */
export const depthOf = (g: Ground): number => GROUNDS.indexOf(g);
