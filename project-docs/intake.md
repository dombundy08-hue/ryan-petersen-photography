# Intake — RyanShutter (formerly RP Photography)

Completed: 2026-08-04 · Last updated: 2026-08-04
Status: ⏳ partial (see Open Items below)

## Source legend
🗣 asked directly in chat this session · 🔎 inferred from earlier session context
(not re-asked) · 📄 read from an existing file/old site on disk or at a URL ·
➖ not applicable, skipped · ⏳ deferred — real data pending from user

---

## A. Business & Brand

| Field | Value | Source |
|---|---|---|
| Name | RyanShutter (brand, renamed from RP Photography) — photographer is Ryan Petersen | 🗣 |
| What it does | Senior, family, and nature photography. New business, no formal history yet. | 📄 |
| Industry/category | Photography — local service / portfolio | 📄 |
| Target audience | Families, couples, seniors, people marking a special milestone | 📄 |
| Primary site goal | Showcase portfolio, generate booking inquiries | 📄 (inferred) |
| Tone/personality | Relaxed, honest, fun, local, genuine (drawn from his bio/vision answers) | 🔎 |
| Brand guidelines already fixed? | No — open for design system to propose. Wants neutral tones with one bright accent color. | 📄 |
| Reference sites/competitors | Not provided | ⏳ |

## B. Old Site / Migration

| Field | Value | Source |
|---|---|---|
| Replacing an existing site? | No — no existing site, no active domain | 🗣 |

## C. Products / Services

| Field | Value | Source |
|---|---|---|
| Sells/lists items? | Services (photo sessions) | 📄 |
| Approx. count | N/A — no formal packages yet | 📄 |
| Structure | Free right now; packages/special offers planned for the future | 📄 |
| Commerce type | Informational only (no cart/checkout) | 📄 |
| Catalog source | ➖ | ➖ |

## D. Site Structure

| Field | Value | Source |
|---|---|---|
| Single or multi-page | Multi-page | 🗣 |
| Pages/sections wanted | Home, About, Portfolio/Gallery, Contact. Testimonials & pricing folded into existing pages as short "coming soon" notes rather than standalone pages. | 🗣 |
| Ported 1:1 vs. reimagined | ➖ (no old site) | ➖ |

## E. Content Readiness

| Field | Value | Source |
|---|---|---|
| Copy readiness | Partial — About page bio is essentially complete; other sections need short copy derived from his answers | 📄 |
| Existing material provided | Full first-person About Me bio, business description, differentiator (all-manual shooter), customer journey, vision/key message | 📄 |
| Testimonials available | None yet — no reviews so far | 📄 |

> This section is a readiness signal only. Actual per-section body copy is
> still collected fresh in Phase 4 per Hard Rule #3 — this file never
> substitutes for that.

## F. Visual Assets & Brand Identity

| Field | Value | Source |
|---|---|---|
| Logo | None — not mentioned | ⏳ |
| Brand colors | Revised 2026-08-04: dark, editorial — near-black warm background + gold accent + cream text (was a light neutral+orange palette originally). Researched against 3 reference sites the client provided. | 🗣 |
| Fonts | Revised 2026-08-04: Fraunces (headings) + Inter (body) — was Archivo + Space Grotesk originally | 🗣 |
| Photography | All AI-generated demo photos replaced with Ryan's real photos (108-photo senior session, family session, nature, owner headshots). Managed via `content/shoots/*.json` (read by `src/lib/shoots.ts`), one file per shoot — not hardcoded in `src/lib/photos.ts` anymore. | 🗣 |
| Style guide doc | None | ➖ |

## G. Technical Preferences

| Field | Value | Source |
|---|---|---|
| PWA | Not requested — skipped | 🗣 |
| Domain/hosting | No active domain, no host provided. Nothing will be auto-deployed. | 📄 |
| Integrations | None specified (no booking tool, no analytics mentioned) | ⏳ |
| Compliance target | Baseline WCAG AA only (skill default) | ➖ |

## H. Contact & Social / Legal

| Field | Value | Source |
|---|---|---|
| Contact info | Email: rpetersen2008@gmail.com · Phone: (720) 600-8854 | 📄 |
| Social links | None provided | ⏳ |
| Legal pages needed | Skipped for now — brand-new small business, no formal policies yet | 🗣 |
| Legal text | ➖ | ➖ |

---

## Open Items
- City/region unknown — site currently uses generic "local" language instead of a
  specific city for local SEO. Update once Ryan provides a location.
- No social media links provided.
- No logo — design system uses a text-based wordmark treatment ("RyanShutter").
- Contact form (`src/components/contact-form.tsx`) posts to Web3Forms but
  `NEXT_PUBLIC_WEB3FORMS_KEY` was never obtained — user needs a free key from
  web3forms.com before submissions actually deliver email.
- Admin panel (Decap CMS, `public/admin/`) is scaffolded but not functional yet —
  needs Netlify account setup (connect repo, enable Identity + Git Gateway, invite
  Ryan's email). See `references/content-management.md` in the build-website skill.

## Grow-it history
- 2026-08-04: Initial build from CSV intake form + user's answers to the
  build-website pre-build questionnaire (stack, GitHub setup, placeholder photos,
  page scope).
- 2026-08-04: Redesign — dark editorial palette, Fraunces/Inter fonts, full-bleed
  hero photo carousel, 6 demo images generated via nano-banana-2, per client
  direction referencing 3 photography sites (Sheila Broderick Photography, Little
  White Photo Studio, Belle Amour Boudoir).
- 2026-08-04: Rebranded RP Photography → RyanShutter. Replaced all AI-generated
  demo photos with Ryan's real photos (moved to a content-file model,
  `content/shoots/*.json` + `content/settings/about.json`, so a future Decap CMS
  admin panel can manage them directly). Added a "Requested" tile to Home's What I
  Shoot section. Wired the contact form to Web3Forms (key still pending). Scaffolded
  a Decap CMS admin panel for Ryan (Netlify Identity/Git Gateway setup still
  pending). Portfolio pages now size dynamically to however many real photos exist
  per shoot instead of placeholder filler tiles. About page redesigned twice —
  settled on a single owner photo (no collage, no car-photo strip, no "Behind the
  camera" block). Contact page background got a photo marquee (several iterations —
  landed on straight horizontal rows drifting across the full page, not a spiral).
- 2026-08-05: Adopted a "one page at a time" review pass (now the build-website
  skill's default mode for grow-it work) and went through Home, About, and Portfolio
  in turn. Home: hero now shuffles photos client-side per visit instead of a fixed
  order, expanded the hero-eligible photo pool from 9 to 75 site-wide (visually
  reviewed all 108 Dominic photos), added a progressive section-brightening
  background ramp (bg-muted -> bg-secondary -> bg-border -> bg-[#5C4F3E]). About:
  owner photo is now a small carousel cycling through all 5 stored owner photos
  (same fixed size as before), same background ramp technique (2 steps). Portfolio:
  restructured Senior into a 5-tile randomized teaser linking to a new
  /portfolio/senior directory page (real subjects "Dominic" and "Avian" + generic
  "Coming Soon" placeholders, never fake identities); Family/Nature featured tiles
  now cycle through every photo in the category instead of one static image; same
  background ramp. Fixed face-cropping across all cycling photo components by
  anchoring crops toward faces (a new per-photo `objectPosition` field was needed
  for the Family tile, whose two photos require different crop anchors in the wide
  21:9 box). Shared a `PhotoCarousel` component between Home/About/Portfolio instead
  of duplicating the crossfade logic a third time.
