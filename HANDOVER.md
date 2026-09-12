# Handover — moving this site to Ryan

Everything the website needs lives in exactly two accounts plus the domain.
Nothing here is urgent, and nothing breaks while it sits as it is today —
this is the checklist for making Ryan independent of whoever built it.

| Thing | Where it is now | Where it should end up |
| --- | --- | --- |
| Domain `ryanshutter.com` | Porkbun — **already Ryan's** | no change |
| Source code | GitHub repo `dombundy08-hue/ryan-petersen-photography` | a GitHub account Ryan controls |
| Hosting, build, admin data | Netlify site **ryanshutter** | a Netlify team Ryan owns |

**There is no third account.** The admin portal at `/admin/` is a username and
password kept inside this Netlify site — no GitHub sign-in, no OAuth app, no
third-party CMS. The profiles and photos Ryan uploads live in **Netlify Blobs**
belonging to this site, so they travel with the Netlify transfer automatically.

---

## What Ryan needs before anything moves

1. A **GitHub account** (free) — github.com/signup. Send the username.
2. A **Netlify account** (free) — netlify.com/signup. Signing in *with GitHub*
   is easiest and makes step 2 below a one-click reconnect.
3. **Two-factor authentication turned on for both.** Do this at signup, not
   later. These two accounts are the website.

---

## 1. Transfer the GitHub repository

Current owner, in the repo:

1. **Settings** → scroll to **Danger Zone** → **Transfer ownership**.
2. Type the repo name to confirm, enter Ryan's GitHub username, transfer.
3. Ryan accepts the transfer from the email GitHub sends him (the link
   expires in a day — if it lapses, just send it again).

GitHub leaves a redirect behind, so Netlify keeps building from the repo at
its new address without any change. The old owner keeps no access once they
remove themselves from **Settings → Collaborators**.

## 2. Transfer the Netlify site

Netlify moves *sites between teams*, not between people, so Ryan needs his own
team first — a free personal team created at signup counts.

1. Ryan signs in to Netlify and, if he signed up with GitHub, authorises
   Netlify for his GitHub account so it can see the repo.
2. Current owner: **Site configuration** → **General** → **Transfer site**
   (under *Danger zone*) → choose Ryan's team.
   - If the option isn't offered, the usual reason is that both people need to
     be in the same team for a moment: invite Ryan to the current team
     (**Team settings → Members → Invite**), transfer, then remove the old
     owner afterwards.
3. Ryan confirms from his side.

**What moves with it, untouched:** the domain link and its SSL certificate,
every environment variable (including `BUILD_HOOK_URL`), all form submissions,
the deploy history, and — importantly — the **Netlify Blobs** stores holding
every profile and photo uploaded through `/admin/`.

**What Ryan should check straight after:**

- **Site configuration → Build & deploy → Continuous deployment** still points
  at the repo. If it lost the link, click **Link repository** and pick it
  again from his GitHub.
- **Domain management** still shows `ryanshutter.com` as the primary domain
  and the certificate as active.
- **Site configuration → Notifications** still emails form submissions to
  rpetersen2008@gmail.com. Re-add it if it didn't come across.
- Open `/admin/`, sign in, and press **Publish Now**. A deploy that finishes
  green proves the repo link, the build hook and the Blobs all survived.

## 3. Hand over the admin login

Ryan signs in at **https://ryanshutter.com/admin/** with the username and
password he was given, then immediately clicks **Account** and sets his own
password. From that moment the starter password in the repo is dead — the
portal ignores it once a password has been saved.

## 4. Tidy up, once Ryan confirms he's in

- Old owner leaves the Netlify team and removes themselves as a GitHub
  collaborator.
- Ryan turns on **transfer lock** for the domain at Porkbun.
- Ryan keeps the recovery route somewhere safe: if he is ever locked out of
  `/admin/`, the fix is in Netlify, not in code — see *Locked Out* in
  `design-system/ryan-petersen-photography/MASTER.md`.

---

## Working on the site afterwards

Once Ryan owns the repo, any AI coding tool — Claude Code, Cursor, Netlify's
own agent panel — can work on it with nothing more than his GitHub access.
The relevant reading is `README.md` for the stack, `AGENTS.md` for the house
rules, and `design-system/ryan-petersen-photography/MASTER.md` for the design
system and the owner's guide to the admin portal.
