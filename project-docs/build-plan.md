# Build Plan — RyanShutter

Source: `project-docs/intake.md`. Design tokens: `design-system/ryan-petersen-photography/MASTER.md`.
Stack: Next.js (App Router) + Tailwind v4 + shadcn/ui, static export to GitHub Pages.

> Original plan below is from the first build (placeholder photos, no real
> content). The site has since been rebuilt with Ryan's real photos and
> content — see intake.md's Grow-it history for what actually shipped. This
> doc is being used going forward as the per-page work log for one-page-at-a-
> time edits (current skill default).

## Shared shell (Phase 5)
- `src/components/navbar.tsx` — logo/wordmark ("Ryan Petersen Photography"), links to
  Home / About / Portfolio / Contact, mobile menu via shadcn `Sheet`, "Book a Session"
  CTA button (primary/accent color) linking to Contact.
- `src/components/footer.tsx` — wordmark, contact email/phone, copyright line. No
  social links yet (none provided).
- `src/components/section.tsx` — small layout helper for consistent section padding
  per the design system's spacing scale.

## Pages

### Home (`src/app/page.tsx`)
- **Hero**: Headline built from his vision statement — "Creating memorable moments,
  one photo at a time." Subhead: senior, family & nature photography, honest and
  local. Two CTAs: "View My Work" (→ Portfolio), "Book a Session" (→ Contact).
- **Specialty cards** (3): Senior Photos / Family Photos / Nature Photos — short
  one-line description each, linking to that category on the Portfolio page.
- **What makes it different**: fully manual shooter — no auto settings — so every
  photo's light and mood is intentional, not left to the camera.
- **How it works** (from his customer-journey answer): Reach Out → We Talk It
  Through → Book Your Session → Session Day → Edited Gallery Delivered → (he follows
  up afterward, no action needed from the visitor).
- **Pricing note**: "Sessions are free right now while I grow my portfolio — paid
  packages are coming soon." Framed as a limited-time opportunity, not apologetic.
- **Testimonials placeholder**: small "Reviews coming soon — be one of my first!"
  callout instead of fake quotes (he has zero reviews so far — Hard Rule #3, never
  invent testimonials).
- **Closing CTA** → Contact.

### About (`src/app/about/page.tsx`)
- Use Ryan's own first-person bio from the form close to verbatim (intro → what
  working with him is like → hobbies (hiking, cars, sports, gaming) → thank-you
  closing). Light formatting into paragraphs/pull-quote, no rewriting the voice.
- Small "Behind the camera" fact strip: fully manual shooting style, local, new
  business built on care and honesty.

### Portfolio / Gallery (`src/app/portfolio/page.tsx`)
- Three category sections: Senior / Family / Nature.
- No real photos available yet → each tile is a labeled placeholder (gradient/SVG,
  distinct treatment per category, e.g. warm tones for Senior, soft tones for Family,
  green/earth tones for Nature) with alt text like "Senior portrait — sample coming
  soon" so it never reads as a broken image. Clearly documented in code as a
  placeholder to swap for real photos.
- Short intro line per category using his own words (senior/family/nature photos).

### Contact (`src/app/contact/page.tsx`)
- Contact form: name, email, phone (optional), session type (select: Senior/Family/
  Nature/Other), message. Client-side only for now (no backend wired — note this at
  handoff; a real submit endpoint is a follow-up, not invented here).
- Direct contact info: rpetersen2008@gmail.com, (720) 600-8854.
- Short note reflecting his journey answer: "I respond personally to every inquiry."

## Images (Phase 6 sourcing)
No real photography available (`docs/intake.md` Open Items). Portfolio tiles and hero
background use CSS gradient/SVG placeholders drawn from the design system's palette —
no nano-banana-2 generation, no stock URLs, per Hard Rule #2.

## Motion
Style tier from MASTER.md: Motion-Driven / Standard. Scroll-reveal on section entry,
hover states 200-300ms, respect `prefers-reduced-motion`. Keep it restrained — this is
a portfolio site, not a heavy animation showcase; motion should support the photos,
not compete with them.

## SEO (Phase 7)
Per-page titles/descriptions emphasizing "photographer" + service type; generic
"local" language (no city provided yet — flagged in intake Open Items). One shared OG
image (design-system palette, wordmark). `sitemap.xml`, `robots.txt`.
