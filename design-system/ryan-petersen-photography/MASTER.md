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

> Written for Ryan, not for a developer. The admin portal is **Sveltia CMS**,
> served from `public/admin/`. It replaced Decap CMS in 2026-09 because
> Netlify shut off Git Gateway, which the old portal needed to save anything.
> The new one signs in with GitHub and — the reason for the switch — takes a
> whole shoot's worth of photos in a single upload.

### Signing in

1. Go to **https://ryanshutter.netlify.app/admin/** (bookmark it).
2. Click **Sign in with GitHub**.
3. A small GitHub window opens. Log in and click **Authorize**.

You only authorize once per browser. The window closes itself and the portal
appears.

Everything you save here is committed straight to the website's repository.
The site rebuilds itself and the change is live in about a minute or two.
Nothing is ever lost: every save is a version you can roll back to.

### First-time setup — do this once, before the first sign-in

> Sign-in will not work until this is done. It takes about ten minutes and you
> only ever do it once. You need to be logged in to **GitHub** and to
> **Netlify** in the same browser. Nothing here touches the website itself —
> you cannot break the site by doing this.
>
> The sign-in helper already lives inside the website (it's part of every
> deploy). All you're doing is giving it two keys so it's allowed to talk to
> GitHub on your behalf. There is no Cloudflare account and nothing to install.

**Part 1 — Create the key on GitHub (5 minutes)**

1. Open **https://github.com/settings/developers** in your browser.
2. In the left-hand menu click **OAuth Apps**.
3. Click the green **New OAuth App** button (top right). If GitHub instead
   shows a **Register a new application** page, you're already in the right
   place.
4. Fill in the four boxes exactly like this — copy and paste the URLs, don't
   retype them:

   | Box | Paste this |
   |-----|-----------|
   | **Application name** | `RyanShutter Admin` |
   | **Homepage URL** | `https://ryanshutter.netlify.app` |
   | **Application description** | *(leave empty)* |
   | **Authorization callback URL** | `https://ryanshutter.netlify.app/oauth/callback` |

   The **Authorization callback URL** is the one that matters. One wrong
   character there and sign-in fails. It must end in `/oauth/callback`.

5. Click **Register application**.
6. GitHub now shows a page with a **Client ID** — a line of letters and
   numbers. **Copy it** and paste it somewhere safe for a moment (a blank
   note, an email draft to yourself). You'll need it in Part 2.
7. On that same page, click **Generate a new client secret**. GitHub may ask
   for your password or two-factor code.
8. A long secret appears, usually starting with `ghp_` or similar. **Copy it
   immediately** and paste it next to the Client ID in your note.
   **You cannot see this again.** If you lose it, come back here and click
   **Generate a new client secret** for a fresh one — that's fine, no harm
   done.

Leave this GitHub tab open. Don't close it until Part 2 works.

**Part 2 — Paste the two keys into Netlify (5 minutes)**

1. Open **https://app.netlify.com** and sign in.
2. Click the site called **ryanshutter**.
3. In the left menu click **Site configuration**.
4. In the menu that appears under it, click **Environment variables**.
5. Click **Add a variable** → **Add a single variable**.
6. Fill it in:
   - **Key:** `GITHUB_OAUTH_CLIENT_ID`
   - **Values:** paste the **Client ID** from Part 1 step 6
   - Leave the scope/deploy-context options at their defaults
   - Click **Create variable**
7. Click **Add a variable** → **Add a single variable** a second time:
   - **Key:** `GITHUB_OAUTH_CLIENT_SECRET`
   - **Values:** paste the **client secret** from Part 1 step 8
   - Click **Create variable**

   Type the two key names exactly as written above — all capitals, underscores
   between words, no spaces. That's the most common thing to get wrong.

8. In the left menu click **Deploys**, then the **Trigger deploy** button
   (top right of the deploy list) → **Deploy site**. Wait until the newest
   deploy says **Published** (a minute or two). The keys only take effect
   after this.

**Part 3 — Check it worked (1 minute)**

1. Go to **https://ryanshutter.netlify.app/admin/**.
2. Click **Sign in with GitHub**.
3. Log in if asked, then click the green **Authorize** button.
4. The window closes and the portal opens. Done — you never do this again.

You can now delete the note with the Client ID and secret in it. Netlify has
them, and the secret is never shown to anyone visiting the website.

**If something goes wrong, it tells you what.** Sign-in never just spins
forever. You get a sentence in plain English — either on the portal page after
the little window closes, or inside the window itself if it stays open. Match
the first few words against this table:

| What it says | What to do |
|--------------|------------|
| *"This site has no GitHub sign-in keys configured…"* | Part 2 wasn't finished, or the deploy in step 8 hasn't published yet. Check both variable names are spelled exactly right (all capitals, underscores), then trigger the deploy again. |
| *"GitHub refused to issue an access token: incorrect_client_credentials"* | The Client ID and the secret don't belong to the same OAuth App — usually one was pasted with a stray space, or an old secret was reused. Redo Part 1 steps 7–8 for a fresh secret, then re-paste **both** values in Netlify and redeploy. |
| *"This sign-in could not be verified…"* | Harmless. The window sat open too long, or was opened twice. Close it and click **Sign in with GitHub** again. |
| *"The admin portal is running on … which this sign-in helper is not configured to serve"* | You opened the portal on a different web address from the one it's set up for. Use **https://ryanshutter.netlify.app/admin/**. If that's the address you used, send this message to your developer. |
| *"GitHub refused the sign-in request"* / *"The user denied access"* | You clicked **Cancel** on GitHub instead of **Authorize**. Close the window and try again. |
| *"Could not reach GitHub"* or *"GitHub sent back something this site could not read"* | GitHub itself is having a moment. Wait a minute and try again; check https://www.githubstatus.com if it persists. |
| *"The admin portal did not answer"* (window stays open ~10 seconds) | The web address in the portal's settings doesn't match the one you opened. Send this message to your developer. |
| *"Nothing to do here"* | You opened `/oauth/auth` or `/oauth/callback` directly. Go to **/admin/** instead. |

**A note for whoever maintains the site.** The sign-in helper is two Netlify
Functions — `netlify/functions/oauth-auth.mjs` and `oauth-callback.mjs`, sharing
`netlify/oauth-shared.mjs` — wired to `/oauth/auth` and `/oauth/callback` by
rewrites in `netlify.toml`. They hold the client secret server-side, protect the
round trip with a `state` cookie scoped to `Path=/oauth`, and hand the access
token to the CMS with a `postMessage` aimed at this site's own origin, never
`*`. They deliberately send Sveltia **no** `errorCode`: Sveltia ships its own
generic English for every code the reference Cloudflare Worker uses, and it
overrides whatever message we wrote — omitting the code is what lets the
specific, actionable sentence reach the owner. Two protocol details are
load-bearing and easy to break: the popup must post `authorizing:github` first
and only answer with the token *after* the CMS echoes it back, and every
message must originate from the exact origin in `base_url` or the CMS ignores
it. If the site moves to the **ryanshutter.com** custom domain, three things
must change at the same time or sign-in breaks: `base_url` in
`public/admin/config.yml`, the **Authorization callback URL** on the GitHub
OAuth App, and — for as long as both hostnames are in use — the optional
`CMS_ALLOWED_ORIGINS` environment variable in Netlify.

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
- **Sign-in fails** — the sign-in window always says what went wrong in plain
  English. Read it, then look it up in the table under *First-time setup*
  above. It is never something you did wrong inside the portal.
- **You saved something you didn't mean to** — nothing is unrecoverable.
  Every save is a version in the repository and can be rolled back.

### Owner-facing checklist for a new shoot

- [ ] Title reads like a real session name
- [ ] Slug is lowercase-with-hyphens and unique
- [ ] Category is one of Senior / Family / Nature / Custom Shots
- [ ] Subject Name filled in (drives the photo descriptions)
- [ ] All photos uploaded in one go, best photo dragged to first position
- [ ] Saved, and checked on the live site after a couple of minutes
