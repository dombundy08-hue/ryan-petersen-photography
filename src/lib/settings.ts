import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "@/lib/base-path";

interface AboutSettingsFile {
  photo: string;
  morePhotos?: string[];
}

/**
 * Read from content/settings/about.json. On Netlify the photo list is
 * rewritten before every build from the admin portal's "About Me" category
 * (netlify/plugins/content-from-blobs); the committed file is the seed and
 * what `next dev` shows locally. An empty `photo` shows the placeholder.
 */
function loadAboutSettings(): AboutSettingsFile {
  const filePath = path.join(
    process.cwd(),
    "content",
    "settings",
    "about.json"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as AboutSettingsFile;
}

const aboutSettings = loadAboutSettings();

export const aboutPhoto: string | null = aboutSettings.photo
  ? withBasePath(aboutSettings.photo)
  : null;

export const aboutMorePhotos: string[] = (aboutSettings.morePhotos ?? []).map(
  withBasePath
);
