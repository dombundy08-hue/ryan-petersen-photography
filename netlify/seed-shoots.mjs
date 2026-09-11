/**
 * The shoots that existed before the admin portal, bundled into the admin
 * function (esbuild inlines the JSON). On first use the function copies them
 * into the `shoots` Blobs store — see ensureSeeded in admin-core.mjs.
 *
 * This has to happen in a function: Netlify lets a build read site-wide
 * Blobs stores but not write to them.
 */
import autumnSeniorSession from "../content/shoots/autumn-senior-session.json";
import ballfieldSunset from "../content/shoots/ballfield-sunset.json";
import dominickSeniorSession from "../content/shoots/dominick-senior-session.json";
import lakesideFamilySession from "../content/shoots/lakeside-family-session.json";
import samuraiDetail from "../content/shoots/samurai-detail.json";

export const SEED_SHOOTS = [
  autumnSeniorSession,
  ballfieldSunset,
  dominickSeniorSession,
  lakesideFamilySession,
  samuraiDetail,
];
