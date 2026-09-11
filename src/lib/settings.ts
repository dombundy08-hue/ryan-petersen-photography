import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "@/lib/base-path";

interface AboutSettingsFile {
  photo: string;
  morePhotos?: string[];
}

/**
 * Read from content/settings/about.json. Edited in the repo, not through the
 * admin portal — the portal only manages photo shoots.
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
