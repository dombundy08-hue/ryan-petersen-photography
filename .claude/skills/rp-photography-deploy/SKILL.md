---
name: rp-photography-deploy
description: Deploy this site to GitHub Pages, audit the live (not just local) result for real bugs, and fix what's found. Adapted from mission-companion's deploy skill — same push/build/ground-truth-the-live-site discipline, without the Supabase-specific half (this project has no backend).
---

# RP Photography — Deploy & Audit

Run this whenever changes need to go live, or when something looks broken on
the deployed site and the cause isn't obvious yet. Three steps, run in order.

## Step 1 — Deploy

```bash
cd "C:\Users\shan_\Ryan's Site"
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue   # PowerShell
$env:GH_PAGES_BASE_PATH = "/ryan-petersen-photography"
$env:NEXT_PUBLIC_SITE_URL = "https://dombundy08-hue.github.io/ryan-petersen-photography"
npm run build
```
Then:
```bash
rm -rf docs/* docs/.nojekyll
cp -r out/. docs/
cp public/.nojekyll docs/.nojekyll
git add -A && git commit -m "Deploy: <what changed>" && git push origin master
gh api -X POST repos/dombundy08-hue/ryan-petersen-photography/pages/builds
```
(`gh` may need the full path — `C:\Program Files\GitHub CLI\gh.exe` — if it's
not on the current shell's `$env:Path`.)

Wait for the build to actually finish before auditing — poll rather than
guess:
```bash
until gh api repos/dombundy08-hue/ryan-petersen-photography/pages/builds/latest --jq '.status' | grep -qE '^(built|errored)$'; do sleep 5; done
```

## Step 2 — Audit the LIVE site, not just local

**The bug that motivated this skill (2026-08-04):** the hero carousel and
"What I shoot" photos rendered fine in local dev but were broken `<img>`
icons on the live GitHub Pages URL. Local dev never catches this class of
bug because `basePath` is empty locally — it only exists in the GH Pages
build. **Always verify against the actual deployed URL after every deploy,
not just `npm run dev`.**

Ground-truth checklist — fetch the live URL fresh (cache-busted, see the
caching note below) and check:

1. **Every `<img src="...">` in the rendered HTML starts with
   `/ryan-petersen-photography/`** (or is a full `https://` URL). Any local
   image missing that prefix is broken — this is exactly today's bug.
   `next/image` with `images.unoptimized: true` does **not** auto-prefix
   local `public/` paths with `basePath`, unlike `next/link` (which does) and
   Next's own file-convention assets like `favicon.ico` (which also do).
   **Fix pattern:** route every local image path through
   `withBasePath()` (`src/lib/base-path.ts`) — never hand-write a raw
   `/images/...` string in a component.
2. **`og:image`, `twitter:image`, and any other absolute URL in `<head>`**
   actually resolve — check they point at the real live domain
   (`NEXT_PUBLIC_SITE_URL`), not a placeholder/future domain that 404s.
3. **Console errors** on each of the 4 pages (Home, About, Portfolio,
   Contact) — fetch+eval isn't enough for this one, use the Browser pane's
   `read_console_messages` after a real navigation.
4. **`docs/.nojekyll` exists** and every `_next/` asset returns 200 (not a
   Jekyll-swallowed 404) — check a couple of hashed chunk URLs directly.
5. **`docs/404.html` exists** and isn't stale (matches the current build's
   hashed asset filenames) — even though this site isn't client-side-routed
   today, a future SPA-shaped addition would silently break without this.
6. **Responsive**: no horizontal scroll at 375/768/1024/1440 — check
   `document.documentElement.scrollWidth` vs `window.innerWidth` via the live
   URL, not local.
7. **Contrast**: any new/changed color pair against the actual CSS variables
   in `src/app/globals.css` — recompute, don't assume the last check still
   holds after a palette change.

**Caching gotcha:** GitHub Pages serves `Cache-Control: max-age=600`. Verify
what the *origin* is serving with a cache-busted fetch before concluding
anything is still broken:
```js
fetch(url + '?nocache=' + Date.now(), { cache: 'no-store' }).then(r => r.text())
```
If the origin check shows the fix but a browser tab still shows old content,
that's client-side cache — say so and give a `?v=N` link, don't re-debug the
deploy.

## Step 3 — Fix, redeploy, re-verify

For each bug found: fix the source (never hand-edit anything under `docs/`
directly — it's generated, edits there get overwritten by the next build),
rerun Step 1, rerun the specific Step 2 check that caught it. Don't declare
it fixed from reading the diff — re-fetch the live URL and confirm.

## Lessons log

- **2026-08-04 — basePath not applied to unoptimized `next/image` local
  srcs.** Hero carousel + "What I shoot" cards showed broken image icons on
  the live GH Pages URL (worked fine locally, where basePath is empty).
  Root cause: `images: { unoptimized: true }` in `next.config.ts` makes
  `next/image` skip the loader pipeline that would otherwise prefix `src`
  with `basePath` — `next/link` and Next's file-convention assets
  (`favicon.ico`) don't have this gap, only raw `public/` image paths passed
  to `<Image>` do. Fixed by centralizing all image paths through
  `withBasePath()` in `src/lib/base-path.ts` (`src/lib/photos.ts` maps every
  entry through it once, so no call site can forget). **General pattern**:
  any static-export + GitHub-Pages-subpath deploy using `next/image` needs
  this same fix — it's not specific to this project.
- **2026-08-04 — `og:image` pointed at a placeholder future domain.**
  `NEXT_PUBLIC_SITE_URL` defaulted to `ryanpetersenphotography.com` (not
  registered yet) instead of the actual live GitHub Pages URL, so social
  share previews would have 404'd. Fixed by setting
  `NEXT_PUBLIC_SITE_URL` explicitly in the deploy build (Step 1) — update it
  again once a real domain exists.
- **2026-08-05 — mounting every photo in a carousel's pool crashed mobile
  browsers (page flashes then goes blank/white).** `HeroCarousel`,
  `PhotoCarousel`, and `CategoryFeatureTile` each rendered one `<Image>` per
  photo in their entire pool, toggling opacity to show/hide — none ever
  unmounted. Combined with `images.unoptimized: true` (every `<Image>`
  decodes its full-resolution source regardless of display size, since
  static export has no server-side resize pipeline), Home's hero alone
  (`allPhotos`, ~75 photos at ~2400x1600px, ~15MB decoded each) could hold
  over 1GB of decoded bitmap data resident simultaneously — well past
  mobile Safari/Chrome's per-tab memory budget, so the tab's process gets
  killed by the OS and the page goes blank. This only reproduces on the
  live deployed URL on an actual mobile device or under real memory
  pressure — desktop dev and the Browser pane tool both have far more
  headroom and won't show it. Fixed by only ever mounting the current +
  outgoing photo (two-layer bounded crossfade) in all three components,
  and capping `ContactPhotoMarquee`'s unique-photo pool (48 → 16) since it
  can't use that trick — it shows many photos at once by design. **General
  pattern**: any crossfade/carousel over a large photo pool with
  `images.unoptimized: true` must bound how many `<Image>` elements are
  mounted at once, not just how many are *visible* — opacity-0 still
  decodes and holds full memory.
