/**
 * The admin portal's API — every request from public/admin/admin.js lands
 * here. Sign-in, the profile list, photo upload, save, hide/unhide, delete,
 * and the Account (username/password) change.
 *
 * Mutating requests must carry `x-rs-admin: 1`. A cross-site form or image
 * tag cannot set a custom header, and the session cookie is SameSite=Strict,
 * so together they shut out cross-site request forgery.
 */
import crypto from "node:crypto";
import {
  CATEGORIES,
  CLEARED_COOKIE,
  MEDIA_SRC,
  autoPublishEnabled,
  clearFailedLogins,
  createSessionCookie,
  ensureSeeded,
  getCredential,
  inBatches,
  json,
  mediaStore,
  minutesLocked,
  photoSrc,
  publishSite,
  readJson,
  readSession,
  recordFailedLogin,
  saveCredential,
  shootsStore,
  slugify,
  verifyPassword,
} from "../admin-core.mjs";

// Netlify's synchronous functions accept ~6 MB of request body, and binary
// bodies are base64-encoded on the way in, so 4.5 MB of JPEG is the safe
// ceiling. The portal resizes to 2400 px before sending, which is ~0.5–2 MB.
const MAX_PHOTO_BYTES = 4.5 * 1024 * 1024;
const MAX_PHOTOS_PER_SHOOT = 600;
const DRAFT_ID = /^[a-z0-9-]{8,40}$/;
const SLUG = /^[a-z0-9-]{1,80}$/;

const clean = (value, max) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export default async (req, context) => {
  const url = new URL(req.url);
  const [route, id] = url.pathname.replace(/^\/api\/admin\/?/, "").split("/").filter(Boolean);
  const method = req.method;

  try {
    if (method !== "GET" && method !== "HEAD") {
      if (req.headers.get("x-rs-admin") !== "1") return json({ error: "Bad request." }, 400);
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin) return json({ error: "Bad request origin." }, 403);
    }

    if (route === "login" && method === "POST") return await login(req, context);
    if (route === "session" && method === "GET") return await session(req);
    if (route === "logout" && method === "POST") {
      return json({ ok: true }, 200, { "Set-Cookie": CLEARED_COOKIE });
    }

    const credential = await readSession(req);
    if (!credential) {
      return json({ error: "Please sign in again." }, 401, { "Set-Cookie": CLEARED_COOKIE });
    }

    if (route === "account" && method === "POST") return await changeAccount(req, credential);
    if (route === "shoots") await ensureSeeded();
    if (route === "shoots" && !id && method === "GET") return await listShoots();
    if (route === "shoots" && !id && method === "POST") return await createShoot(req);
    if (route === "shoots" && id && method === "PATCH") return await setHidden(id, req);
    if (route === "shoots" && id && method === "DELETE") return await deleteShoot(id);
    if (route === "photos" && method === "POST") return await uploadPhoto(req, url);
    if (route === "publish" && method === "POST") return json(await publishSite("publish now"));

    return json({ error: "Not found." }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: "Something went wrong on the server. Try again in a minute." }, 500);
  }
};

export const config = { path: "/api/admin/*" };

// ---------------------------------------------------------------------------

async function login(req, context) {
  const ip = context.ip;
  const wait = await minutesLocked(ip);
  if (wait) {
    return json({ error: `Too many wrong tries. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` }, 429);
  }

  const body = await readJson(req);
  const username = clean(body.username, 64).toLowerCase();
  const password = String(body.password ?? "").slice(0, 200);
  const credential = await getCredential();

  // Always run the hash check, so a wrong username takes as long as a wrong
  // password and the response time gives nothing away.
  const passwordOk = await verifyPassword(password, credential.hash);
  if (!passwordOk || username !== credential.username) {
    await recordFailedLogin(ip);
    return json({ error: "That username and password don't match." }, 401);
  }

  await clearFailedLogins(ip);
  return json({ ok: true }, 200, { "Set-Cookie": await createSessionCookie(credential) });
}

async function session(req) {
  const credential = await readSession(req);
  if (!credential) return json({ signedIn: false });
  return json({
    signedIn: true,
    username: credential.username,
    starterPassword: credential.source === "starter",
    passwordInNetlify: credential.source === "env",
    autoPublish: autoPublishEnabled(),
  });
}

async function changeAccount(req, credential) {
  if (credential.source === "env") {
    return json(
      {
        error:
          "This password is set in Netlify (the ADMIN_PASSWORD_HASH environment variable). Change it there, or delete that variable to manage the password here.",
      },
      409
    );
  }
  const body = await readJson(req);
  const current = String(body.currentPassword ?? "");
  const next = String(body.newPassword ?? "");
  const username = clean(body.username || credential.username, 64).toLowerCase();

  if (!(await verifyPassword(current, credential.hash))) {
    return json({ error: "Your current password isn't right." }, 403);
  }
  if (!/^[a-z0-9._@-]{3,64}$/.test(username)) {
    return json({ error: "Usernames can use letters, numbers, dots, dashes and @ — 3 to 64 characters." }, 400);
  }
  if (next.length < 10 || next.length > 200) {
    return json({ error: "Use at least 10 characters for the new password." }, 400);
  }

  const saved = await saveCredential(username, next);
  return json({ ok: true, username }, 200, { "Set-Cookie": await createSessionCookie(saved) });
}

// ---------------------------------------------------------------------------

async function allShoots() {
  const store = shootsStore();
  const { blobs } = await store.list();
  const records = await Promise.all(blobs.map((blob) => store.get(blob.key, { type: "json" })));
  return records.filter(Boolean);
}

async function listShoots() {
  const shoots = (await allShoots())
    .map((shoot) => ({
      slug: shoot.slug,
      title: shoot.title,
      category: shoot.category,
      subjectName: shoot.subjectName ?? "",
      hidden: Boolean(shoot.hidden),
      photoCount: shoot.photos?.length ?? 0,
      cover: photoSrc(shoot.photos?.[0]) ?? null,
      url: `/portfolio/${shoot.category}/${shoot.slug}/`,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return json({ shoots, autoPublish: autoPublishEnabled() });
}

async function createShoot(req) {
  const body = await readJson(req);
  const title = clean(body.title, 120);
  const subjectName = clean(body.subjectName, 60);
  const description = clean(body.description, 600);
  const category = String(body.category ?? "");
  const photos = Array.isArray(body.photos) ? body.photos : [];

  if (!title) return json({ error: "Give the profile a title." }, 400);
  if (!CATEGORIES.includes(category)) return json({ error: "Pick a category." }, 400);
  if (photos.length === 0) return json({ error: "Add at least one photo." }, 400);
  if (photos.length > MAX_PHOTOS_PER_SHOOT) {
    return json({ error: `A profile can hold up to ${MAX_PHOTOS_PER_SHOOT} photos.` }, 400);
  }
  if (!photos.every((src) => typeof src === "string" && MEDIA_SRC.test(src))) {
    return json({ error: "One of the photos didn't upload properly. Remove it and try again." }, 400);
  }

  const store = shootsStore();
  const { blobs } = await store.list();
  const taken = new Set(blobs.map((blob) => blob.key));
  const base = slugify(title) || `${category}-session`;
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

  const record = {
    title,
    slug,
    category,
    description,
    ...(subjectName ? { subjectName } : {}),
    hidden: false,
    createdAt: new Date().toISOString(),
    photos,
  };
  await store.setJSON(slug, record);

  const publish = await publishSite(`added "${title}"`);
  return json({ ok: true, slug, url: `/portfolio/${category}/${slug}/`, ...publish }, 201);
}

async function setHidden(slug, req) {
  if (!SLUG.test(slug)) return json({ error: "Not found." }, 404);
  const store = shootsStore();
  const record = await store.get(slug, { type: "json" });
  if (!record) return json({ error: "That profile no longer exists." }, 404);

  const body = await readJson(req);
  if (typeof body.hidden !== "boolean") return json({ error: "Bad request." }, 400);

  record.hidden = body.hidden;
  record.updatedAt = new Date().toISOString();
  await store.setJSON(slug, record);

  const publish = await publishSite(`${body.hidden ? "hid" : "unhid"} "${record.title}"`);
  return json({ ok: true, hidden: record.hidden, ...publish });
}

async function deleteShoot(slug) {
  if (!SLUG.test(slug)) return json({ error: "Not found." }, 404);
  const store = shootsStore();
  const record = await store.get(slug, { type: "json" });
  if (!record) return json({ error: "That profile no longer exists." }, 404);

  await store.delete(slug);

  // Photos uploaded through the portal go with it. Photos committed to the
  // repo (/images/...) belong to the code, not to Blobs, and are left alone.
  const media = mediaStore();
  const keys = (record.photos ?? [])
    .map(photoSrc)
    .filter((src) => src && MEDIA_SRC.test(src))
    .map((src) => src.slice("/media/".length));
  await inBatches(keys, 20, (key) => media.delete(key));

  const publish = await publishSite(`deleted "${record.title}"`);
  return json({ ok: true, ...publish });
}

async function uploadPhoto(req, url) {
  const draft = url.searchParams.get("draft") ?? "";
  if (!DRAFT_ID.test(draft)) return json({ error: "Bad upload." }, 400);
  if ((req.headers.get("content-type") || "").split(";")[0] !== "image/jpeg") {
    return json({ error: "Photos have to be sent as JPEG." }, 415);
  }

  const buffer = await req.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) return json({ error: "That photo arrived empty." }, 400);
  if (bytes.length > MAX_PHOTO_BYTES) return json({ error: "That photo is too large." }, 413);
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) {
    return json({ error: "That file isn't a JPEG photo." }, 415);
  }

  const key = `${draft}/${crypto.randomBytes(9).toString("base64url")}.jpg`;
  await mediaStore().set(key, buffer, {
    metadata: { contentType: "image/jpeg", uploadedAt: new Date().toISOString() },
  });
  return json({ src: `/media/${key}` }, 201);
}
