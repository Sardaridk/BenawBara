import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route handler for the Supabase authentication callback.
 *
 * Exchanges the temporary PKCE `code` parameter for a permanent
 * session and sets the auth cookies, then redirects the user home.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login page on error or missing code
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
