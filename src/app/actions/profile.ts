"use server";

import { createClient } from "@/lib/supabase/server";
import { errors } from "@/lib/strings";
import { redirect } from "next/navigation";

export type ProfileResult = {
  success?: boolean;
  error?: string;
};

/**
 * Validate phone input. Must be E.164-ish or clear numbers format.
 */
function validatePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  if (/^\+?\d{7,15}$/.test(cleaned)) {
    // Ensure it starts with country code or standard +
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  }
  return null;
}

/**
 * Update the user's profile table row.
 */
export async function updateProfile(
  _prev: ProfileResult | undefined,
  formData: FormData,
): Promise<ProfileResult> {
  const name = (formData.get("name") as string || "").trim();
  const location = (formData.get("location") as string || "").trim();
  const rawPhone = (formData.get("phone") as string || "").trim();

  if (!name || name.length < 2) {
    return { error: errors.nameTooShort };
  }
  if (!location || location.length < 2) {
    return { error: errors.locationTooShort };
  }

  const phone = validatePhone(rawPhone);
  if (!phone) {
    return { error: errors.invalidPhone };
  }

  const supabase = await createClient();

  // Get active authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication session not found." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      location,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Redirect to home page upon completion
  redirect("/");
}
