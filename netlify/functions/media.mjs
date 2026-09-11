/**
 * Serves photos uploaded through the admin portal, straight out of Netlify
 * Blobs, at /media/<draft id>/<photo id>.jpg.
 *
 * This is the fallback, not the main path. Every build copies the photos a
 * live shoot uses into the deploy as real static files (see
 * netlify/plugins/content-from-blobs), and `preferStatic` makes Netlify serve
 * those first — so the Image CDN can resize them like any other photo. This
 * function only answers for photos uploaded since the last build, which is
 * what the admin portal's thumbnails need.
 */
import { getStore } from "@netlify/blobs";

const KEY = /^[a-z0-9-]{8,40}\/[A-Za-z0-9_-]{12}\.jpg$/;

export default async (req) => {
  const key = new URL(req.url).pathname.replace(/^\/media\//, "");
  if (!KEY.test(key)) return new Response("Not found", { status: 404 });

  const photo = await getStore({ name: "media", consistency: "strong" }).get(key, {
    type: "stream",
  });
  if (!photo) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return new Response(photo, {
    headers: {
      "Content-Type": "image/jpeg",
      // Photo ids are random and never reused, so a photo at a given URL
      // never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config = { path: "/media/*", preferStatic: true };
