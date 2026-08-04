import { withBasePath } from "@/lib/base-path";

export type PhotoCategory = "senior" | "family" | "nature";

export interface Photo {
  src: string;
  alt: string;
  category: PhotoCategory;
}

/**
 * Demo images for design preview — AI-generated stand-ins, not Ryan's real
 * work. Swap these out once real photos are ready.
 *
 * To add a real photo later: drop the file in public/images/<category>/
 * and add one entry below (path, category, a short descriptive alt). Every
 * page that shows photos (home hero, portfolio) reads from this one list.
 * Paths here are root-relative to public/ — withBasePath() below handles
 * the GitHub Pages /ryan-petersen-photography/ prefix automatically, don't
 * add it by hand.
 */
const PHOTO_SOURCES: Photo[] = [
  {
    src: "/images/senior/senior-1.jpg",
    alt: "Senior portrait in warm golden-hour light",
    category: "senior",
  },
  {
    src: "/images/senior/senior-2.jpg",
    alt: "Senior portrait against a rustic wall",
    category: "senior",
  },
  {
    src: "/images/family/family-1.jpg",
    alt: "Family laughing together in a golden field",
    category: "family",
  },
  {
    src: "/images/family/family-2.jpg",
    alt: "Parents embracing a toddler near autumn trees",
    category: "family",
  },
  {
    src: "/images/nature/nature-1.jpg",
    alt: "Misty mountain forest at golden hour",
    category: "nature",
  },
  {
    src: "/images/nature/nature-2.jpg",
    alt: "Winding river through an autumn canyon",
    category: "nature",
  },
];

export const photos: Photo[] = PHOTO_SOURCES.map((photo) => ({
  ...photo,
  src: withBasePath(photo.src),
}));

export function photosByCategory(category: PhotoCategory): Photo[] {
  return photos.filter((photo) => photo.category === category);
}
