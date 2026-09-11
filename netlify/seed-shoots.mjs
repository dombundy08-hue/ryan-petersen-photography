/**
 * The shoots that existed before the admin portal, bundled into the admin
 * function (esbuild inlines the JSON). On first use the function copies them
 * into the `shoots` Blobs store — see ensureSeeded in admin-core.mjs.
 *
 * This has to happen in a function: Netlify lets a build read site-wide
 * Blobs stores but not write to them.
 *
 * These are frozen copies in netlify/seed/, NOT content/shoots/. Once the
 * store is seeded, the build plugin rewrites content/shoots/ from it before
 * functions are bundled, so importing from there broke the bundle.
 */
import autumnSeniorSession from "./seed/autumn-senior-session.json";
import ballfieldSunset from "./seed/ballfield-sunset.json";
import dominickSeniorSession from "./seed/dominick-senior-session.json";
import lakesideFamilySession from "./seed/lakeside-family-session.json";
import samuraiDetail from "./seed/samurai-detail.json";

export const SEED_SHOOTS = [
  autumnSeniorSession,
  ballfieldSunset,
  dominickSeniorSession,
  lakesideFamilySession,
  samuraiDetail,
];
