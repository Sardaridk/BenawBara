# Production-ready email auth — design

**Date:** 2026-07-19
**Status:** Approved, ready for implementation
**Feature:** Make sign-up / sign-in real-world ready with email verification and password reset.

---

## Problem

The app currently has working email + password auth (`src/app/actions/auth.ts`),
but "Confirm email" was OFF in Supabase, so:

- Anyone could sign up with a fake email or someone else's email and get logged
  in instantly.
- There was no account-recovery ("forgot password") path.
- Raw Supabase error messages (English) were shown to users, in an app that is
  otherwise entirely Kurdish Sorani + RTL.
- Duplicate sign-ups were silently mishandled.

The user turned **"Confirm email" ON** in Supabase (Authentication → Providers →
Email) before implementation. This is the switch that makes verification real.

## Goals

1. Verify email ownership before granting access (verify-before-access).
2. Add a password-reset flow.
3. Show friendly, localized (Sorani) error/status copy everywhere.
4. Handle duplicate sign-ups without leaking who is registered.

## Non-goals (YAGNI)

- "Resend confirmation email" button — note for later.
- App-level rate limiting beyond Supabase's built-in limits.
- Custom SMTP provider.

---

## Chosen approach: confirmation links (Option A)

Both verification and password reset use Supabase's **emailed link** mechanism,
reusing the existing `/auth/callback` route that already exchanges the PKCE
`code` for a session and honors a `?next=` param.

Rejected alternatives:
- **6-digit OTP codes** — needs an extra "enter code" screen and more state;
  more typing. Phone auth at go-live will be OTP anyway, so building email OTP
  now is throwaway work.

---

## Flows

### Sign-up (verify before access)
1. `signUpWithPassword` calls `supabase.auth.signUp` with
   `options.emailRedirectTo` → `${origin}/auth/callback`.
2. With "Confirm email" ON, **no session is created yet**. So the action does
   NOT redirect home — it returns a success state and the form shows a
   **"check your inbox"** panel.
3. **Duplicate detection:** an already-registered email returns a fake success
   with `data.user.identities` empty (Supabase anti-enumeration). We detect the
   empty `identities` array and show the same "check your inbox" panel — no leak
   of who is registered, and genuine new users still get their link.
4. User clicks the email link → `/auth/callback` exchanges the code → session
   created → `proxy.ts` routes them to `/profile-setup` (incomplete profile).

### Sign-in
Unchanged mechanics, but map raw Supabase errors to friendly Sorani copy:
- `Invalid login credentials` → generic "email or password is wrong" (do not
  reveal which).
- `Email not confirmed` → "confirm your email first, check your inbox."
- Anything else → a generic fallback string.

### Password reset (new)
1. **"Forgot password?"** link on the login form → a `forgot` mode showing only
   the email field.
2. `requestPasswordReset` calls `supabase.auth.resetPasswordForEmail(email, {
   redirectTo: ${origin}/auth/callback?next=/reset-password })`. Always returns
   the "check your inbox" state regardless of whether the email exists (no
   enumeration leak).
3. User clicks link → `/auth/callback` exchanges code (recovery session) →
   `next=/reset-password` sends them to the new page.
4. **`/reset-password`**: user (now authenticated via recovery session) sets a
   new password → `supabase.auth.updateUser({ password })` → redirect home.

---

## Files touched

- **`src/app/actions/auth.ts`**
  - `signUpWithPassword`: add `emailRedirectTo`; stop auto-redirecting; detect
    empty `identities` (duplicate); return a `emailSent` success state.
  - `signInWithPassword`: map known error messages to Sorani via a helper.
  - New `requestPasswordReset(prev, formData)` action.
  - New `updatePassword(prev, formData)` action (validates length, calls
    `updateUser`, redirects home).
  - `AuthResult` type extended with an `emailSent?: boolean` flag.
- **`src/app/login/login-form.tsx`**
  - Add `forgot` to the mode union; "Forgot password?" link in sign-in mode.
  - Shared **"email sent"** panel shown when `state.emailSent` is true (used by
    both signup and reset), with a "back to sign in" affordance.
  - Wire the correct action per mode (signin / signup / forgot).
- **`src/app/reset-password/page.tsx`** (new)
  - Server component: require a session (recovery), else redirect to `/login`.
  - Renders the reset form.
- **`src/app/reset-password/reset-password-form.tsx`** (new)
  - Client component: new-password + confirm-password fields → `updatePassword`.
- **`src/lib/strings.ts`**
  - New Sorani copy: check-inbox panel title/body, "forgot password" link,
    forgot-mode title/subtitle, reset-page title/subtitle/labels, submit states.
  - New friendly `errors` entries: wrong credentials, email not confirmed,
    passwords-don't-match, generic auth fallback.
  - Fix the stale `loginHelp` / `loginHelpSub` text (currently says verification
    is disabled).
- **`proxy.ts`** — no change. A recovery user is authenticated with a complete
  profile, so `/reset-password` is already reachable; it's not in
  `PUBLIC_ROUTES` and doesn't need to be.

---

## Error handling

All user-facing auth errors resolve to Sorani strings from `errors` in
`src/lib/strings.ts`. A small `mapAuthError(message)` helper in the actions file
translates known Supabase messages; unknown messages fall back to a generic
Sorani string rather than surfacing English.

---

## Testing / verification

- `npm run build` must pass after changes (Next.js 16 — consult
  `node_modules/next/dist/docs/` for App Router specifics if needed).
- Manual acceptance (user, with a real inbox):
  1. Sign up with a fresh email → see "check your inbox" → click link → land in
     `/profile-setup`.
  2. Sign up again with the **same** email → still see "check your inbox" (no
     leak, no crash).
  3. Sign in with wrong password → friendly Sorani error, no English.
  4. Sign in before confirming → "confirm your email first" message.
  5. Forgot password → "check your inbox" → click link → `/reset-password` →
     set new password → signed in and sent home.

---

## ⚠️ Go-live blocker (must tell the user again before publishing)

This uses Supabase's **built-in email sender**, which is:
- Rate-limited to a few messages per hour.
- Only reliably delivered to members of the Supabase project.

It is fine for the user's own testing, but **NOT** acceptable for real users. A
custom SMTP provider (e.g. Resend, SendGrid, AWS SES) must be configured in
Supabase → Authentication → Emails → SMTP Settings before launch. Also still
outstanding from the original handoff: **rotate the `service_role` key** before
go-live.
