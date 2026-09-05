/**
 * Next.js custom image loader → Netlify Image CDN.
 *
 * This is a static export, so there is no Next image optimization server.
 * Without a loader every `<Image>` serves the original file: the portfolio
 * hero tile was shipping a 422 KB, 2400px-wide JPEG to a 390px phone, which
 * put Largest Contentful Paint at 6.0s and Lighthouse Performance at 66.
 *
 * Netlify's Image CDN resizes and re-encodes on demand at `/.netlify/images`,
 * negotiating WebP/AVIF from the request's Accept header. The same photo at
 * `w=640` is 79 KB as JPEG and 49 KB as WebP.
 *
 * Only used when NEXT_PUBLIC_NETLIFY_IMAGES is set (see netlify.toml). Local
 * dev and any GitHub Pages build fall back to `unoptimized: true` in
 * next.config.ts, because `/.netlify/images` exists only on Netlify — a build
 * that pointed at it from anywhere else would 404 every image on the site.
 */
export default function netlifyImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Remote images are already someone else's problem; pass them through
  // rather than asking the CDN to proxy them.
  if (/^https?:\/\//i.test(src)) return src;

  const params = new URLSearchParams({
    url: src.startsWith("/") ? src : `/${src}`,
    w: String(width),
  });
  params.set("q", String(quality ?? 75));

  return `/.netlify/images?${params.toString()}`;
}
