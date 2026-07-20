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
