"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t, errors } from "@/lib/strings";

const inputClass =
  "w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card " +
  "text-ink text-[15px] font-sans placeholder:text-stone/50 " +
  "focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setError(errors.authGeneric);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password-input" className={labelClass}>
          {t.newPasswordLabel}
        </label>
        <input
          id="password-input"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="confirm-input" className={labelClass}>
          {t.confirmPasswordLabel}
        </label>
        <input
          id="confirm-input"
          name="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          className={inputClass}
        />
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
