/**
 * Server-side core of the admin portal (public/admin/). Everything here runs
 * inside Netlify Functions and keeps its state in Netlify Blobs, so the portal
 * needs no GitHub account, no database and no third-party service — it moves
 * with the Netlify site when the site is transferred.
 *
 * Stores (all site-wide, strongly consistent):
 *   shoots  one JSON record per profile, keyed by slug — the source of truth
 *           the build reads (netlify/plugins/content-from-blobs)
 *   media   uploaded photos, keyed "<draft id>/<photo id>.jpg"
 *   admin   the login credential, the session-signing secret, failed-login
 *           counters, and the one-time "seeded" marker
 *
 * WHICH PASSWORD IS ACTIVE, in order:
 *   1. ADMIN_PASSWORD_HASH (+ optional ADMIN_USERNAME) in Netlify's
 *      environment variables — the recovery override. Make a hash with
 *      `node scripts/admin-password.mjs`.
 *   2. The credential saved from the portal's Account dialog.
 *   3. The starter credential in netlify/admin-bootstrap.mjs. Only its hash
 *      is in the repo; it stops working the moment a password is saved from
 *      the portal.
 * Changing the password rotates the credential's version, which signs every
 * existing session out.
 */
import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";
import { verifyPassword, hashPassword } from "./password-hash.mjs";
import { BOOTSTRAP_CREDENTIAL } from "./admin-bootstrap.mjs";

export { verifyPassword };

export const CATEGORIES = ["senior", "family", "nature", "custom"];

export const SESSION_COOKIE = "rs_admin";
const SESSION_TTL_S = 7 * 24 * 60 * 60;
// The cookie is only ever sent to the admin API, never with a page request.
const COOKIE_ATTRS = "Path=/api/admin; HttpOnly; Secure; SameSite=Strict";

const LOCK_AFTER_FAILURES = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

export const shootsStore = () => getStore({ name: "shoots", consistency: "strong" });
export const mediaStore = () => getStore({ name: "media", consistency: "strong" });
const adminStore = () => getStore({ name: "admin", consistency: "strong" });

/** Photo src on a shoot record: a plain path, or {src, alt} on the hand-written ones. */
export const photoSrc = (photo) => (typeof photo === "string" ? photo : photo?.src);

/** A photo uploaded through the portal: /media/<draft id>/<12-char id>.jpg */
export const MEDIA_SRC = /^\/media\/([a-z0-9-]{8,40})\/([A-Za-z0-9_-]{12})\.jpg$/;

const fingerprint = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);

// ---------------------------------------------------------------------------
// Credential
// ---------------------------------------------------------------------------

export async function getCredential() {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (envHash) {
    return {
      username: (process.env.ADMIN_USERNAME || BOOTSTRAP_CREDENTIAL.username).trim().toLowerCase(),
      hash: envHash,
      version: `env-${fingerprint(envHash)}`,
      source: "env",
    };
  }
  const saved = await adminStore().get("credential", { type: "json" });
  if (saved?.hash) return { ...saved, source: "portal" };
  return {
    ...BOOTSTRAP_CREDENTIAL,
    version: `starter-${fingerprint(BOOTSTRAP_CREDENTIAL.hash)}`,
    source: "starter",
  };
}

export async function saveCredential(username, password) {
  const record = {
    username,
    hash: await hashPassword(password),
    version: crypto.randomBytes(12).toString("hex"),
    changedAt: new Date().toISOString(),
  };
  await adminStore().setJSON("credential", record);
  return { ...record, source: "portal" };
}

// ---------------------------------------------------------------------------
// Sessions — an HMAC-signed cookie; the secret is generated on first use and
// kept in Blobs, so there is no secret to configure anywhere.
// ---------------------------------------------------------------------------

let cachedSecret;

async function sessionSecret() {
  if (cachedSecret) return cachedSecret;
  const store = adminStore();
  let secret = await store.get("session-secret", { type: "text" });
  if (!secret) {
    await store.set("session-secret", crypto.randomBytes(32).toString("hex"));
    secret = await store.get("session-secret", { type: "text" });
  }
  cachedSecret = secret;
  return secret;
}

const sign = async (payload) =>
  crypto.createHmac("sha256", await sessionSecret()).update(payload).digest();

export async function createSessionCookie(credential) {
  const payload = Buffer.from(
    JSON.stringify({
      u: credential.username,
      v: credential.version,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S,
    })
  ).toString("base64url");
  const signature = (await sign(payload)).toString("base64url");
  return `${SESSION_COOKIE}=${payload}.${signature}; ${COOKIE_ATTRS}; Max-Age=${SESSION_TTL_S}`;
}

export const CLEARED_COOKIE = `${SESSION_COOKIE}=; ${COOKIE_ATTRS}; Max-Age=0`;

function readCookie(req, name) {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

/** The signed-in credential, or null. */
export async function readSession(req) {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await sign(payload);
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data?.exp || data.exp < Date.now() / 1000) return null;

  const credential = await getCredential();
  if (data.v !== credential.version || data.u !== credential.username) return null;
  return credential;
}

// ---------------------------------------------------------------------------
// Failed-login lockout, per IP: 5 wrong tries locks that address for 15 min.
// ---------------------------------------------------------------------------

const lockKey = (ip) => `lock/${fingerprint(ip || "unknown")}`;

export async function minutesLocked(ip) {
  const record = await adminStore().get(lockKey(ip), { type: "json" });
  if (record?.until && record.until > Date.now()) {
    return Math.ceil((record.until - Date.now()) / 60000);
  }
  return 0;
}

export async function recordFailedLogin(ip) {
  const store = adminStore();
  const key = lockKey(ip);
  const now = Date.now();
  let record = await store.get(key, { type: "json" });
  if (!record || now - record.first > LOCK_WINDOW_MS) record = { fails: 0, first: now };
  record.fails += 1;
  if (record.fails >= LOCK_AFTER_FAILURES) {
    record = { fails: 0, first: now, until: now + LOCK_WINDOW_MS };
  }
  await store.setJSON(key, record);
}

export async function clearFailedLogins(ip) {
  await adminStore().delete(lockKey(ip));
}

// ---------------------------------------------------------------------------
// Publishing — a Netlify build hook. The build pulls the latest shoots and
// photos out of Blobs (netlify/plugins/content-from-blobs) and redeploys.
// ---------------------------------------------------------------------------

export const autoPublishEnabled = () => Boolean(process.env.BUILD_HOOK_URL);

export async function publishSite(reason) {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) return { autoPublish: false, triggered: false };
  const url = `${hook}${hook.includes("?") ? "&" : "?"}trigger_title=${encodeURIComponent(
    `Admin portal: ${reason}`.slice(0, 120)
  )}`;
  try {
    const res = await fetch(url, { method: "POST" });
    return { autoPublish: true, triggered: res.ok };
  } catch (error) {
    console.error("Build hook failed", error);
    return { autoPublish: true, triggered: false };
  }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function readJson(req) {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

/** "Dominic's Senior Session" -> "dominics-senior-session" */
export function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Run `fn` over `items`, `size` at a time. */
export async function inBatches(items, size, fn) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}
