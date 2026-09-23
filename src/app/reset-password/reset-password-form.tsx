"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t, errors } from "@/lib/strings";

const inputClass =
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

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // 1. Check for errors in the hash or query string
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(search);

      const errorParam = hashParams.get("error") || searchParams.get("error");
      const errorCode =
        hashParams.get("error_code") || searchParams.get("error_code");

      if (errorParam || errorCode) {
        setError(errors.sessionExpired);
        setHasSession(false);
        return;
      }

      // 2. If access_token is in hash fragment, establish session
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ data, error: setSessionErr }) => {
            if (setSessionErr || !data.session) {
              console.error("[reset-password] setSession error:", setSessionErr);
              setError(errors.sessionExpired);
              setHasSession(false);
            } else {
              setHasSession(true);
            }
          });
        return;
      }
    }

    // 3. Otherwise check current session or auth state change
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasSession(true);
      } else {
        // Wait briefly in case onAuthStateChange is about to emit
        const { data: sub } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (session || event === "PASSWORD_RECOVERY") {
              setHasSession(true);
            }
          }
        );
        const timer = setTimeout(() => {
          setHasSession((prev) => (prev === null ? false : prev));
        }, 1000);
        return () => {
          sub.subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError(errors.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(errors.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });

    if (updateErr) {
      setLoading(false);
      console.error("[reset-password] update error:", updateErr);
      const msg = updateErr.message?.toLowerCase() || "";
      const code = (updateErr as { code?: string })?.code || "";

      if (
        msg.includes("different") ||
        msg.includes("same_password") ||
        code === "same_password"
      ) {
        setError(errors.samePassword);
      } else if (
        msg.includes("session") ||
        msg.includes("auth") ||
        msg.includes("token") ||
        updateErr.status === 400
      ) {
        setError(errors.sessionExpired);
        setHasSession(false);
      } else if (
        msg.includes("weak") ||
        msg.includes("short") ||
        msg.includes("character")
      ) {
        setError(errors.passwordTooShort);
      } else {
        setError(updateErr.message || errors.authGeneric);
      }
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3 text-xl">
          ✓
        </div>
        <p className="text-sm font-semibold text-ink">
          وشەی نهێنی بە سەرکەوتوویی نوێکرایەوە! دەتگوازینەوە…
        </p>
      </div>
    );
  }

  if (hasSession === false) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-clay/10 text-clay flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <p className="text-sm text-clay font-medium leading-relaxed">
          {error || errors.sessionExpired}
        </p>
        <p className="text-xs text-stone">
          {t.noResetSession}
        </p>
        <div className="pt-2">
          <a
            href="/login"
            className="inline-block px-5 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal-deep transition-colors"
          >
            {t.requestNewResetLink}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password-input" className={labelClass}>
          {t.newPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="password-input"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className={inputClass}
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

      <div>
        <label htmlFor="confirm-input" className={labelClass}>
          {t.confirmPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="confirm-input"
            name="confirm"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center px-1 text-stone hover:text-ink transition-colors cursor-pointer"
            aria-label={showConfirm ? t.hidePassword : t.showPassword}
            tabIndex={-1}
          >
            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 py-3.5 rounded-lg bg-teal text-white font-bold text-[15px]
                   hover:bg-teal-deep active:bg-teal-deep transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? t.updatingPassword : t.updatePassword}
      </button>
    </form>
  );
}
