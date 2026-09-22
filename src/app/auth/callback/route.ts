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

  // 1. Exchange PKCE code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  }

  // 2. Verify OTP token hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] verifyOtp failed:", error.message);
  }

  // 3. If next is reset-password or type is recovery, allow reaching /reset-password
  // so the client-side Supabase client can parse hash fragments (#access_token=...)
  if (next.includes("reset-password") || type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Redirect to login page on error or missing code
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
