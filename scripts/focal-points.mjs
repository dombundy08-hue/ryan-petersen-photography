#!/usr/bin/env node
/**
 * Build-time focal point extraction.
 *
 * Every photo on the site is displayed through `object-fit: cover` in a box
 * whose aspect ratio (21:9 hero, 4:5 profile card, 3:4 portrait tile) rarely
 * matches the photo's own. Without a per-photo `object-position`, the browser
 * centres the crop and faces get sliced off. This script computes one focal
 * point per image at build time and writes it to
 * `content/generated/focal-points.json`, which `src/lib/focal-points.ts` reads.
 *
 * How the focal point is found, in order of preference:
 *
 *   1. Skin-tone segmentation. The image is shrunk to a 200px working copy,
 *      lightly blurred, and each pixel tested against a conjunction of three
 *      classic skin rules (normalised RGB, R>G>B ordering, YCbCr Cb/Cr box)
 *      plus highlight/shadow rejection. The mask is eroded twice to kill the
 *      scattered warm-background pixels (golden-hour foliage, brick, blown
 *      sky) that survive any single rule, then connected components are
 *      labelled. Components are scored by area with a bias toward the top of
 *      the frame, so a head outranks a hand or forearm; every component within
 *      35% of the winner's score joins the result, which keeps group shots
 *      centred between the faces rather than on one of them. The focal point
 *      is that union's centroid, lifted by a fraction of the blob height so it
 *      lands around the eyes rather than the mouth.
 *
 *   2. sharp's `attention` crop strategy, for images with no detectable skin
 *      (landscapes, detail shots). Two crops - an extremely wide band and an
 *      extremely tall one - localise the attention peak on each axis
 *      independently via `cropOffsetTop` / `cropOffsetLeft`. The raw answer is
 *      pulled halfway back toward the frame centre, because attention happily
 *      locks onto a bright sky edge and a landscape has no "wrong" centre the
 *      way a portrait does.
 *
 *   3. The default, for anything that fails outright.
 *
 * The result is clamped so no detection, however wrong, can produce a wildly
 * broken crop.
 *
 * Usage:
 *   node scripts/focal-points.mjs            # incremental (skips known images)
 *   node scripts/focal-points.mjs --force    # recompute everything
 *   node scripts/focal-points.mjs --verbose  # per-image logging
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const OUT_FILE = path.join(ROOT, "content", "generated", "focal-points.json");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".gif"]);

/** Working copy size. Big enough to resolve a face, small enough to be fast. */
const WORK_SIZE = 200;

/** Fallback when nothing at all can be determined. */
export const DEFAULT_OBJECT_POSITION = "50% 35%";

/** Clamp range, as fractions. A bad detection can never escape this box. */
const CLAMP_X = [0.15, 0.85];
const CLAMP_Y = [0.1, 0.75];

// ---------------------------------------------------------------------------
// Skin segmentation
// ---------------------------------------------------------------------------

/**
 * Conjunction of three skin-colour rules plus exposure gates. Each rule alone
 * is far too permissive on warm outdoor photography; together they hold.
 */
function skinMask(data, width, height) {
  const mask = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < width * height; i++, p += 3) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    const sum = r + g + b;
    if (sum < 120) continue; // near-black

    // Normalised RGB: chromaticity of skin sits in a tight box.
    const nr = r / sum;
    const ng = g / sum;
    if (nr < 0.36 || nr > 0.465) continue;
    if (ng < 0.28 || ng > 0.345) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 18) continue; // grey / washed out
    if (max > 246) continue; // blown highlight
    if (r <= g || g < b) continue; // skin is always R > G >= B

    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    if (y < 45 || y > 232) continue;

    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    if (cb < 80 || cb > 126) continue;
    if (cr < 137 || cr > 176) continue;

    mask[i] = 1;
  }
  return mask;
}

/** 3x3 binary erosion. Removes the one- and two-pixel background speckle. */
function erode(mask, width, height) {
  const out = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!mask[i]) continue;
      let keep = true;
      for (let dy = -1; dy <= 1 && keep; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!mask[i + dy * width + dx]) {
            keep = false;
            break;
          }
        }
      }
      if (keep) out[i] = 1;
    }
  }
  return out;
}

/** 4-connected component labelling with an explicit stack (no recursion). */
function connectedComponents(mask, width, height) {
  const seen = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  const components = [];

  for (let start = 0; start < width * height; start++) {
    if (!mask[start] || seen[start]) continue;

    let top = 0;
    stack[top++] = start;
    seen[start] = 1;

    let area = 0;
    let sumX = 0;
    let sumY = 0;
    let minY = height;
    let maxY = 0;
    let minX = width;
    let maxX = 0;

    while (top > 0) {
      const i = stack[--top];
      const x = i % width;
      const y = (i / width) | 0;

      area++;
      sumX += x;
      sumY += y;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;

      if (x > 0 && mask[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stack[top++] = i - 1; }
      if (x < width - 1 && mask[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stack[top++] = i + 1; }
      if (y > 0 && mask[i - width] && !seen[i - width]) { seen[i - width] = 1; stack[top++] = i - width; }
      if (y < height - 1 && mask[i + width] && !seen[i + width]) { seen[i + width] = 1; stack[top++] = i + width; }
    }

    components.push({
      area,
      cx: sumX / area,
      cy: sumY / area,
      top: minY,
      boxWidth: maxX - minX + 1,
      boxHeight: maxY - minY + 1,
    });
  }

  return components;
}

/**
 * Pick the face(s) out of the labelled skin blobs and return a focal point in
 * fractional image coordinates, or null when nothing is convincing.
 */
function focalFromSkin(components, width, height) {
  const pixels = width * height;
  // A face at 200px working size is comfortably >= 40px. Anything under is
  // noise, an ear, or a knuckle.
  const minArea = Math.max(30, pixels * 0.0015);
  const candidates = components.filter((c) => {
    if (c.area < minArea) return false;
    // A lake horizon, a sunlit hillside or a warm sky gradient survives the
    // colour test but comes out as a long thin streak. No head is that flat.
    const aspect = c.boxWidth / c.boxHeight;
    if (aspect > 3 || aspect < 0.28) return false;
    if (c.boxWidth > width * 0.8 || c.boxHeight > height * 0.8) return false;
    // A blob, not a lattice of scattered pixels sharing a bounding box.
    if (c.area / (c.boxWidth * c.boxHeight) < 0.22) return false;
    return true;
  });
  if (candidates.length === 0) return null;

  // The head is the topmost skin on a body - always above the hands, forearms,
  // knees and shins, which are individually much larger and would otherwise
  // win on area alone. So anchor on the highest blob that is big enough to be
  // a head rather than a knuckle, and read the focal point from the band of
  // skin at that height.
  const largest = Math.max(...candidates.map((c) => c.area));
  const anchorable = candidates.filter((c) => c.area >= largest * 0.12);
  const anchor = anchorable.reduce((a, b) => (b.top < a.top ? b : a));

  // A head whose top edge is in the bottom third of the frame would leave no
  // body in shot - in practice this is sunlit decking, a dirt path or a
  // gravel shoulder, not a person. Hand those to the attention fallback.
  if (anchor.top > height * 0.7) return null;

  // Everyone in a group portrait has their head at roughly the same height, so
  // the band keeps a family shot centred between the faces while excluding the
  // torso below.
  const winners = candidates.filter(
    (c) => c.top <= anchor.top + height * 0.2 && c.area >= anchor.area * 0.2
  );

  let weight = 0;
  let sumX = 0;
  let sumY = 0;
  let sumHeight = 0;
  for (const c of winners) {
    weight += c.area;
    sumX += c.cx * c.area;
    sumY += c.cy * c.area;
    sumHeight += c.boxHeight * c.area;
  }

  const cx = sumX / weight;
  const cy = sumY / weight;
  // The mask catches the lit part of the face, whose centroid sits low
  // (cheeks/mouth). Lift by a fraction of the blob height to land nearer the
  // eyes, which is where a viewer reads a portrait from.
  const blobHeight = sumHeight / weight;
  const lifted = cy - blobHeight * 0.22;

  return {
    x: cx / width,
    y: lifted / height,
    coverage: weight / pixels,
    faces: winners.length,
  };
}

// ---------------------------------------------------------------------------
// sharp attention fallback
// ---------------------------------------------------------------------------

/**
 * Localise sharp's attention peak on each axis. Cropping to an extreme aspect
 * ratio leaves the crop window free to slide almost the whole length of the
 * other axis, so `cropOffset*` reports the peak with very little edge clamping.
 */
async function focalFromAttention(raw, width, height, channels) {
  const input = () => sharp(raw, { raw: { width, height, channels } });

  const bandHeight = Math.max(2, Math.round(height * 0.06));
  const bandWidth = Math.max(2, Math.round(width * 0.06));

  const [wide, tall] = await Promise.all([
    input()
      .resize({ width, height: bandHeight, fit: "cover", position: sharp.strategy.attention })
      .raw()
      .toBuffer({ resolveWithObject: true }),
    input()
      .resize({ width: bandWidth, height, fit: "cover", position: sharp.strategy.attention })
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);

  const y = (Math.abs(wide.info.cropOffsetTop ?? 0) + bandHeight / 2) / height;
  const x = (Math.abs(tall.info.cropOffsetLeft ?? 0) + bandWidth / 2) / width;

  // Attention is a saliency heuristic, not a subject detector - it will happily
  // lock onto a bright sky edge. Halfway back to centre keeps the useful signal
  // and caps the damage when it is wrong.
  return { x: 0.5 + (x - 0.5) * 0.5, y: 0.5 + (y - 0.5) * 0.5 };
}

// ---------------------------------------------------------------------------
// Per-image pipeline
// ---------------------------------------------------------------------------

const clamp = (value, [lo, hi]) => Math.min(hi, Math.max(lo, value));
const pct = (value) => `${Number((value * 100).toFixed(2))}%`;

/**
 * @param {string} file absolute path to an image
 * @returns {Promise<{ objectPosition: string, x: number, y: number, source: string }>}
 */
/** Shrink to the working size. `normalise` rescues under-exposed dusk frames. */
function workingCopy(file, normalise) {
  let pipeline = sharp(file, { failOn: "none" })
    .rotate() // honour EXIF orientation, so coordinates match what a browser shows
    .resize({ width: WORK_SIZE, height: WORK_SIZE, fit: "inside", withoutEnlargement: true })
    .removeAlpha();
  if (normalise) pipeline = pipeline.normalise();
  return pipeline
    .blur(1) // suppress sensor noise before thresholding
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function detectSkin(data, width, height) {
  let mask = skinMask(data, width, height);
  mask = erode(mask, width, height);
  mask = erode(mask, width, height);
  return focalFromSkin(connectedComponents(mask, width, height), width, height);
}

export async function computeFocalPoint(file) {
  const work = await workingCopy(file, false);

  const { width, height, channels } = work.info;
  if (!width || !height || channels !== 3) {
    throw new Error(`unexpected working image: ${width}x${height}x${channels}`);
  }

  let point;
  let source;

  let skin = detectSkin(work.data, width, height);
  if (skin) {
    point = skin;
    source = skin.faces > 1 ? `skin(${skin.faces} subjects)` : "skin";
  } else {
    // Blue-hour and back-lit frames leave skin too dark for the colour test.
    // Auto-levelling the working copy recovers most of them; genuinely
    // monochrome or faceless images still find nothing, as they should.
    const boosted = await workingCopy(file, true);
    skin = detectSkin(boosted.data, boosted.info.width, boosted.info.height);
    if (skin) {
      point = skin;
      source = skin.faces > 1 ? `skin+levels(${skin.faces} subjects)` : "skin+levels";
    } else {
      point = await focalFromAttention(work.data, width, height, channels);
      source = "attention";
    }
  }

  const x = clamp(point.x, CLAMP_X);
  const y = clamp(point.y, CLAMP_Y);

  return { objectPosition: `${pct(x)} ${pct(y)}`, x, y, source };
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

/** Recursively list image files under `dir`, returning absolute paths. */
async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const found = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await listImages(full)));
    } else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(full);
    }
  }
  return found;
}

/** `/images/senior/dsc01904.jpg` - always forward slashes, on every platform. */
function publicKey(absolute) {
  const relative = path.relative(path.join(ROOT, "public"), absolute);
  return `/${relative.split(path.sep).join("/")}`;
}

async function readExisting() {
  try {
    const raw = await fs.readFile(OUT_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export async function main(argv = process.argv.slice(2)) {
  const force = argv.includes("--force");
  const verbose = argv.includes("--verbose") || argv.includes("-v");

  const started = Date.now();
  const files = await listImages(IMAGES_DIR);
  const existing = force ? {} : await readExisting();

  // Drop entries for images that no longer exist, so the manifest cannot rot.
  const live = new Set(files.map(publicKey));
  const manifest = {};
  for (const [key, value] of Object.entries(existing)) {
    if (live.has(key) && value && typeof value.objectPosition === "string") {
      manifest[key] = { objectPosition: value.objectPosition };
    }
  }

  let computed = 0;
  let failed = 0;

  for (const file of files) {
    const key = publicKey(file);
    if (manifest[key]) continue;

    try {
      const result = await computeFocalPoint(file);
      manifest[key] = { objectPosition: result.objectPosition };
      computed++;
      if (verbose) console.log(`  ${key} -> ${result.objectPosition} (${result.source})`);
    } catch (error) {
      // A single unreadable image must never fail the build. It simply gets no
      // entry, and the reader falls back to the default object-position.
      failed++;
      console.warn(`[focal-points] skipped ${key}: ${error.message}`);
    }
  }

  // Stable key order keeps the committed manifest out of the git diff.
  const sorted = {};
  for (const key of Object.keys(manifest).sort()) sorted[key] = manifest[key];

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, `${JSON.stringify(sorted, null, 2)}\n`, "utf-8");

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[focal-points] ${Object.keys(sorted).length} images in manifest ` +
      `(${computed} computed, ${files.length - computed - failed} cached, ${failed} failed) in ${seconds}s`
  );
}

// Only run when executed directly, so the probe/test harness can import it.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch(async (error) => {
    // A focal point is a nicety; a red deploy is not. If the whole pass falls
    // over (sharp missing a platform binary, an unreadable images directory)
    // make sure a manifest file exists so the static import in
    // src/lib/focal-points.ts still resolves, then let the build continue with
    // every consumer on its default object-position.
    console.error(`[focal-points] failed, falling back to defaults: ${error.stack ?? error.message}`);
    try {
      await fs.access(OUT_FILE);
    } catch {
      await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
      await fs.writeFile(OUT_FILE, "{}\n", "utf-8");
    }
  });
}
