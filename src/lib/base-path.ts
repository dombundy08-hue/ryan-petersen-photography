/**
 * GitHub Pages serves this static export from /ryan-petersen-photography/,
 * not the domain root. next/image with images.unoptimized:true does NOT
 * auto-prefix local `public/` image paths with next.config.ts's basePath
 * (unlike JS/CSS/font assets, which the build pipeline prefixes correctly) —
 * so any src read from public/ must be run through this helper by hand.
 */
const basePath = process.env.GH_PAGES_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}
