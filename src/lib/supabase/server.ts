import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client (for Server Components, Server Actions, Route Handlers).
 *
 * Must be called inside a request context where `cookies()` is available.
 * Creates a fresh client per request — do NOT cache or share across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` is called from a Server Component where cookies
            // cannot be mutated. This is safe to ignore — the proxy
            // (proxy.ts) will refresh the session on the next request.
          }
        },
      },
    },
  );
}
