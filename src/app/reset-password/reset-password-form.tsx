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
