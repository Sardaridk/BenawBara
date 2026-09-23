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
  "w-full px-3.5 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card " +
  "text-ink text-[15px] font-sans placeholder:text-stone/50 " +
  "focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors";

const passwordInputClass =
  "w-full ps-3.5 pe-10 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card " +
  "text-ink text-[15px] font-sans placeholder:text-stone/50 " +
  "focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5";

function EyeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeOffIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);

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
            <div className="relative">
              <input
                id="password-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                className={passwordInputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center px-1 text-stone hover:text-ink transition-colors cursor-pointer"
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
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
