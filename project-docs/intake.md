# Intake — Ryan Petersen Photography

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
| Name | RP Photography (brand) — photographer is Ryan Petersen | 🗣 |
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
| Photography | 6 AI-generated demo photos in place (2 each: senior/family/nature, via nano-banana-2, `src/lib/photos.ts`) so the hero carousel and portfolio grid can be previewed — these are stand-ins, not Ryan's real work. Real photos replace them the same way: drop the file in `public/images/<category>/` and add one entry to `src/lib/photos.ts`. | 🗣 |
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
- Hero carousel and portfolio grid currently show 6 AI-generated demo photos, not
  Ryan's real work — swap via `src/lib/photos.ts` once real photos are ready (see
  Visual Assets above for the exact steps).
- No logo — design system uses a text-based wordmark treatment ("RP Photography").

## Grow-it history
- 2026-08-04: Initial build from CSV intake form + user's answers to the
  build-website pre-build questionnaire (stack, GitHub setup, placeholder photos,
  page scope).
- 2026-08-04: Redesign — dark editorial palette, Fraunces/Inter fonts, full-bleed
  hero photo carousel, 6 demo images generated via nano-banana-2, per client
  direction referencing 3 photography sites (Sheila Broderick Photography, Little
  White Photo Studio, Belle Amour Boudoir).
