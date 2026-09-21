/**
 * Build plugin: before `npm run build`, rewrite content/shoots/ (and the
 * About page photo list in content/settings/about.json) from Netlify Blobs and
 * copy the photos they use into public/media/.
 *
 * The admin portal (public/admin/ + netlify/functions/admin-api.mjs) saves
 * profiles to the `shoots` store and photos to the `media` store, then fires
 * the build hook. This plugin is the other half: it turns that stored content
 * back into the plain JSON files and static photos the Next.js static export
 * already knows how to build — so no page code had to change, and every
 * photo still goes through the Image CDN.
 *
 * BEFORE THE FIRST SEED: a build may read site-wide Blobs stores but not
 * write them, so seeding is done by the admin function (ensureSeeded in
 * netlify/admin-core.mjs) the first time the portal is used. Until the
 * `seeded` marker exists this plugin leaves the committed content/shoots/
 * alone; after it, the store is the source of truth and the committed files
 * are ignored on Netlify (they are still what `next dev` shows locally).
 *
 * If Blobs can't be read the build fails on purpose. Building from the
 * committed seed instead would quietly bring back profiles Ryan hid or
 * deleted; a failed build just leaves the last good deploy live.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getStore } from "@netlify/blobs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SHOOTS_DIR = path.join(ROOT, "content", "shoots");
const MEDIA_DIR = path.join(ROOT, "public", "media");
const ABOUT_FILE = path.join(ROOT, "content", "settings", "about.json");
const MEDIA_SRC = /^\/media\/([a-z0-9-]{8,40}\/[A-Za-z0-9_-]{12}\.jpg)$/;
const DOWNLOADS_AT_ONCE = 8;

const photoSrc = (photo) => (typeof photo === "string" ? photo : photo?.src);

/**
 * Blobs is configured automatically inside a build; strong consistency is
 * preferred so a build fired the instant a profile is saved can't miss it.
 * The explicit site/token form is the documented fallback for builds.
 */
async function openStores(constants) {
  const attempts = [{ consistency: "strong" }];
  if (constants.SITE_ID && constants.NETLIFY_API_TOKEN) {
    attempts.push({ siteID: constants.SITE_ID, token: constants.NETLIFY_API_TOKEN });
  }
  attempts.push({});

  let lastError;
  for (const options of attempts) {
    try {
      const shoots = getStore({ name: "shoots", ...options });
      await shoots.list();
      return {
        shoots,
        media: getStore({ name: "media", ...options }),
        admin: getStore({ name: "admin", ...options }),
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function downloadAll(media, keys) {
  const missing = new Set();
  let index = 0;
  async function worker() {
    while (index < keys.length) {
      const key = keys[index++];
      const dest = path.join(MEDIA_DIR, ...key.split("/"));
      const data = await media.get(key, { type: "arrayBuffer" });
      if (!data) {
        missing.add(key);
        continue;
      }
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(data));
    }
  }
  await Promise.all(Array.from({ length: DOWNLOADS_AT_ONCE }, worker));
  return missing;
}

/**
 * The About Me photos, saved from the portal's About Me category. Independent
 * of the shoots seed: until Ryan saves them once there is no `about` record and
 * the committed content/settings/about.json stands. Other keys in that file
 * are kept as they are.
 */
async function syncAbout(stores) {
  const about = await stores.admin.get("about", { type: "json" });
  if (!Array.isArray(about?.photos)) return "";

  const mediaKeys = about.photos.map((src) => MEDIA_SRC.exec(src ?? "")?.[1]).filter(Boolean);
  const missing = await downloadAll(stores.media, mediaKeys);
  const photos = about.photos.filter((src) => {
    const key = MEDIA_SRC.exec(src ?? "")?.[1];
    return !key || !missing.has(key);
  });

  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(ABOUT_FILE, "utf-8"));
  } catch {
    /* no file yet: start from empty */
  }
  await fs.mkdir(path.dirname(ABOUT_FILE), { recursive: true });
  const next = { ...existing, photo: photos[0] ?? "", morePhotos: photos.slice(1) };
  await fs.writeFile(ABOUT_FILE, `${JSON.stringify(next, null, 2)}\n`);
  return `${photos.length} About Me photos` + (missing.size ? ` (${missing.size} missing and skipped)` : "");
}

export const onPreBuild = async ({ constants, utils }) => {
  try {
    const stores = await openStores(constants);
    const aboutNote = await syncAbout(stores);
    if (aboutNote) console.log(`content-from-blobs: ${aboutNote}`);

    if (!(await stores.admin.get("seeded"))) {
      console.log("content-from-blobs: admin portal not used yet, building from committed content/shoots/");
      return;
    }

    const { blobs } = await stores.shoots.list();
    const records = (
      await Promise.all(blobs.map((blob) => stores.shoots.get(blob.key, { type: "json" })))
    ).filter((record) => record?.slug && record?.category && Array.isArray(record.photos));

    const mediaKeys = [
      ...new Set(
        records
          .flatMap((record) => record.photos.map(photoSrc))
          .map((src) => MEDIA_SRC.exec(src ?? "")?.[1])
          .filter(Boolean)
      ),
    ];
    const missing = await downloadAll(stores.media, mediaKeys);

    // Replace the committed seed with exactly what's in the store.
    for (const file of await fs.readdir(SHOOTS_DIR)) {
      if (file.endsWith(".json")) await fs.unlink(path.join(SHOOTS_DIR, file));
    }
    for (const record of records) {
      // A photo whose file has gone missing is dropped rather than shipped as
      // a broken image.
      const photos = record.photos.filter((photo) => {
        const key = MEDIA_SRC.exec(photoSrc(photo) ?? "")?.[1];
        return !key || !missing.has(key);
      });
      await fs.writeFile(
        path.join(SHOOTS_DIR, `${record.slug}.json`),
        `${JSON.stringify({ ...record, photos }, null, 2)}\n`
      );
    }

    const hidden = records.filter((record) => record.hidden).length;
    console.log(
      `content-from-blobs: ${records.length} profiles (${hidden} hidden), ` +
        `${mediaKeys.length - missing.size} uploaded photos copied` +
        (missing.size ? `, ${missing.size} missing and skipped` : "")
    );
  } catch (error) {
    utils.build.failBuild(
      "content-from-blobs: could not read profiles from Netlify Blobs, so the build was stopped " +
        "to avoid publishing stale content. The previous deploy is still live.",
      { error }
    );
  }
};
