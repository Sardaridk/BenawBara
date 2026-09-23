import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Route handler for Supabase authentication callbacks.
 *
 * Supports both:
 * 1. PKCE code exchange (`?code=...`)
 * 2. OTP token hash verification (`?token_hash=...&type=recovery|email`)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  const isRecoveryIntent =
    type === "recovery" ||
    next.includes("reset-password") ||
    searchParams.get("type") === "recovery";

  // 1. Exchange PKCE code for session
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const rawUser = data.session?.user as unknown as {
        recovery_sent_at?: string;
        amr?: Array<{ method?: string }>;
      } | undefined;

      const isRecoverySession =
        isRecoveryIntent ||
        Boolean(rawUser?.recovery_sent_at) ||
        data.session?.user?.app_metadata?.provider === "recovery" ||
        Boolean(rawUser?.amr?.some((a) => a.method === "recovery"));

      const destination = isRecoverySession ? "/reset-password" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  }

  // 2. Verify OTP token hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      const destination = type === "recovery" || isRecoveryIntent ? "/reset-password" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
    console.error("[auth/callback] verifyOtp failed:", error.message);
  }

  // 3. If next is reset-password or type is recovery, allow reaching /reset-password
  // so the client-side Supabase client can parse hash fragments (#access_token=...)
  if (isRecoveryIntent) {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Redirect to login page on error or missing code
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
