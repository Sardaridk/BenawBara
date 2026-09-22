# Production-ready Email Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make sign-up / sign-in production-ready with email verification (verify-before-access), a password-reset flow, and friendly localized (Kurdish Sorani) error/status copy.

**Architecture:** Supabase email + password auth using emailed confirmation links, reusing the existing `/auth/callback` PKCE route. Sign-up sends a confirmation email and shows a "check your inbox" panel instead of logging in. Password reset emails a link that routes (via `?next=`) to a new `/reset-password` page. All user-facing errors are mapped to Sorani strings.

**Tech Stack:** Next.js 16.2 (App Router, Server Actions, `proxy.ts`), TypeScript, `@supabase/ssr`, Tailwind v4.

**Verification note:** This project has no unit-test framework, and these are Supabase-backed server actions / Next server components that aren't meaningfully unit-testable without a mock harness that doesn't fit the codebase. The automated gate for every task is `npm run lint` + `npm run build`. Final acceptance is a manual run (Task 6). This is the honest verification path here; we do not fabricate TDD tests.

**Prerequisite already done:** User turned ON "Confirm email" in Supabase → Authentication → Providers → Email.

---

## File Structure

- `src/lib/strings.ts` — **modify**: add auth status/copy strings + friendly error strings; fix stale `loginHelp*`.
- `src/app/actions/auth.ts` — **modify**: rework signup, map sign-in errors, add `requestPasswordReset` + `updatePassword`, add `mapAuthError` + `getOrigin` helpers.
- `src/app/login/login-form.tsx` — **modify**: add `forgot` mode, "Forgot password?" link, shared "email sent" panel.
- `src/app/reset-password/page.tsx` — **create**: server component guard + render form.
- `src/app/reset-password/reset-password-form.tsx` — **create**: set-new-password client form.

---

## Task 1: Add Sorani copy and friendly error strings

**Files:**
- Modify: `src/lib/strings.ts`

- [ ] **Step 1: Add auth UI copy to the `t` object**

In `src/lib/strings.ts`, inside the `export const t = { ... }` object, replace the existing `loginHelp` / `loginHelpSub` lines and extend the `// Auth` section. Locate:

```ts
  loginHelp: "هەر ئیمەیڵ و وشەیەکی نهێنی بەکاربهێنە بۆ تاقیکردنەوە.",
  loginHelpSub: "پشتڕاستکردنەوەی ئیمەیڵ ناچالاکە بۆ تاقیکردنەوەی ناوخۆیی.",
```

Replace those two lines with:

```ts
  loginHelp: "بازاڕێکی خۆجێیی و متمانەپێکراو بۆ گەڕەکەکەت.",
  loginHelpSub: "بە چوونەژوورەوە، ڕازیبوونت بە مەرجەکانی بەکارهێنان دەردەبڕیت.",

  // Password reset + email verification
  forgotPassword: "وشەی نهێنیت لەبیرچووە؟",
  forgotTitle: "ڕێکخستنەوەی وشەی نهێنی",
  forgotSubtitle: "ناونیشانی ئیمەیڵەکەت بنووسە، بەستەرێکی ڕێکخستنەوەت بۆ دەنێرین.",
  sendResetLink: "ناردنی بەستەری ڕێکخستنەوە",
  sendingResetLink: "ناردن…",
  checkInboxTitle: "ئیمەیڵەکەت بپشکنە",
  checkInboxSignup:
    "بەستەرێکی پشتڕاستکردنەوەمان بۆ ناردیت. کلیکی لێبکە بۆ چالاککردنی هەژمارەکەت.",
  checkInboxReset:
    "ئەگەر هەژمارێک بەم ئیمەیڵە هەبێت، بەستەرێکی ڕێکخستنەوەمان بۆ ناردووە.",
  backToSignIn: "گەڕانەوە بۆ چوونەژوورەوە",
  resetPasswordTitle: "وشەی نهێنی نوێ دابنێ",
  resetPasswordSubtitle: "وشەیەکی نهێنی نوێ بۆ هەژمارەکەت دابنێ.",
  newPasswordLabel: "وشەی نهێنی نوێ",
  confirmPasswordLabel: "دووبارەکردنەوەی وشەی نهێنی",
  updatePassword: "نوێکردنەوەی وشەی نهێنی",
  updatingPassword: "نوێکردنەوە…",
```

- [ ] **Step 2: Add friendly error strings to the `errors` object**

In the same file, inside `export const errors = { ... }`, after the existing `enterPassword` line add:

```ts
  wrongCredentials: "ئیمەیڵ یان وشەی نهێنی هەڵەیە.",
  emailNotConfirmed: "تکایە سەرەتا ئیمەیڵەکەت پشتڕاست بکەرەوە. ئیمەیڵەکەت بپشکنە.",
  passwordsDoNotMatch: "وشەکانی نهێنی وەک یەک نین.",
  authGeneric: "هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.",
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: PASS (strings file is type-checked; no unused-symbol errors because these are consumed in later tasks within the same build only after those tasks — so run the full lint+build at Task 5, but confirm no syntax error now).

Note: TypeScript will NOT error on unused object properties, so lint+build passes here standalone.

- [ ] **Step 4: Commit**

```bash
git add src/lib/strings.ts
git commit -m "feat(auth): add Sorani copy and friendly error strings for verification + reset"
```

---

## Task 2: Rework auth server actions

**Files:**
- Modify: `src/app/actions/auth.ts`

- [ ] **Step 1: Replace the entire file contents**

Replace all of `src/app/actions/auth.ts` with:

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { errors } from "@/lib/strings";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthResult = {
  success?: boolean;
  error?: string;
  emailSent?: boolean;
};

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return trimmed;
  return null;
}

/** Build the site origin from request headers (works on Vercel + localhost). */
async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/** Map raw Supabase auth error messages to friendly Sorani copy. */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return errors.wrongCredentials;
  if (m.includes("email not confirmed")) return errors.emailNotConfirmed;
  if (m.includes("password")) return errors.passwordTooShort;
  return errors.authGeneric;
}

/**
 * Sign up a new user with email + password.
 * "Confirm email" is ON in Supabase, so no session is created here — the user
 * must click the emailed confirmation link. We return { emailSent: true } and
 * the form shows a "check your inbox" panel.
 */
export async function signUpWithPassword(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const email = validateEmail((formData.get("email") as string) || "");
  const password = formData.get("password") as string;

  if (!email) return { error: errors.invalidEmail };
  if (!password || password.length < 6) {
    return { error: errors.passwordTooShort };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: mapAuthError(error.message) };

  // Anti-enumeration: an already-registered email returns success with an empty
  // `identities` array. Show the same "check your inbox" panel either way so we
  // don't leak which emails exist, while genuine new users still get a link.
  return { emailSent: true };
}

/** Sign in an existing user with email + password. */
export async function signInWithPassword(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const email = validateEmail((formData.get("email") as string) || "");
  const password = formData.get("password") as string;

  if (!email) return { error: errors.invalidEmail };
  if (!password) return { error: errors.enterPassword };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: mapAuthError(error.message) };

  redirect("/");
}

/** Send a password-reset link. Always reports success (no enumeration leak). */
export async function requestPasswordReset(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const email = validateEmail((formData.get("email") as string) || "");
  if (!email) return { error: errors.invalidEmail };

  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { emailSent: true };
}

/** Set a new password for the recovery-authenticated user. */
export async function updatePassword(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 6) {
    return { error: errors.passwordTooShort };
  }
  if (password !== confirm) return { error: errors.passwordsDoNotMatch };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapAuthError(error.message) };

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: PASS. `redirect` is called outside any try/catch (satisfies Next 16 rule). No unused vars.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/auth.ts
git commit -m "feat(auth): verify-before-access signup, error mapping, reset actions"
```

---

## Task 3: Update login form (forgot mode + email-sent panel)

**Files:**
- Modify: `src/app/login/login-form.tsx`

- [ ] **Step 1: Replace the entire file contents**

Replace all of `src/app/login/login-form.tsx` with:

```tsx
"use client";

import { useActionState, useState } from "react";
import {
  signInWithPassword,
  signUpWithPassword,
  requestPasswordReset,
  type AuthResult,
} from "@/app/actions/auth";
import { t } from "@/lib/strings";

type Mode = "signin" | "signup" | "forgot";

const inputClass =
  "w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card " +
  "text-ink text-[15px] font-sans placeholder:text-stone/50 " +
  "focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");

  const action =
    mode === "signin"
      ? signInWithPassword
      : mode === "signup"
        ? signUpWithPassword
        : requestPasswordReset;

  const [state, formAction, pending] = useActionState<
    AuthResult | undefined,
    FormData
  >(action, undefined);

  // Success panel: signup or reset-request sent an email.
  if (state?.emailSent) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold font-display text-ink mb-2">
          {t.checkInboxTitle}
        </h2>
        <p className="text-sm text-stone mb-6">
          {mode === "signup" ? t.checkInboxSignup : t.checkInboxReset}
        </p>
        <button
          type="button"
          onClick={() => setMode("signin")}
          className="text-teal hover:text-teal-deep font-semibold text-sm transition-colors cursor-pointer"
        >
          {t.backToSignIn}
        </button>
      </div>
    );
  }

  const title =
    mode === "signin"
      ? t.signInTitle
      : mode === "signup"
        ? t.signUpTitle
        : t.forgotTitle;
  const subtitle =
    mode === "signin"
      ? t.signInSubtitle
      : mode === "signup"
        ? t.signUpSubtitle
        : t.forgotSubtitle;

  return (
    <div>
      <h2 className="text-lg font-semibold font-display text-ink mb-1">
        {title}
      </h2>
      <p className="text-sm text-stone mb-5">{subtitle}</p>

      <form action={formAction}>
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email-input" className={labelClass}>
            {t.emailLabel}
          </label>
          <input
            id="email-input"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>

        {/* Password — hidden in forgot mode */}
        {mode !== "forgot" && (
          <div className="mb-2">
            <label htmlFor="password-input" className={labelClass}>
              {t.passwordLabel}
            </label>
            <input
              id="password-input"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              className={inputClass}
            />
          </div>
        )}

        {/* Forgot password link — only in sign-in mode */}
        {mode === "signin" && (
          <div className="text-left mt-2">
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-xs text-teal hover:text-teal-deep font-semibold transition-colors cursor-pointer"
            >
              {t.forgotPassword}
            </button>
          </div>
        )}

        {state?.error && <p className="text-sm text-clay mt-2">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full mt-6 py-3.5 rounded-lg bg-teal text-white font-bold text-[15px]
                     hover:bg-teal-deep active:bg-teal-deep transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending
            ? mode === "signin"
              ? t.signingIn
              : mode === "signup"
                ? t.creatingAccount
                : t.sendingResetLink
            : mode === "signin"
              ? t.signIn
              : mode === "signup"
                ? t.createAccount
                : t.sendResetLink}
        </button>
      </form>

      {/* Mode toggle between sign in / sign up */}
      <div className="mt-5 text-center text-sm">
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-teal hover:text-teal-deep font-semibold transition-colors cursor-pointer"
        >
          {mode === "signin" ? t.toSignUp : t.toSignIn}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/login-form.tsx
git commit -m "feat(auth): add forgot-password mode and check-inbox panel to login form"
```

---

## Task 4: Create the reset-password page

**Files:**
- Create: `src/app/reset-password/page.tsx`
- Create: `src/app/reset-password/reset-password-form.tsx`

- [ ] **Step 1: Create the server component guard**

Create `src/app/reset-password/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { t } from "@/lib/strings";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only reachable with a recovery session (arrived via /auth/callback).
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight font-display text-ink">
            Benaw<span className="text-saffron">Bara</span>
          </h1>
        </div>
        <div className="bg-card rounded-2xl border border-sand-2 p-6 shadow-sm">
          <h2 className="text-lg font-semibold font-display text-ink mb-1">
            {t.resetPasswordTitle}
          </h2>
          <p className="text-sm text-stone mb-5">{t.resetPasswordSubtitle}</p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the client form**

Create `src/app/reset-password/reset-password-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { updatePassword, type AuthResult } from "@/app/actions/auth";
import { t } from "@/lib/strings";

const inputClass =
  "w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card " +
  "text-ink text-[15px] font-sans placeholder:text-stone/50 " +
  "focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5";

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState<
    AuthResult | undefined,
    FormData
  >(updatePassword, undefined);

  return (
    <form action={action}>
      <div className="mb-4">
        <label htmlFor="password-input" className={labelClass}>
          {t.newPasswordLabel}
        </label>
        <input
          id="password-input"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </div>

      <div className="mb-2">
        <label htmlFor="confirm-input" className={labelClass}>
          {t.confirmPasswordLabel}
        </label>
        <input
          id="confirm-input"
          name="confirm"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-clay mt-2">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-6 py-3.5 rounded-lg bg-teal text-white font-bold text-[15px]
                   hover:bg-teal-deep active:bg-teal-deep transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? t.updatingPassword : t.updatePassword}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: PASS, and `/reset-password` appears in the route list.

- [ ] **Step 4: Commit**

```bash
git add src/app/reset-password/
git commit -m "feat(auth): add set-new-password reset page"
```

---

## Task 5: Verify proxy allows the recovery flow + full build

**Files:**
- Read only: `src/proxy.ts`

- [ ] **Step 1: Confirm no proxy change is needed**

Read `src/proxy.ts`. Confirm: a recovery-authenticated user hitting `/reset-password` is `user != null`, has a complete profile (existing account), so the profile-setup redirect at rule 3 does NOT fire for them (`pathname !== "/profile-setup"` is true but profile is complete). `/reset-password` is not a public route, which is correct — it requires the recovery session. No edit required.

If a brand-new (never-completed-profile) user somehow triggers reset, rule 3 would bounce them to `/profile-setup` — acceptable, they have no password-protected data yet. Document this; do not add code.

- [ ] **Step 2: Full lint + build**

Run: `npm run lint && npm run build`
Expected: PASS with routes `/`, `/login`, `/profile-setup`, `/reset-password`, `/auth/callback`, `/listings/*` all present.

- [ ] **Step 3: Commit (only if any incidental changes)**

If nothing changed, skip. Otherwise:
```bash
git add -A && git commit -m "chore(auth): confirm proxy recovery-flow behavior"
```

---

## Task 6: Manual acceptance (user-run)

No code. Hand these steps to the user with `npm run dev` running:

- [ ] Sign up with a fresh real email → expect the "check your inbox" panel (Sorani).
- [ ] Open the email, click the confirmation link → land on `/profile-setup`.
- [ ] Sign up again with the **same** email → still see "check your inbox" (no crash, no leak).
- [ ] Sign in with a wrong password → friendly Sorani error, no English text.
- [ ] Sign in with the confirmed account before profile is complete → routed to `/profile-setup`.
- [ ] Click "Forgot password?" → enter email → "check your inbox" → open link → land on `/reset-password` → set a new password → redirected home and logged in.
- [ ] Sign in with the **new** password → success.

---

## Self-review notes

- **Spec coverage:** verification (Task 2 signup + Confirm-email prereq), duplicate handling (Task 2 anti-enumeration comment + always `emailSent`), error mapping (Task 1 strings + Task 2 `mapAuthError`), forgot flow (Task 2 `requestPasswordReset` + Task 3 UI + Task 4 page), stale copy fix (Task 1). All covered.
- **Type consistency:** `AuthResult` gains `emailSent?: boolean` (Task 2) and is consumed in Tasks 3 & 4. Action names `signUpWithPassword`, `signInWithPassword`, `requestPasswordReset`, `updatePassword` are consistent across files.
- **No placeholders:** every code step shows full content.
- **Next 16 rules:** `redirect()` is always outside try/catch; `headers()` and `cookies()` are awaited.
