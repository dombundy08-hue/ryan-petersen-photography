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

**How they're actually loaded:** `next/font/google` in `src/app/layout.tsx`,
exposed as `--font-heading` (Fraunces) and `--font-sans` (Inter). There is no
`@import` — Next self-hosts both, which is why there is no render-blocking
request to fonts.googleapis.com on any page.

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

/* Secondary Button — SOLID, not outlined. */
.btn-secondary {
  background: #2A241D;          /* --secondary */
  color: #F3EDE3;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

> **Corrected 2026-09-05.** This spec used to describe the secondary button
> as transparent with a 2px border. That is a ghost button, the rubric caps
> CTAs at solid fill, and the one place it shipped — "View My Work" over the
> hero — was the least legible element on the site, sitting on a photograph
> whose brightness changes every five seconds. Secondary reads as subordinate
> by being a quieter fill, never by being hollow.

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
  border-color: #D3A054;        /* --ring. Was #C2410C, a burnt orange from
                                   the pre-2026-08-04 palette that no longer
                                   exists anywhere in the system. */
  outline: none;
  box-shadow: 0 0 0 3px #D3A05433;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: #1B1712;          /* --card. NOT white — see below. */
  color: #F3EDE3;
  border: 1px solid #332C23;    /* --border */
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

> **Corrected 2026-09-05.** This said `background: white`. There is no white
> surface anywhere on this site — the client removed the one light section
> that existed. A white modal over a dark page would be the brightest thing
> on screen, and would need its type, its buttons and its gold all swapped to
> stay legible.

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
| Family Photos | `family` | `cocoa` (deep red-brown) | Family sessions |
| Nature Photos | `nature` | `umber` (yellow-brown) | Landscape / outdoor |
| Custom Shots | `custom` | `tobacco` (lifted tan) | Cars, details, one-offs |

"Custom Shots" replaced a hardcoded "Requested" block that was not a real
category. The list of session types Ryan will shoot on request still exists,
but it now lives *inside* the Custom Shots section rather than competing as
a fifth section of its own.

### Rooms — one colour per category, all of them brown

Each category owns a room and keeps it everywhere it appears: its section on
`/portfolio`, its directory page, and every gallery inside it. Clicking
Senior should never drop you into a differently-coloured page. The `theme`
is declared on the category itself, so the colour travels automatically.

**Every room is a warm brown.** An earlier version gave each category its own
hue — brown, indigo, green, violet — plus one light sand section. The client
rejected it (2026-09-05): *"Remove the blue. There should just be a brown and
yellow style … There shouldn't be a white."* Rooms are now told apart by
depth, by temperature (redder cocoa, yellower umber, tan tobacco) and by how
much gold sits in their glow. The gold is the only chromatic accent on the
site and is reserved for primary actions.

There is no light theme any more. `hearth` — the brightest rung — does the
job `sand` used to, without having to invert type to dark ink or swap the
gold for a bronze to hold contrast.

A published reference of the whole palette, with the rooms rendered in their
real CSS and the measured contrast for each, is linked from the run log.

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

**How someone actually reaches a gallery.** The tiles on `/portfolio` shuffle
through everyone in their category, captioned with whoever is currently
showing — but they link to the *directory*, never to the gallery on screen.
A tile changes every few seconds, so a link that followed the photo would
mean reaching a particular person depended on catching their frame as it
came round. The directory lists everyone by name and lets the reader choose.
The client was explicit about this (2026-09-05): the tiles advertise, the
directory decides.

Above them, a name search covers **every profile in every category** — for
the visitor who already has a name and shouldn't need to know whether that
person was filed under Senior or Family.

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

> Written for Ryan, not for a developer. The admin portal is a small custom
> page at **/admin/** with a normal username and password. It replaced the
> GitHub sign-in (Sveltia CMS) on 2026-09-10: you no longer need a GitHub
> account for anything, and everything the portal saves lives inside the
> Netlify site itself.

### Signing In

1. Go to **https://ryanshutter.com/admin/** (bookmark it).
2. Type your **username** and **password**, then **Sign In**.

Capital letters in the username don't matter — `Ry6nShutt3rs18` and
`ry6nshutt3rs18` are the same login. The password is exact, capitals and all.

You stay signed in on that device for a week. **Sign Out** (top right) ends it
straight away.

The first time, you'll use the **starter password** you were given. The
portal shows a notice until you replace it: click **Account**, type the
starter password once, then choose your own. From then on only you know it —
the starter password stops working for good.

Five wrong passwords in a row locks sign-in from that device for 15 minutes.
Wait it out; nothing is lost.

### Adding a New Profile

1. Under **Add a Profile**, type the **Name** — the person or family, e.g.
   *Dominic*, or *Bundy* for a family.
2. Pick the **Category**: Senior, Family, Nature or Custom Shots. This decides
   which page the profile appears on.
3. The **Title** fills itself in (*Dominic’s Senior Session*, *Bundy Family*).
   Change it if you like.
4. **Description** is optional. Leave it empty and one is written from the
   name and category.
5. **Photos** — click **Choose Photos or Drag Them Here** and select every
   photo for the session at once (Ctrl+A in a folder grabs them all), or drag
   a pile of files onto the box. There's no practical limit.
   - The **first photo is the cover**. Use **Make Cover** on any other photo
     to move it to the front, **Remove** to drop one.
   - Big camera files are shrunk to web size (2400 px) on your computer
     before they upload, and location data is stripped out.
   - Photos in Google Drive: download them to a folder first, then choose
     them from there.
6. Click **Upload and Publish**. A bar shows the upload; then the site
   rebuilds itself and the new profile is live in about two minutes.

### Hiding, Unhiding and Deleting

Every profile is listed under **Profiles on the Site**, grouped by category.

- **Hide** takes a profile off the website — its page, its homepage tiles, the
  search — but keeps it in the portal with every photo. **Unhide** puts it back
  exactly as it was.
- **Delete** removes the profile and the photos you uploaded for it, for good.
  The portal asks you to confirm first. When in doubt, Hide.
- **View** opens the live profile page.
- **Publish Now** rebuilds the site by hand. You shouldn't need it — every
  save already does this — but it's there if a change doesn't show up.
- **Find a Profile** — type part of a name to filter the list.

### Adding Several Profiles at Once (Saves Netlify Credits)

Every time the site goes live costs Netlify credits (15 each; the free plan
has 300 a month). To add a batch of people for the price of one:

1. At the top of **Add a Profile**, switch **How Many Profiles?** to
   **Several Profiles**.
2. Fill in the first person and press **Save and Add Another**. The form
   clears for the next one. Repeat for everyone.
3. Each one shows **Waiting to go live** in the list, a bar at the top counts
   them, and **Publish All Now** sits right under the form. Press it whenever
   you like — one deploy sends everything waiting, and they're live in about
   two minutes.

**There is no batch size and no maximum.** Two profiles publish exactly the
way twenty do; nothing has to be "filled up" before you can send them. Do
three today and three next week if that's how the shoots land — each publish
is one deploy, so the only thing a bigger batch saves is credits, not
anything you have to plan around.

Waiting profiles are kept even if you close the portal; the bar is still
there next time you sign in.

Deleting from the portal only affects the website. Your own copies on your
computer or card are untouched.

### Photo Descriptions (Why You Don't Have to Type Them)

Every photo on a website needs a short text description for screen readers
and Google — the site is held to WCAG AA. The site writes them for you from
the profile's **Name** and **Category**: a senior profile named *Avyian*
produces *"Senior portrait of Avyian"*. That's why the name matters more than
it looks.

### If Something Looks Wrong

- **A change hasn't appeared** — give it two minutes and hard-refresh
  (Ctrl+Shift+R). Still nothing? Press **Publish Now**.
- **The portal says automatic publishing isn't switched on** — saves are kept,
  but the site only picks them up on its next deploy. Whoever manages the
  Netlify account needs to do the one-time build hook step below.
- **Forgot the password** — see *Locked Out* below. It needs the Netlify
  account, not a developer.

### For Whoever Manages the Netlify Account

**How it works.** The page is `public/admin/` (plain HTML/CSS/JS). Its API is
one Netlify Function, `netlify/functions/admin-api.mjs` at `/api/admin/*`.
Profiles and photos are stored in **Netlify Blobs** (stores `shoots`,
`media`, `admin`), which belong to this Netlify site and move with it on a
transfer. Before every build, the local build plugin
`netlify/plugins/content-from-blobs` writes the stored profiles into
`content/shoots/` and the photos into `public/media/`, so the static export
and the Image CDN treat them like any other content. Builds can read Blobs but
not write them, so the shoot JSON committed in `content/shoots/` is copied into
Blobs by the admin function the first time the portal lists profiles
(`netlify/seed-shoots.mjs`). Until then builds use the committed files; after
it they are only what `next dev` shows locally — editing them doesn't change
the live site.

**One-time setup: automatic publishing.**

1. Netlify → the **ryanshutter** site → **Site configuration** →
   **Build & deploy** → **Build hooks** → **Add build hook**. Name it
   *Admin portal*, branch **master**, **Save**. Copy the URL it shows.
2. **Site configuration** → **Environment variables** → **Add a variable**:
   key `BUILD_HOOK_URL`, value = that URL.
3. **Deploys** → **Trigger deploy** → **Deploy site**.

**Contact form emails.** **Site configuration** → **Notifications** →
**Emails and webhooks** → **Form submission notifications** → **Add
notification** → **Email notification** → Form: *contact* → the address that
should receive enquiries.

**Locked out.** On any computer with this repo:
`node scripts/admin-password.mjs "the new password"` prints a hash. In
Netlify, add `ADMIN_PASSWORD_HASH` = that hash (and `ADMIN_USERNAME` if the
username should change), then redeploy. That variable overrides the portal's
own password until it is deleted; delete it once signed in if you want the
portal's **Account** dialog to manage the password again.

**Handing the site over.** `HANDOVER.md` at the root of the repo is the
checklist for moving the GitHub repo and the Netlify site into Ryan's own
accounts. Short version: two accounts, no third one — the admin portal's data
lives in Netlify Blobs and travels with the Netlify site.

**Security notes.** Passwords are stored only as scrypt hashes. Sessions are
HMAC-signed, HttpOnly, Secure, SameSite=Strict cookies scoped to
`/api/admin`, and changing the password signs every session out. The admin
page ships with a strict Content-Security-Policy and `noindex`
(`netlify.toml`).
