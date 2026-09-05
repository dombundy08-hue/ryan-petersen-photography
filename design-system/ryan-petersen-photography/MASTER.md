# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Ryan Petersen Photography
**Generated:** 2026-08-04 12:10:00
**Category:** Photography Studio

---

## Global Rules

### Color Palette

> Revised 2026-08-04 per client request: darker, more editorial — photos
> should be the star. Researched against 3 reference photography sites
> (Sheila Broderick Photography, Little White Photo Studio, Belle Amour
> Boudoir) — all three share a dark/black canvas, a warm accent against it,
> and a distinctive serif headline paired with a clean readable sans. Near-
> black warm background (not pure `#000`) + warm gold accent (not the prior
> burnt-orange, which read too "construction" against black) + warm cream
> text. Contrast-checked: all pairs exceed 7:1 (AAA).

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary/Accent (CTA) | `#D3A054` | `--color-primary` |
| On Primary | `#171310` | `--color-on-primary` |
| Secondary (dark surface) | `#2A241D` | `--color-secondary` |
| Background | `#100D0A` | `--color-background` |
| Foreground | `#F3EDE3` | `--color-foreground` |
| Card | `#1B1712` | `--color-card` |
| Muted | `#221D18` | `--color-muted` |
| Muted Foreground | `#B7AA98` | `--color-muted-foreground` |
| Border | `#332C23` | `--color-border` |
| Destructive | `#E5484D` | `--color-destructive` |
| Ring | `#D3A054` | `--color-ring` |

**Color Notes:** Near-black warm canvas + warm gold accent + cream text —
photos carry the color, the UI stays quiet.

### Typography

- **Heading Font:** Fraunces (distinctive editorial serif — matches the
  reference sites' Cormorant Garamond / kepler-std display serifs, unique
  without sacrificing legibility at large sizes)
- **Body Font:** Inter (one of the most legible UI sans fonts available —
  satisfies "unique AND easy to read": the serif carries the personality,
  Inter keeps body copy effortless)
- **Mood:** editorial, timeless, warm, intentional, photography-first
- **Google Fonts:** [Fraunces + Inter](https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #D3A054;
  color: #171310;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #F3EDE3;
  border: 2px solid #F3EDE3;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #1B1712;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #332C23;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #C2410C;
  outline: none;
  box-shadow: 0 0 0 3px #C2410C20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Motion-Driven

**Keywords:** Animation-heavy, microinteractions, smooth transitions, scroll effects, parallax, entrance anim, page transitions

**Best For:** Portfolio sites, storytelling platforms, interactive experiences, entertainment apps, creative, SaaS

**Key Effects:** Scroll anim (Intersection Observer), hover (300-400ms), entrance, parallax (3-5 layers), page transitions

### Page Pattern

**Pattern Name:** Portfolio Grid

- **Conversion Strategy:** Visuals first. Filter by category. Fast loading essential.
- **CTA Placement:** Project Card Hover + Footer Contact
- **Section Order:** 1. Hero (Name/Role), 2. Project Grid (Masonry), 3. About/Philosophy, 4. Contact

---

## Categories, Rooms and Profiles

> Added 2026-09-05. This is the structure the site is actually built on —
> read it before changing anything in `src/lib/categories.ts`, the portfolio
> pages, or the section colours.

### The four categories

There are exactly four, defined once in `src/lib/categories.ts` and used
everywhere else by derivation — the portfolio page, the directory pages,
`generateStaticParams`, the sitemap, and the home page's "What I shoot"
tiles all read that one array. **Adding a fifth category is one edit to
that file plus one option in the CMS config**, not a hunt through a dozen
components.

| Category | Slug | Room (`data-theme`) | What it holds |
|---|---|---|---|
| Senior Photos | `senior` | `ember` (warm amber-brown) | Senior sessions |
| Family Photos | `family` | `dusk` (cool indigo) | Family sessions |
| Nature Photos | `nature` | `moss` (green-black) | Landscape / outdoor |
| Custom Shots | `custom` | `plum` (deep violet) | Cars, details, one-offs |

"Custom Shots" replaced a hardcoded "Requested" block that was not a real
category. The list of session types Ryan will shoot on request still exists,
but it now lives *inside* the Custom Shots section rather than competing as
a fifth section of its own.

### Rooms — one colour per category

Each category owns a colour and keeps it everywhere it appears: its section
on `/portfolio`, its directory page, and every gallery inside it. Clicking
Senior should never drop you into a differently-coloured page.

The `theme` is declared on the category itself, so the colour travels with
the category automatically.

### The seam invariant

**Every themed section fades in from — and back out to — the same seam
colour (`--seam`, identical to `--background`), blooming into its own hue
only in the middle.** See the long comment in `src/app/globals.css`.

The consequence worth knowing: two sections always meet seam-to-seam, so
**no section boundary can band, in any order, no matter how many categories
get added**. The colour lives where it has room to fade, never at an edge
where it would step. Do not give a themed section a top border — the fade is
the boundary, and a hairline on top of it reads as a mistake.

`sand` is the one deliberate exception: a light section cannot fade to a
near-black seam without going muddy, so it lands flat and hard-edged and
*keeps* its border. That's a cut, and cuts are marked.

### Profiles

A profile is one shoot — one person, one family, one series — and the
structure is three levels deep:

```
/portfolio                    → four category sections, each a rotating tile
/portfolio/[category]         → the directory: one card per profile + search
/portfolio/[category]/[slug]  → the profile itself: the full gallery
```

Rules that matter:

- **Every profile looks the same, in every category.** Directory cards are
  4:5, at most four across, and a partial last row centres itself. Galleries
  are 4:5 cards too. There is deliberately **no** special case for a shoot
  with one or two photos — an earlier version blew those up into a
  full-width banner, which is why the family and nature shoots used to read
  as enormous next to a senior gallery.
- **A profile is named by its subject.** `subjectName` ("Avyian",
  "Dominic") is what the card shows, falling back to the shoot title. This
  is also what the directory's search box filters on.
- **The list is meant to grow forever.** Directories take one more card per
  shoot with no layout change, and the search exists for when the list is
  long enough that scrolling stops being the fastest way to find a name.

### Face-centering

Photos are displayed in `object-fit: cover` boxes of several shapes, so a
centred crop cuts heads off. Rather than hand-tuning every photo:

1. `scripts/focal-points.mjs` runs as part of `npm run build` and computes a
   focal point for every image in `public/images/`, writing
   `content/generated/focal-points.json`.
2. Components use that value as the `object-position`.
3. **A hand-written `objectPosition` on a photo always wins.** The automatic
   value is the fallback, not the authority — if one photo crops badly, set
   it explicitly and it stays set.

The manifest is committed and the script is incremental, so a build only
processes newly-added photos. Run `node scripts/focal-points.mjs --force` to
recompute everything after changing the algorithm.

### The hero is a rotation of *people*

The home hero pulls at most a few frames **per shoot** (`heroPhotos` in
`src/lib/shoots.ts`), not every eligible photo. One senior gallery has 113
photos and another has one; feeding all of them to a shuffled carousel
means the same face nearly every time. Capping per shoot makes the hero
rotate through *people*, and it self-balances — a new person gets the same
share as everyone already there.

Photos are hero-eligible by category default: senior and family are people,
nature and custom are not. An explicit `heroEligible` on a photo overrides
that.

---

## Anti-Patterns (Do NOT Use)

- ❌ Heavy text
- ❌ Poor image showcase

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

---

## Admin Portal — Owner's Guide

> Written for Ryan, not for a developer. The admin portal is **Sveltia CMS**,
> served from `public/admin/`. It replaced Decap CMS in 2026-09 because
> Netlify shut off Git Gateway, which the old portal needed to save anything.
> The new one signs in with GitHub and — the reason for the switch — takes a
> whole shoot's worth of photos in a single upload.

### Signing in

1. Go to **https://ryanshutter.com/admin/** (bookmark it).
2. Click **Sign in with GitHub**.
3. A GitHub window opens. Log in and click **Authorize**.

You only authorize once per browser. If sign-in does nothing, the site's
GitHub connection needs setting up — that's a one-time developer step, not
something to retry.

Everything you save here is committed straight to the website's repository.
The site rebuilds itself and the change is live in about a minute or two.
Nothing is ever lost: every save is a version you can roll back to.

### Adding a new profile (a shoot)

1. In the left sidebar click **Photo Shoots**.
2. Click **New Shoot** (top right).
3. Fill in the fields:

| Field | What to put in it |
|-------|-------------------|
| **Title** | What the session is called, e.g. *Avyian's Senior Session*. This is the heading people see. |
| **URL slug** | The same name, all lowercase with hyphens instead of spaces: `avyians-senior-session`. No spaces, no apostrophes, no capitals. |
| **Category** | Pick one: **Senior**, **Family**, **Nature**, or **Custom Shots**. This is the only thing that decides which page the shoot appears on. |
| **Description** | One or two sentences about the session. Shows on the portfolio page. |
| **Subject Name** | The person's first name, e.g. *Avyian*. Optional, but fill it in — it's used on the page and in the photo descriptions screen readers announce. |
| **Photos** | See below. |

4. **Photos — this is the bulk upload.** Click the big upload button, then
   select **every photo for the shoot at once** (click the first, hold
   Shift, click the last — or Ctrl+A to grab a whole folder). You can also
   drag a pile of files straight onto the field. There is no limit; a
   hundred photos in one go is fine. They upload together and appear as a
   row of thumbnails.
5. Drag a thumbnail by its handle to reorder. **The first photo is the
   cover** for that shoot, so put the strongest one first.
6. Click **Save** — this publishes it.

**Categories, and what each one is for**

| Shows as | Used for |
|----------|----------|
| Senior | Senior portrait sessions |
| Family | Family sessions |
| Nature | Landscape and nature work |
| Custom Shots | Cars and other one-off work |

### Deleting

- **A whole profile:** open **Photo Shoots**, click the shoot, then use the
  **⋯** menu at the top of the editor and choose **Delete**. Confirm. The
  shoot disappears from its category page and from the homepage on the next
  rebuild.
- **A single photo:** open the shoot, hover the photo's thumbnail in the
  **Photos** field, click the **✕** on it, then **Save**. The rest of the
  shoot is untouched.

Deleting from the portal removes the photo from the *website*. Your own
copies on your computer or card are not affected.

### Photo descriptions (why you don't have to type them)

Every photo on a website needs a short text description so screen readers and
Google know what it is — the site is held to WCAG AA. Typing a hundred of
those by hand is not realistic, so **the site writes them for you** from the
shoot's **Subject Name** and **Category**. A senior shoot named *Avyian*
produces descriptions like *"Senior portrait of Avyian"*.

That's why filling in **Subject Name** matters more than it looks. It costs
you one word and it's what keeps the accessibility score at 100.

### What NOT to touch

- ❌ **Don't change the URL slug of a shoot that's already live.** Any link
  you've already sent to a client or posted on Instagram will break. Make a
  new shoot instead.
- ❌ **Don't upload anything but photos** — JPG, PNG and WEBP only. Video,
  PDFs and RAW files will not display.
- ❌ **Don't rename or re-order the fields**, and don't paste HTML or code
  into the Description box. Plain sentences only.
- ❌ **Don't touch colours, fonts, layout or spacing.** They aren't in the
  portal on purpose — the look of the site is fixed by this design system,
  and the portal only ever edits words and photos.
- ❌ **Don't use the Workflow / branch options** if you ever see them. Save
  is all you need.

### If something looks wrong

- **A change hasn't appeared yet** — give it two minutes and hard-refresh
  (Ctrl+Shift+R). The site rebuilds after each save.
- **Sign-in fails or spins forever** — stop and ask; it's a connection
  problem on the GitHub side, not something you did.
- **You saved something you didn't mean to** — nothing is unrecoverable.
  Every save is a version in the repository and can be rolled back.

### Owner-facing checklist for a new shoot

- [ ] Title reads like a real session name
- [ ] Slug is lowercase-with-hyphens and unique
- [ ] Category is one of Senior / Family / Nature / Custom Shots
- [ ] Subject Name filled in (drives the photo descriptions)
- [ ] All photos uploaded in one go, best photo dragged to first position
- [ ] Saved, and checked on the live site after a couple of minutes
