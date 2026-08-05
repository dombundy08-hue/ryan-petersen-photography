import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "@/lib/base-path";

interface AboutSettingsFile {
  photo: string;
  morePhotos?: string[];
}

/**
 * Read from content/settings/about.json — managed by the admin panel
 * (public/admin/, "Site Settings" > "About Page"). Ryan uploads his photo
 * there and it shows up here on the next rebuild.
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
