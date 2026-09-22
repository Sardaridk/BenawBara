import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (replaces the old middleware.ts convention).
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session.
 * 2. Redirect anonymous users to `/login`.
 * 3. Enforce profile completion redirect to `/profile-setup` for new accounts.
 */

const PUBLIC_ROUTES = ["/login", "/auth/callback", "/reset-password"];
const AUTH_REDIRECT_ROUTES = ["/login"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. If not logged in AND trying to access protected route -> redirect to login
  if (!user && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in AND on login page -> redirect to home
  if (user && AUTH_REDIRECT_ROUTES.some((r) => pathname.startsWith(r))) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  // 3. If logged in AND profile is incomplete -> enforce profile-setup page
  if (user && pathname !== "/profile-setup" && pathname !== "/reset-password") {
    // Fetch profile columns to check completeness
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, location")
      .eq("id", user.id)
      .single();

    if (!profile?.name || !profile?.location) {
      const setupUrl = request.nextUrl.clone();
      setupUrl.pathname = "/profile-setup";
      return NextResponse.redirect(setupUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - svg / png / jpg / jpeg / gif / webp (static assets)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
