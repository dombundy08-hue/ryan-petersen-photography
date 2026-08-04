import type { NextConfig } from "next";

// GitHub Pages serves this repo from /ryan-petersen-photography/, not the
// domain root, so the base path only applies to the deployed build — local
// dev keeps basePath "" via GH_PAGES_BASE_PATH being unset.
const basePath = process.env.GH_PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
