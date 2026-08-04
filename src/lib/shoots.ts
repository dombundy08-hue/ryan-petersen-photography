import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "@/lib/base-path";

export type PhotoCategory = "senior" | "family" | "nature";

export interface Photo {
  src: string;
  alt: string;
}

export interface Shoot {
  slug: string;
  category: PhotoCategory;
  title: string;
  description: string;
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

/** Every photo across every shoot, flattened — used by the home hero carousel. */
export const allPhotos: (Photo & { category: PhotoCategory })[] =
  shoots.flatMap((shoot) =>
    shoot.photos.map((photo) => ({ ...photo, category: shoot.category }))
  );
