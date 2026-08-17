#!/usr/bin/env node
/**
 * Post-build audit.
 *
 * Checks the BUILT output in out/, not the source, because the bugs that
 * matter are the ones that survive the build — a canonical inherited from
 * a layout, a sitemap that drifted from the routes, a theme whose text
 * fails on its own background.
 *
 * Design note on contrast: this reads the declared hex values out of
 * globals.css and does the maths, rather than sampling getComputedStyle in
 * a browser. Tailwind 4 emits `oklab(... / 0.7)` for alpha colours, and a
 * naive rgb parser reads those decimals as channel values — which is
 * exactly how a previous pass reported four failures that were not real.
 * Hex in, ratio out, no parsing ambiguity.
 *
 * Usage: npm run build && node scripts/audit.mjs
 * Exits non-zero if anything fails, so CI can gate on it.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";

/**
 * Routes that are built but are not content, and so are correctly absent
 * from the sitemap and correctly carry no canonical:
 *   /admin/       the Decap CMS panel
 *   /_not-found/  Next's 404
 * Flagging these was the audit's own first false positive. Anything added
 * here needs a reason, or the audit quietly stops checking real pages.
 */
const NON_CONTENT = [/^\/admin\//, /^\/_not-found\//, /^\/404/];
const isContent = (route) => !NON_CONTENT.some((re) => re.test(route));

const failures = [];
const warnings = [];
const notes = [];

const fail = (check, detail) => failures.push({ check, detail });
const warn = (check, detail) => warnings.push({ check, detail });

/* ---------- helpers ---------- */

function htmlFiles(dir = OUT, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** "out/about/index.html" -> "/about/" */
const routeOf = (file) =>
  "/" + relative(OUT, file).replace(/\\/g, "/").replace(/index\.html$/, "");

const srgb = (v) => {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

function luminance(hex) {
  const h = hex.replace("#", "").trim();
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  return (
    0.2126 * srgb((n >> 16) & 255) +
    0.7152 * srgb((n >> 8) & 255) +
    0.0722 * srgb(n & 255)
  );
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* ---------- 1. theme contrast, from the declared tokens ---------- */

/**
 * Resolve one level of var(--x) against :root.
 *
 * Grounds are declared once as --flow-* so a Bridge gradient can name two
 * of them without either theme being mounted, which means a theme's
 * --background is `var(--flow-dusk)`, not a literal. Without this the
 * audit fell back to the :root value and measured every dusk pairing
 * against the wrong colour — seven failures that were not real.
 */
function resolve(value, root) {
  const m = value.match(/^var\(\s*--([\w-]+)\s*\)$/);
  return m ? (root[m[1]] ?? value) : value;
}

function auditThemes() {
  const css = readFileSync("src/app/globals.css", "utf8");

  // EVERY :root block, not just the first. The ground values live in a
  // separate :root from the base palette, and reading only the first one
  // left --flow-* undefined — so var(--flow-slate) failed to resolve and
  // the audit reported it as an unparseable token.
  const root = {};
  for (const [, block] of css.matchAll(/:root\s*\{([\s\S]*?)\}/g))
    for (const [, k, v] of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})/g))
      root[k] = v;

  const themes = [...css.matchAll(/\[data-theme="(\w[\w-]*)"\]\s*\{([\s\S]*?)\}/g)];
  if (themes.length === 0) fail("themes", "no [data-theme] blocks found");

  // Pairs that must hold in every theme. 4.5 is AA for body text.
  const PAIRS = [
    ["foreground", "background", 4.5],
    ["muted-foreground", "background", 4.5],
    ["muted-foreground", "muted", 4.5],
    ["card-foreground", "card", 4.5],
    ["primary", "background", 3.0], // used for links/accents, not body copy
    ["primary-foreground", "primary", 4.5],
    ["secondary-foreground", "secondary", 4.5],
    ["accent-foreground", "accent", 4.5],
    ["destructive", "background", 4.5],
  ];

  for (const [, name, body] of themes) {
    const t = { ...root };
    // Every declaration, then check it parsed. A token written as oklch()
    // or var() would otherwise keep the :root value and the audit would
    // measure a colour the page never renders — passing a failing theme.
    for (const [, k, v] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      const val = resolve(v.trim(), root);
      if (/^#[0-9a-fA-F]{3,8}$/.test(val)) t[k] = val;
      else
        fail(
          "themes",
          `theme "${name}": --${k} resolves to "${val}", not hex — this audit can only verify hex`
        );
    }

    for (const [fg, bg, min] of PAIRS) {
      if (!t[fg] || !t[bg]) continue;
      const r = contrast(t[fg], t[bg]);
      if (r < min)
        fail(
          "contrast",
          `theme "${name}": --${fg} ${t[fg]} on --${bg} ${t[bg]} = ${r.toFixed(2)}:1 (needs ${min})`
        );
    }
    // --border and --input must move together. A theme that restyles its
    // borders but leaves --input inherits the root hue, which is how the
    // contact page ended up with brown field borders in a slate section.
    const sets = (tok) => new RegExp(`--${tok}\s*:`).test(body);
    if (sets("border") && !sets("input"))
      fail(
        "themes",
        `theme "${name}" overrides --border but not --input — form fields will keep the root hue`
      );

    notes.push(
      `theme "${name}": fg/bg ${contrast(t.foreground, t.background).toFixed(1)}:1`
    );
  }
}

/* ---------- 2. canonicals ---------- */

function auditCanonicals(pages) {
  const seen = new Map();
  for (const { route, html } of pages) {
    if (!isContent(route)) continue;
    const m = html.match(/<link rel="canonical" href="([^"]+)"/);
    if (!m) {
      fail("canonical", `${route} has no canonical`);
      continue;
    }
    const url = m[1];
    if (seen.has(url))
      fail(
        "canonical",
        `${route} and ${seen.get(url)} share a canonical (${url}) — one is declaring itself a duplicate of the other`
      );
    else seen.set(url, route);

    // Unique and slash-terminated is not enough: a typo'd canonical
    // pointing at a page that doesn't exist passes both of those.
    const declared = new URL(url).pathname;
    if (declared !== route)
      fail(
        "canonical",
        `${route} declares its canonical as ${declared} — they must match`
      );

    if (!url.endsWith("/"))
      warn("canonical", `${route} canonical lacks a trailing slash: ${url}`);
  }
}

/* ---------- 3. structured data ---------- */

function auditJsonLd(pages) {
  for (const { route, html } of pages) {
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
      ),
    ];
    for (const [, raw] of blocks) {
      try {
        const data = JSON.parse(raw);
        if (!data["@context"] || !data["@type"])
          fail("json-ld", `${route}: block missing @context or @type`);
        // An empty string in schema is a claim of "" — should be pruned.
        const empties = JSON.stringify(data).match(/:""/g);
        if (empties)
          fail("json-ld", `${route}: ${empties.length} empty value(s) not pruned`);
      } catch (e) {
        fail("json-ld", `${route}: does not parse — ${e.message}`);
      }
    }
  }
}

/* ---------- 4. sitemap vs reality ---------- */

function auditSitemap(pages) {
  const path = join(OUT, "sitemap.xml");
  if (!existsSync(path)) return fail("sitemap", "no sitemap.xml in out/");

  const xml = readFileSync(path, "utf8");
  const listed = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, u]) =>
      new URL(u).pathname
    )
  );

  const real = pages.map((p) => p.route).filter(isContent);

  for (const r of real)
    if (!listed.has(r))
      fail("sitemap", `${r} exists but is missing from the sitemap`);

  for (const l of listed)
    if (!real.includes(l))
      fail("sitemap", `sitemap lists ${l} but no such page was built`);
}

/* ---------- 5. images ---------- */

function auditImages(pages) {
  let missingAlt = 0;
  for (const { route, html } of pages) {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\salt=/.test(tag)) {
        missingAlt++;
        fail("alt", `${route}: an <img> has no alt attribute`);
      } else if (/\salt=""/.test(tag) && !/aria-hidden="true"/.test(tag)) {
        // Empty alt is correct only for decoration, which must say so.
        warn("alt", `${route}: <img alt=""> that is not aria-hidden`);
      }
    }
  }
  if (missingAlt === 0) notes.push("every <img> has an alt attribute");
}

/* ---------- 6. internal links resolve ---------- */

function auditLinks(pages) {
  const routes = new Set(pages.map((p) => p.route));
  // next.config.ts supports a GH Pages basePath, which prefixes every
  // internal href. Without stripping it, every link on every page reads
  // as broken — a false failure across the whole site.
  const base = process.env.GH_PAGES_BASE_PATH ?? "";
  const strip = (h) => (base && h.startsWith(base) ? h.slice(base.length) || "/" : h);

  for (const { route, html } of pages) {
    for (const [, raw] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const href = strip(raw);
      const target = href.endsWith("/") ? href : `${href}/`;
      if (
        routes.has(target) ||
        href.startsWith("/_next") ||
        href.startsWith("/images") ||
        existsSync(join(OUT, href))
      )
        continue;
      fail("link", `${route} links to ${href} which was not built`);
    }
  }
}

/* ---------- 7. indexing guard ---------- */

function auditIndexing(pages) {
  const robots = existsSync(join(OUT, "robots.txt"))
    ? readFileSync(join(OUT, "robots.txt"), "utf8")
    : "";
  const disallowed = /Disallow:\s*\/\s*$/m.test(robots);
  // Every content page, not just home — one page with a stray
  // page-level noindex while robots.txt allows crawling is exactly the
  // drift this check exists to catch.
  const content = pages.filter((p) => isContent(p.route));
  const flagged = content.filter((p) =>
    /<meta name="robots" content="[^"]*noindex/.test(p.html)
  );
  if (flagged.length && flagged.length !== content.length)
    fail(
      "indexing",
      `${flagged.length} of ${content.length} pages carry noindex — it should be all or none`
    );
  const noindex = flagged.length === content.length && content.length > 0;

  // These two must agree. A disallowed page can still be indexed if
  // something links to it, so robots.txt alone is not the guard.
  if (disallowed !== noindex)
    fail(
      "indexing",
      `robots.txt ${disallowed ? "blocks" : "allows"} crawling but pages ${noindex ? "carry" : "omit"} noindex — pick one`
    );
  else
    notes.push(
      disallowed
        ? "pre-launch: robots.txt Disallow + noindex, consistent"
        : "live: indexable, no noindex"
    );
}

/* ---------- run ---------- */

if (!existsSync(OUT)) {
  console.error(`No ${OUT}/ — run "npm run build" first.`);
  process.exit(2);
}

const pages = htmlFiles().map((file) => ({
  file,
  route: routeOf(file),
  html: readFileSync(file, "utf8"),
}));

auditThemes();
auditCanonicals(pages);
auditJsonLd(pages);
auditSitemap(pages);
auditImages(pages);
auditLinks(pages);
auditIndexing(pages);

const line = "─".repeat(60);
console.log(`\n${line}\nAUDIT — ${pages.length} pages\n${line}`);
for (const n of notes) console.log(`  · ${n}`);

if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length})`);
  for (const w of warnings) console.log(`  ~ [${w.check}] ${w.detail}`);
}

if (failures.length) {
  console.log(`\nFAILURES (${failures.length})`);
  for (const f of failures) console.log(`  ✗ [${f.check}] ${f.detail}`);
  console.log(`\n${line}\nFAILED\n`);
  process.exit(1);
}

console.log(`\n${line}\nPASSED — no failures\n`);
