import { t } from "@/lib/strings";
import ResetPasswordForm from "./reset-password-form";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
}) {
  const params = await searchParams;

  // If Supabase redirected directly to /reset-password with a PKCE code or OTP token_hash,
  // bounce through /auth/callback so the Route Handler can exchange it and set auth cookies.
  if (params.code) {
    redirect(
      `/auth/callback?code=${encodeURIComponent(params.code)}&next=/reset-password&type=recovery`
    );
  }
  if (params.token_hash) {
    redirect(
      `/auth/callback?token_hash=${encodeURIComponent(
        params.token_hash
      )}&type=${encodeURIComponent(params.type || "recovery")}&next=/reset-password`
    );
  }
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
