import type { NextConfig } from "next";

// GitHub Pages serves this repo from /ryan-petersen-photography/, not the
// domain root, so the base path only applies to the deployed build — local
// dev keeps basePath "" via GH_PAGES_BASE_PATH being unset.
const basePath = process.env.GH_PAGES_BASE_PATH ?? "";

/**
 * Netlify's Image CDN resizes and re-encodes on demand at /.netlify/images,
 * which is the only image optimization available to a static export. It
 * exists ONLY on Netlify, so every other build (local dev, a GitHub Pages
 * build) has to keep serving originals — pointing at that path from
 * anywhere else would 404 every image on the site. Netlify sets the flag
 * in netlify.toml; nothing else does.
 */
const useNetlifyImages = process.env.NEXT_PUBLIC_NETLIFY_IMAGES === "1";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: useNetlifyImages
    ? { loader: "custom", loaderFile: "./src/lib/netlify-image-loader.ts" }
    : { unoptimized: true },
};

export default nextConfig;
