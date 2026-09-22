# BenawBara — Session Handoff

> Purpose: give a fresh Claude Code session everything it needs to continue building
> this project without re-asking the user. Read this top to bottom before acting.

---

## 1. What we're building

**BenawBara** — a production local marketplace web app (think a clean, trustworthy
neighborhood buy/sell platform for users in Iraq).

There is a **design mockup** the user provided: `mahalli-marketplace.html`. It is a
**visual/interaction reference only** — a single HTML file that fakes persistence with
`window.storage` (local key-value). Do **not** copy its architecture. We carry over its
*look and feel*, not its code.

The real app is being rebuilt properly on:
- **Next.js (App Router) + TypeScript**
- **Supabase** (Postgres + Auth + Storage + Row Level Security)
- **Tailwind CSS v4**
- Target deployment: **Vercel**

---

## 2. Design language (from the mockup)

- **Palette:** teal / sand / saffron / clay. (Extract exact hex values from
  `mahalli-marketplace.html` when building the design tokens.)
- **Fonts:** Fraunces (display/headings) + Inter (body/UI).
- **Signature detail:** a **monospace "ticket"-style price tag** on listing cards.
- Overall vibe: warm, trustworthy, local — not a cold tech-marketplace feel.

`src/app/globals.css` currently still has the default create-next-app Geist tokens.
**First foundation task = replace those with the BenawBara palette + Fraunces/Inter.**

---

## 3. Decisions already made with the user (do not re-litigate)

| Topic | Decision |
|---|---|
| **Auth** | **Email OTP** for dev → **Phone OTP** at go-live. |
| **Supabase project** | Created by user; we walked them through it. |
| **Working style** | **Feature by feature** — user tests each feature before moving on. Checkpoint after every major piece. |

### Important: auth strategy pivot (updated by Gemini session)
Original plan was Phone OTP with test numbers during development. However,
**Supabase hosted (cloud) projects require a paid SMS provider** to even enable
the Phone auth provider — test OTP numbers only work on self-hosted/local
instances.

**Current plan:** use **email OTP** during development (works free on Supabase
hosted, sends real emails). Switch to phone OTP when an SMS provider (Twilio)
is wired up at go-live. The auth code in `src/app/actions/auth.ts` has
comments marking exactly what to change (`email` → `phone`, `"email"` → `"sms"`).
The flow is identical — enter identifier → receive 6-digit code → verify.

---

## 4. Supabase project details

- **Project name:** mahalli (created before the rename to BenawBara — name in the
  Supabase dashboard may still say "mahalli"; that's cosmetic, ignore).
- **Project ID / ref:** `znxtxwnvhrsjxqwiyvat`
- **Project URL:** `https://znxtxwnvhrsjxqwiyvat.supabase.co`
- **Region:** Frankfurt (`eu-central-1`) — chosen for low latency to Iraq.
- **Plan:** Free.

### Keys / env
All credentials live in **`.env.local`** (gitignored — `.env*` is already in
`.gitignore`). Expected variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  (safe for browser)
- `SUPABASE_SERVICE_ROLE_KEY`  (server-only — **never** expose to the client)

> ⚠️ **SECURITY TODO (tell the user again before go-live):** the `service_role` key was
> shared in plaintext during setup. It should be **rotated** in
> Supabase Dashboard → Project Settings → API before the app goes live. The `anon` key is
> fine as-is (it's meant to be public).

---

## 5. Current state of the codebase

Scaffolded with create-next-app. Confirmed versions:
- **next 16.2.10**, **react 19.2.4**, **tailwind v4**
- App Router, TypeScript, ESLint, `src/` directory.

Installed dependencies (beyond the scaffold):
- `@supabase/supabase-js` ^2.110.5
- `@supabase/ssr` ^0.12.2  (use this for SSR-safe cookie-based auth clients)
- `browser-image-compression` ^2.0.2  (for client-side photo compression before upload)

`package.json` name = `benawbara`.

Files present at root: `AGENTS.md`, `CLAUDE.md`, `README.md`, standard Next config files,
`src/app/{layout.tsx,page.tsx,globals.css}`.

### ⚠️ Next.js 16 caveat
`AGENTS.md` warns this Next.js version has breaking changes vs. older training data.
**Bundled docs are available locally** at `node_modules/next/dist/docs/` — read them
before writing App Router / server-component / caching code rather than relying on memory.

---

## 6. What's NOT done yet (roadmap)

Foundation (do first):
1. **Design tokens** — palette + Fraunces/Inter into `globals.css` / Tailwind theme.
2. **Supabase client wiring** — browser client + server client via `@supabase/ssr`
   (cookie-based), plus middleware for session refresh.

Features (feature-by-feature, user tests each):
3. **Phone OTP auth** (with dev test-number path; see §3).
4. **Profiles** table + RLS + profile setup after first login.
5. **Listings CRUD** (create / edit / delete / view).
6. **Photo uploads** — Supabase Storage bucket + `browser-image-compression`, RLS on bucket.
7. **Browse / search / filter** feed with the ticket-style listing cards.
8. **Boosting** (paid/promoted listings surfacing higher).
9. **Reports / moderation** (`reports` table, admin review).

Database objects to create along the way: `profiles`, `listings`, `reports` tables +
RLS policies + a Storage bucket for listing photos.

---

## 7. How to work with this user

- Concise, direct, no filler. Explain reasoning for recommendations.
- Confirm before destructive or hard-to-reverse actions.
- Give click-by-click steps for anything the user must do in the Supabase dashboard.
- Checkpoint after each feature so the user can test.
- Windows 11 environment; shell is PowerShell (Bash tool also available). Use
  Windows-friendly paths. Project root: `C:\Users\sarda\BenawBara`.

---

## 8. Changes made by Gemini (Antigravity) session — 2026-07-15

> This section was added by a Gemini session while Claude Code was offline.
> Read carefully before making further changes.

### 8.1 Design Tokens — `src/app/globals.css` (REPLACED)

Removed all default Geist tokens. File now contains:

- **CSS custom properties** on `:root` for the full BenawBara palette:
  `--ink`, `--sand`, `--sand-2`, `--teal`, `--teal-deep`, `--saffron`,
  `--clay`, `--stone`, `--card` (exact hex values from the mockup).
- **Tailwind `@theme inline`** block registering each color as a Tailwind token
  (`bg-teal`, `text-saffron`, `border-sand-2`, etc.).
- Font aliases: `--font-display` → Fraunces, `--font-sans` → Inter,
  `--font-mono` → IBM Plex Mono (values injected by next/font CSS variables).
- Base styles: body gets sand bg + ink text + Inter. Headings get Fraunces.
- `.ticket` utility class: the signature monospace price tag with
  `clip-path: polygon(...)` from the mockup.

### 8.2 Fonts — `src/app/layout.tsx` (REPLACED)

- Replaced `Geist` + `Geist_Mono` imports with:
  - `Fraunces` (variable font, `axes: ["opsz"]`, var `--font-fraunces`)
  - `Inter` (variable font, var `--font-inter`)
  - `IBM_Plex_Mono` (weights 500+600, var `--font-ibm-plex-mono`)
- All three loaded via `next/font/google` with `display: "swap"`.
- CSS variables applied on `<html>` via className.
- Metadata updated: title = "BenawBara — Your Neighborhood Market",
  description updated.

### 8.3 Supabase Client Wiring — `src/lib/supabase/`

Two files created using `@supabase/ssr` patterns:

- **`src/lib/supabase/client.ts`** — Browser client factory.
  `createBrowserClient(URL, ANON_KEY)`. Use in Client Components only.

- **`src/lib/supabase/server.ts`** — Server client factory.
  `createServerClient(URL, ANON_KEY, { cookies: ... })`.
  Uses `cookies()` from `next/headers` (awaited — Next.js 16 makes it async).
  `setAll` has a try/catch because Server Components can't mutate cookies;
  the proxy handles that.

### 8.4 Session Refresh Proxy — `src/proxy.ts` (NEW)

> ⚠️ **CRITICAL Next.js 16 change:** `middleware.ts` is **DEPRECATED** and
> renamed to `proxy.ts`. The export is `proxy()` not `middleware()`.
> Do NOT create a `middleware.ts` — the build confirmed `proxy.ts` works
> (build output shows "ƒ Proxy (Middleware)").

- Matcher excludes static files, images, favicon, and common asset extensions.
- Creates a Supabase server client with cookie handlers that sync between
  the request and response objects.
- Calls `supabase.auth.getUser()` (NOT `getSession()` — important for
  security) to refresh the session on every matched request.

### 8.5 Landing Page Stub — `src/app/page.tsx` (REPLACED)

- Removed all default Next.js boilerplate (Next logo, Vercel links, etc.).
- Simple BenawBara-branded page that exercises all 3 fonts + all palette colors.
- Includes a `.ticket` price tag demo and color swatches.
- **This is a temporary page** — replace it when building the browse/feed feature.

### 8.6 Build Verification

- `npm run build` passes clean: TypeScript ✓, static generation ✓, proxy detected ✓.
- `npm run dev` visual check: sand background, Fraunces heading, Inter body,
  IBM Plex Mono ticket tag, correct saffron accent on "Bara", all color swatches
  render correctly.

### 8.7 Files NOT changed

- `.env.local` — untouched.
- `package.json` — no new dependencies added (all were already installed).
- `tsconfig.json` — untouched.
- `next.config.ts` — untouched.
- `AGENTS.md`, `CLAUDE.md`, `README.md` — untouched.
- `mahalli-marketplace.html` — untouched (still the reference mockup).

---

## 9. File tree (updated after auth feature)

```
src/
├── app/
│   ├── actions/
│   │   └── auth.ts            ← Server Actions: sendOtp, verifyOtp, signOut
│   ├── login/
│   │   ├── page.tsx           ← Login page (server component, redirect if logged in)
│   │   └── login-form.tsx     ← Two-step OTP form (client component)
│   ├── globals.css            ← BenawBara palette + Tailwind tokens
│   ├── layout.tsx             ← Fraunces / Inter / IBM Plex Mono
│   ├── page.tsx               ← Home (shows user phone + sign out)
│   └── favicon.ico
├── lib/
│   └── supabase/
│       ├── client.ts          ← Browser Supabase client
│       └── server.ts          ← Server Supabase client
└── proxy.ts                   ← Session refresh + route protection
```

---

## 10. Email/Password Auth (Dev) — added by Gemini session (continued)

### 10.1 Server Actions — `src/app/actions/auth.ts` (NEW)

`"use server"` file with actions:

- **`signInWithPassword(prev, formData)`** — signs in existing user using `supabase.auth.signInWithPassword({ email, password })`.
- **`signUpWithPassword(prev, formData)`** — signs up a new user using `supabase.auth.signUp({ email, password })`.
- **`signOut()`** — calls `supabase.auth.signOut()`, then `redirect("/login")`.

All use the server-side Supabase client from `@/lib/supabase/server`.

### 10.2 Login Page — `src/app/login/`

**`page.tsx`** (Server Component):
- Checks `supabase.auth.getUser()` — redirects to `/` if already logged in.
- Renders the `LoginForm` client component.

**`login-form.tsx`** (Client Component, `"use client"`):
- Form fields for email and password.
- Dynamically swaps between Sign In and Sign Up actions/modes.
- Displays validation/auth errors directly inline.

### 10.3 Route Protection — `src/proxy.ts`

- Matches paths, redirects anonymous requests to `/login`, and redirects authenticated traffic away from `/login`.
- Session refresh happens automatically on every request.

### 10.4 Auth Strategy: Email & Password for Dev

> ⚠️ **Pivot from Magic Links:** Supabase hosted projects enforce a strict rate
> limit of 3 emails per hour for their default email provider. To avoid being blocked
> by rate limits during development, we switched to **Email & Password auth** and
> turned email confirmation **OFF** in the Supabase Dashboard.
>
> This allows you to test signups/logins instantly with any email (even fake ones)
> with zero email delivery dependencies. When configuring Phone OTP SMS at production
> go-live, this auth layer can easily be updated.

### 10.5 Build Verification

- `npm run build` passes cleanly: TypeScript ✓, routes dynamic (ƒ) ✓, proxy active ✓.

---

*Resume point: foundation + Password-based dev auth are DONE. Design tokens, fonts,
Supabase clients, route protection proxy, and the login/logout flow are all wired and verified.
Next action = **Profiles** (roadmap item 4): `profiles` table + RLS + profile setup after first login. Then listings (item 5).*

---

## 11. Onboarding Profiles — added by Gemini session (continued)

### 11.1 Schema Migration — `supabase/migrations/20260715_create_profiles.sql` (NEW)

Postgres database objects:
- `profiles` table: `id` (uuid primary key, references `auth.users`), `updated_at`, `name`, `location`, `phone`.
- Enabled Row Level Security (RLS).
- Select Policy: Anyone can view any profile (necessary for buyer-seller messaging).
- Update Policy: Users can only modify their own profile row (`auth.uid() = id`).
- Trigger `on_auth_user_created` calls trigger function `handle_new_user()` which inserts a blank record into `profiles` immediately upon user registration.

### 11.2 Server Actions — `src/app/actions/profile.ts` (NEW)

- **`updateProfile(prev, formData)`**: Validates fields (`name` is >=2 characters, `location` is >=2 characters, and `phone` is a valid E.164 phone format). Updates the authenticated user's profile row in Supabase and calls `redirect("/")`.

### 11.3 Profile Onboarding Flow — `src/app/profile-setup/`

- **`page.tsx`** (Server Component): Fetches user, loads profile. If already completed, redirects home. Otherwise, renders the form.
- **`profile-form.tsx`** (Client Component): Displays full name, neighborhood/location, and WhatsApp inputs. Integrates with React 19 `useActionState`.
- **`proxy.ts`** (MODIFIED): Added profile check block. If a logged-in user has an incomplete profile row (missing name or location), the proxy intercepts requests and forces a redirect to `/profile-setup`.

### 11.4 Build Verification

- `npm run build` passes: TypeScript ✓, `/profile-setup` dynamic (ƒ) ✓, proxy routes compile.

---

## 12. File tree (updated after profiles feature)

```
src/
├── app/
│   ├── actions/
│   │   ├── auth.ts            ← Server Actions: login, logout
│   │   └── profile.ts         ← Server Actions: updateProfile
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx
│   ├── profile-setup/
│   │   ├── page.tsx           ← Profile setup onboarding page
│   │   └── profile-form.tsx   ← Name / Location / WhatsApp form
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── favicon.ico
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── proxy.ts
supabase/
└── migrations/
    └── 20260715_create_profiles.sql  ← DB schema and triggers
```

---

*Resume point: foundation, Auth, and Profiles onboarding are DONE. Design tokens, fonts,
Supabase clients, route protection proxy, PKCE code exchange handler, password signup/signin,
onboarding setups, and SQL tables are all active.
Next action = **Listings CRUD** (roadmap item 5): `listings` table + RLS, and interface to create/edit listings.*

---

## 13. Listings CRUD — added by Gemini session (continued)

### 13.1 Schema Migration — `supabase/migrations/20260715_create_listings.sql` (NEW)

Postgres database objects:
- `listings` table: `id` (uuid, auto-generated), `seller_id` (references `profiles(id)`),
  `title`, `description`, `price` (bigint, IQD), `category`, `location`, `emoji`,
  `sold` (boolean), `created_at`.
- RLS Policies: Select (everyone), Insert (auth user = seller_id), Update/Delete (owner only).

### 13.2 Server Actions — `src/app/actions/listings.ts` (NEW)

- **`createListing(prev, formData)`**: Validates title (≥3 chars), price (positive int),
  category (from allowed list), location. Inserts into `listings` table. Calls `revalidatePath("/")` + `redirect("/")`.
- **`toggleSold(listingId, currentSold)`**: Flips the `sold` boolean. Ownership guard via `.eq("seller_id", user.id)`.
- **`deleteListing(listingId)`**: Removes the listing. Ownership guard. Redirects home.

### 13.3 Marketplace Feed — `src/app/page.tsx` (REPLACED)

Replaced temporary "Logged in as" stub with full marketplace dashboard:
- Dark header with BenawBara logo, user email, Sign Out link.
- Search bar (server-side query via `?search=` param).
- Horizontal category chip filters (`?category=` param).
- Grid of listing cards with emoji header, title, location, time-ago, and IQD price tag.
- Sold badge overlay on sold items.
- Empty state ("Nothing here yet") when no listings match.
- Saffron FAB (+) button linking to `/listings/new`.

### 13.4 New Listing Form — `src/app/listings/new/`

- **`page.tsx`** (Server Component): Auth guard, prefills neighborhood from profile.
- **`new-listing-form.tsx`** (Client Component): Title, category select, dynamic emoji picker
  (icons change per category), price (IQD), neighborhood, description textarea.

### 13.5 Listing Detail View — `src/app/listings/[id]/page.tsx` (NEW)

- Joins `listings` with `profiles` to show seller name and phone.
- Color-coded header by category.
- Price tag, title, location/category/time meta row, description.
- Seller card with avatar initial, name, location.
- WhatsApp "Chat" button (`https://wa.me/{phone}?text=...`).
- Owner panel: "Mark as Sold/Available" toggle + "Delete Listing" button.

### 13.6 Build Verification

- `npm run build` passes: TypeScript ✓, all routes dynamic (ƒ) ✓.
- Routes: `/`, `/auth/callback`, `/listings/[id]`, `/listings/new`, `/login`, `/profile-setup`.

---

## 14. File tree (updated after listings feature)

```
src/
├── app/
│   ├── actions/
│   │   ├── auth.ts            ← signInWithPassword, signUpWithPassword, signOut
│   │   ├── listings.ts        ← createListing, toggleSold, deleteListing
│   │   └── profile.ts         ← updateProfile
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       ← PKCE code exchange handler
│   ├── listings/
│   │   ├── [id]/
│   │   │   └── page.tsx       ← Listing detail view + WhatsApp + owner controls
│   │   └── new/
│   │       ├── page.tsx        ← New listing page wrapper
│   │       └── new-listing-form.tsx ← Category/emoji/price form
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx
│   ├── profile-setup/
│   │   ├── page.tsx
│   │   └── profile-form.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx               ← Marketplace feed dashboard
│   └── favicon.ico
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── proxy.ts
supabase/
└── migrations/
    ├── 20260715_create_profiles.sql
    └── 20260715_create_listings.sql
```

---

---

## 15. Image uploads — added by Claude session (2026-07-15)

Roadmap item 6 (Photo uploads) is DONE in code. **User must run the migration in
Supabase before testing** (see checkpoint below).

### 15.1 Migration — `supabase/migrations/20260715_create_listing_photos.sql` (NEW)
- Adds nullable `image_path` column to `listings` (stores the object PATH like
  `{user_id}/{uuid}.webp`, NOT a full URL).
- Creates PUBLIC storage bucket `listing-photos`.
- Storage RLS on `storage.objects`: public read; insert/update/delete only when
  the object's first folder segment equals `auth.uid()` (users confined to their
  own `{uid}/` folder).

### 15.2 `next.config.ts` (EDITED)
- Added `images.remotePatterns` allowing
  `https://znxtxwnvhrsjxqwiyvat.supabase.co/storage/v1/object/public/listing-photos/**`
  so `next/image` can render Supabase-hosted photos.

### 15.3 Storage helper — `src/lib/supabase/storage.ts` (NEW)
- `LISTING_PHOTOS_BUCKET` constant.
- `listingPhotoUrl(path)` — builds a public URL from a stored path, null-safe.

### 15.4 Server actions — `src/app/actions/listings.ts` (EDITED)
- `createListing` reads `image_path` from the form, guards that it starts with
  `{user.id}/` (defends against a forged field), stores it on the row.
- `deleteListing` fetches `image_path` first, then removes the object from
  Storage after the row is deleted (best-effort cleanup).

### 15.5 New-listing form — `src/app/listings/new/new-listing-form.tsx` (EDITED)
- Photo picker (optional). On select: compresses via `browser-image-compression`
  (maxSizeMB 0.6, maxWidthOrHeight 1280, → webp), uploads to
  `listing-photos/{uid}/{uuid}.webp` immediately, shows a live preview.
- Re-picking removes the previous upload; "Remove" deletes it too. Submit is
  disabled while an upload is in flight. Carries the path via hidden `image_path`.

### 15.6 Display — feed cards + detail page (EDITED)
- `src/app/page.tsx` and `src/app/listings/[id]/page.tsx` now render the photo
  (`next/image`, `fill`, `object-cover`) when `image_path` is set, else fall back
  to the category-colored emoji header. Detail header height bumped to `h-64`.

### 15.7 Verification
- `npm run build` passes: TypeScript ✓, all routes intact, proxy detected ✓.
- ⚠️ `npm run lint` reports 6 PRE-EXISTING errors NOT from this feature:
  `page.tsx` `timeAgo` uses `Date.now()` (react-hooks/purity), FAB uses `<a>`
  instead of `<Link>`, and `profile-form.tsx` has 2 unescaped quotes. These were
  written by the earlier Gemini session and should be cleaned up separately.

### 15.8 REQUIRED user action before testing (Supabase dashboard)
Run the SQL in `supabase/migrations/20260715_create_listing_photos.sql`:
Dashboard → SQL Editor → New query → paste file contents → Run. This adds the
column, creates the bucket, and installs the storage RLS policies.

---

## 16. Lint cleanup + logo rename — Claude session (2026-07-15)

- Renamed feed logo "Mahalli" → "BenawBara" (`Benaw` + saffron `Bara`) in `src/app/page.tsx`.
- Cleared all pre-existing lint errors so `npm run lint` is now clean:
  - `page.tsx`: `timeAgo` captures `now` once with a scoped `react-hooks/purity`
    disable (justified — async Server Component renders once per request); FAB
    `<a>` → `<Link>`.
  - Converted "Back"/"Cancel" `<a href="/">` links to `<Link>` in the detail and
    new-listing pages.
  - `profile-form.tsx`: escaped the quotes around "Chat on WhatsApp".

## 17. Edit listings (completes CRUD) — Claude session (2026-07-15)

Item 5's "edit" was missing (only create/toggle-sold/delete existed). Now done.

### 17.1 Shared form — `src/app/listings/listing-form.tsx` (NEW, replaces new-listing-form.tsx)
- Renamed/generalized the old `new/new-listing-form.tsx` (now DELETED) into one
  `ListingForm` used by both create and edit. Props: `defaultLocation?` (create)
  and `initial?: ListingInitial` (edit). When `initial` is set it prefills every
  field, preselects category/emoji, shows the existing photo, and binds
  `updateListing` instead of `createListing`.
- Photo cleanup during edit is careful: it tracks the saved original in a ref and
  only removes freshly-uploaded (unsaved) objects on re-pick/remove, so the
  still-referenced original is never deleted client-side. The server deletes the
  replaced original on save.

### 17.2 `updateListing` action — `src/app/actions/listings.ts` (EDITED)
- Extracted shared field parsing/validation into `parseListingForm(formData, userId)`
  (used by both create and update).
- New `updateListing(listingId, _prev, formData)`: ownership-scoped fetch + update
  (guards on `seller_id`), removes the old photo from Storage if it changed, then
  `redirect(/listings/{id})`.

### 17.3 Edit route — `src/app/listings/[id]/edit/page.tsx` (NEW)
- Server component: requires auth, loads the listing, 404s if missing, redirects
  non-owners to the detail page, else renders `ListingForm` with `initial`.

### 17.4 Detail page — `src/app/listings/[id]/page.tsx` (EDITED)
- Owner panel now has an "Edit Listing" button (→ `/listings/{id}/edit`) above the
  Mark-sold / Delete row.

### 17.5 Verification
- `npm run lint` clean; `npm run build` passes with `/listings/[id]/edit` route
  registered. (Photo edit still needs migration 15.8 applied to actually work.)

---

*Resume point: Auth, Profiles, full Listings CRUD (create/edit/delete/view/mark-sold),
and Image uploads are DONE. Pending user action: run migration 15.8
(`supabase/migrations/20260715_create_listing_photos.sql`) in the Supabase SQL
editor before photos work end-to-end.*

---

## 18. Kurdish (Sorani) + RTL localization — Claude session (2026-07-16)

The whole UI was switched to **Kurdish Sorani (کوردیی ناوەندی)** with a
**right-to-left** layout. Decisions confirmed with the user: **Sorani dialect
(Arabic script, RTL)**, **full replacement** of English (not bilingual). App is
for a local Kurdish city.

### 18.1 Central strings module — `src/lib/strings.ts` (NEW)
- `t` — every user-facing UI string in Sorani (one object; some are functions like
  `listingsNearby(n)`, `whatsappMessage(title)`, `minutesAgo(n)`).
- `CATEGORY_LABELS` — Sorani labels keyed by the (unchanged) English category IDs.
  The DB still stores English category IDs; only the display label is translated.
- `errors` — Sorani copy for server-action validation messages, kept separate so
  actions don't import UI copy.
- **Add new strings here**, don't inline Kurdish in JSX.

### 18.2 Layout / fonts — `src/app/layout.tsx` (EDITED)
- `<html lang="ckb" dir="rtl">`.
- Primary UI sans font swapped from Inter → **Noto Kufi Arabic** (`subsets:
  ["arabic"]`), still bound to the `--font-inter` CSS var so `globals.css` needs
  no change. Fraunces (Latin) kept only for the "BenawBara" wordmark; IBM Plex
  Mono kept for the price ticket.
- `metadata.title/description` now come from `t`.

### 18.3 RTL styling — `src/app/globals.css` (EDITED)
- `.ticket` notch now points inline-start by default (LTR) with a
  `[dir="rtl"] .ticket` override that mirrors the `clip-path` + padding, so the
  signature price tag stays visually correct in RTL.

### 18.4 Directional utilities (EDITED across pages)
- Converted physical Tailwind utilities to logical ones so layout mirrors:
  `left-`/`right-` → `start-`/`end-`, `pl-`/`pr-` → `ps-`/`pe-`. Touched the search
  icon + input (`page.tsx`), FAB position (`page.tsx`), sold badge (`page.tsx`,
  `[id]/page.tsx`), and photo Remove button (`listing-form.tsx`).

### 18.5 Translated files (all UI strings → `t` / `CATEGORY_LABELS` / `errors`)
- `src/app/page.tsx` (feed: tagline, sign out, search, chips, count, empty state,
  card, FAB) — note `CATEGORIES` array renamed to `CATEGORY_IDS`.
- `src/app/login/{page.tsx,login-form.tsx}`
- `src/app/profile-setup/{page.tsx,profile-form.tsx}`
- `src/app/listings/new/page.tsx`
- `src/app/listings/[id]/edit/page.tsx`
- `src/app/listings/listing-form.tsx` (category `<select>` uses `CATEGORY_LABELS`)
- `src/app/listings/[id]/page.tsx` (detail + owner panel)
- `src/app/actions/{auth.ts,profile.ts,listings.ts}` (error strings via `errors`)

### 18.6 Notes / not-yet-done
- Prices still render with Western digits via `toLocaleString("en-US")` — standard
  and readable for IQD; not converted to Arabic-Indic digits.
- `uppercase` utility classes left in place; they're no-ops for Arabic script.
- The Latin brand wordmark "BenawBara" is intentionally kept Latin.
- **UI library request:** user asked to "install the design.md repo from github for
  better UI" — they will paste the exact repo URL. NOT done yet; awaiting the link.

### 18.7 Build hiccup resolved (stale dev server)
- A CSS parse error pointing at `@custom-variant dark ...` (line 275) was NOT from
  the current `globals.css` (78 lines, clean). Cause: an **old dev server from a
  previous session** was still running (the "Port 3000 in use by an unknown
  process" warning) serving a cached compile of the pre-rewrite create-next-app
  CSS. Fix: killed stray `node.exe` processes + deleted `.next`.

### 18.8 Verification
- `npm run lint` clean; `npm run build` passes; all routes registered
  (`/`, `/listings/[id]`, `/listings/[id]/edit`, `/listings/new`, `/login`,
  `/profile-setup`).

---

## 19. Completion Phase (My Listings, Feed Sorting, Reports & Moderation) — Gemini session (2026-09-21)

Resumed after 2-month hiatus. Database unpaused and confirmed fully healthy.

### 19.1 Supabase Restoration
- Woke up paused free project via Supabase dashboard.
- Ran automated check confirming: `profiles`, `listings` (with `image_path`), and `listing-photos` public storage bucket are active.
- Added `turbopack: { root: process.cwd() }` to `next.config.ts` to prevent false workspace root resolution due to parent lockfiles.

### 19.2 User Dashboard — `src/app/my-listings/page.tsx` (NEW)
- Dedicated page for authenticated users to manage their listings.
- Shows user's name, neighborhood, WhatsApp number, with an "Edit Profile" link.
- Segmented tabs: Active (بەردەستەکان) vs. Sold (فرۆشراوەکان) with count badges.
- Quick owner action buttons on cards: Edit (`/listings/[id]/edit`), Toggle Sold/Available (`toggleSold`), Delete (`deleteListing`).

### 19.3 Enhanced Search & Sorting — `src/app/page.tsx` (EDITED)
- Added sorting: Newest (نوێترین), Price Low-to-High (نرخ: کەمترین), Price High-to-Low (نرخ: بەرزترین).
- Preserves active search, category, and sort state across query parameters.
- Replaced card & chip tags with Next.js `<Link>` for instantaneous client-side navigation.
- Added top bar button to `/my-listings` (📦 ڕاگەیەنراوەکانم).

### 19.4 Reporting & Moderation — Roadmap Item 9 (NEW)
- Migration: `supabase/migrations/20260921_create_reports.sql` (`reports` table + RLS).
- Action: `src/app/actions/reports.ts` (`submitReport`).
- Component: `src/app/listings/[id]/report-modal.tsx` with Sorani reason dropdown and optional notes.
- Embedded in `src/app/listings/[id]/page.tsx` for non-owners.

### 19.5 Profile Edit Support — `src/app/profile-setup/page.tsx` (EDITED)
- Added `?edit=1` query param support to allow completed accounts to modify their details without forced redirection.

### 19.6 Verification
- `npm run lint` — clean (0 errors).
- `npm run build` — passes with all 10 routes registered.
- Dev server running on `localhost:3000`.


