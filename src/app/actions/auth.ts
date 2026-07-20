"use server";

import { createClient } from "@/lib/supabase/server";
import { errors } from "@/lib/strings";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthResult = {
  success?: boolean;
  error?: string;
  emailSent?: boolean;
};

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return trimmed;
  return null;
}

/** Build the site origin from request headers (works on Vercel + localhost). */
async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/** Map raw Supabase auth error messages to friendly Sorani copy. */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return errors.wrongCredentials;
  if (m.includes("email not confirmed")) return errors.emailNotConfirmed;
  if (m.includes("password")) return errors.passwordTooShort;
  return errors.authGeneric;
}

/**
 * Sign up a new user with email + password.
 * "Confirm email" is ON in Supabase, so no session is created here — the user
 * must click the emailed confirmation link. We return { emailSent: true } and
 * the form shows a "check your inbox" panel.
 */
export async function signUpWithPassword(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const email = validateEmail((formData.get("email") as string) || "");
  const password = formData.get("password") as string;

  if (!email) return { error: errors.invalidEmail };
  if (!password || password.length < 6) {
    return { error: errors.passwordTooShort };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: mapAuthError(error.message) };

  // Anti-enumeration: an already-registered email returns success with an empty
  // `identities` array. Show the same "check your inbox" panel either way so we
  // don't leak which emails exist, while genuine new users still get a link.
  return { emailSent: true };
}

/** Sign in an existing user with email + password. */
export async function signInWithPassword(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const email = validateEmail((formData.get("email") as string) || "");
  const password = formData.get("password") as string;

  if (!email) return { error: errors.invalidEmail };
  if (!password) return { error: errors.enterPassword };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: mapAuthError(error.message) };

  redirect("/");
}

/** Send a password-reset link. Always reports success (no enumeration leak). */
export async function requestPasswordReset(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const email = validateEmail((formData.get("email") as string) || "");
  if (!email) return { error: errors.invalidEmail };

  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { emailSent: true };
}

/** Set a new password for the recovery-authenticated user. */
export async function updatePassword(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 6) {
    return { error: errors.passwordTooShort };
  }
  if (password !== confirm) return { error: errors.passwordsDoNotMatch };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapAuthError(error.message) };

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
