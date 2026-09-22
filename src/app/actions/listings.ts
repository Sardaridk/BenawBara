"use server";

import { createClient } from "@/lib/supabase/server";
import { LISTING_PHOTOS_BUCKET } from "@/lib/supabase/storage";
import { errors } from "@/lib/strings";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ListingResult = {
  success?: boolean;
  error?: string;
};

const CATEGORIES = [
  "electronics",
  "furniture",
  "vehicles",
  "realestate",
  "fashion",
  "jobs",
  "other",
];

type ListingFields = {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  emoji: string;
  imagePath: string | null;
};

/**
 * Parse + validate the shared listing form fields. Returns either the clean
 * values or an error string. `userId` is used to guard the photo reference.
 */
function parseListingForm(
  formData: FormData,
  userId: string,
): { fields: ListingFields } | { error: string } {
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "").trim();
  const priceRaw = formData.get("price") as string;
  const category = formData.get("category") as string;
  const location = (formData.get("location") as string || "").trim();
  const emoji = formData.get("emoji") as string || "📦";
  const imagePath = (formData.get("image_path") as string || "").trim() || null;

  if (!title || title.length < 3) {
    return { error: errors.titleTooShort };
  }
  if (!location || location.length < 2) {
    return { error: errors.neighborhoodTooShort };
  }

  const price = parseInt(priceRaw, 10);
  if (isNaN(price) || price <= 0) {
    return { error: errors.invalidPrice };
  }

  if (!CATEGORIES.includes(category)) {
    return { error: errors.invalidCategory };
  }

  // Guard: a supplied photo path must live inside this user's own folder.
  // Storage RLS already enforces this on upload, but we double-check here so a
  // forged form field can't attach someone else's object to a listing.
  if (imagePath && !imagePath.startsWith(`${userId}/`)) {
    return { error: errors.invalidPhoto };
  }

  return { fields: { title, description, price, category, location, emoji, imagePath } };
}

/**
 * Server action to create a new listing.
 */
export async function createListing(
  _prev: ListingResult | undefined,
  formData: FormData,
): Promise<ListingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: errors.noSession };
  }

  const parsed = parseListingForm(formData, user.id);
  if ("error" in parsed) return parsed;
  const f = parsed.fields;

  const { error } = await supabase.from("listings").insert({
    seller_id: user.id,
    title: f.title,
    description: f.description,
    price: f.price,
    category: f.category,
    location: f.location,
    emoji: f.emoji,
    image_path: f.imagePath,
  });

  if (error) {
    return { error: error.message };
  }

  // Reload cache for listings feed
  revalidatePath("/");
  redirect("/");
}

/**
 * Server action to update an existing listing. `listingId` is bound in the
 * form. Ownership is enforced by the `seller_id` guard on the update query.
 */
export async function updateListing(
  listingId: string,
  _prev: ListingResult | undefined,
  formData: FormData,
): Promise<ListingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: errors.noSession };
  }

  const parsed = parseListingForm(formData, user.id);
  if ("error" in parsed) return parsed;
  const f = parsed.fields;

  // Fetch the current row (ownership-scoped) so we know the old photo and can
  // confirm the listing exists and belongs to this user.
  const { data: existing } = await supabase
    .from("listings")
    .select("image_path")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .single();

  if (!existing) {
    return { error: errors.listingNotFound };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      title: f.title,
      description: f.description,
      price: f.price,
      category: f.category,
      location: f.location,
      emoji: f.emoji,
      image_path: f.imagePath,
    })
    .eq("id", listingId)
    .eq("seller_id", user.id); // Guard to verify ownership

  if (error) {
    return { error: error.message };
  }

  // If the photo was replaced or removed, clean up the old object (best-effort).
  if (existing.image_path && existing.image_path !== f.imagePath) {
    await supabase.storage
      .from(LISTING_PHOTOS_BUCKET)
      .remove([existing.image_path]);
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listingId}`);
  redirect(`/listings/${listingId}`);
}

/**
 * Toggle the sold status of a listing.
 */
export async function toggleSold(listingId: string, currentSold: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("listings")
    .update({ sold: !currentSold })
    .eq("id", listingId)
    .eq("seller_id", user.id); // Guard to verify ownership

  revalidatePath("/");
  revalidatePath(`/listings/${listingId}`);
}

/**
 * Delete a listing.
 */
export async function deleteListing(listingId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Fetch the photo path first (ownership-scoped) so we can clean up storage
  // after the row is gone.
  const { data: existing } = await supabase
    .from("listings")
    .select("image_path")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .single();

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("seller_id", user.id); // Guard to verify ownership

  // Best-effort photo cleanup — don't block deletion if this fails.
  if (!error && existing?.image_path) {
    await supabase.storage
      .from(LISTING_PHOTOS_BUCKET)
      .remove([existing.image_path]);
  }

  revalidatePath("/");
  redirect("/");
}
