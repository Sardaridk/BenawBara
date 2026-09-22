/**
 * Storage helpers for listing photos.
 *
 * We persist the object PATH (e.g. "{user_id}/{uuid}.webp") on each listing
 * rather than a full URL, so we can rebuild public URLs here and delete the
 * underlying object during cleanup.
 */

export const LISTING_PHOTOS_BUCKET = "listing-photos";

/**
 * Generate a RFC-4122 v4 UUID that works in non-secure contexts too.
 *
 * `crypto.randomUUID()` is only defined in a secure context (HTTPS or
 * localhost). When the app is opened over plain HTTP on the LAN — e.g. a phone
 * hitting http://192.168.x.x:3000 — that method is missing and calling it
 * throws. `crypto.getRandomValues()` IS available everywhere, so we build the
 * UUID from it, falling back to Math.random only if crypto is entirely absent.
 */
export function safeUuid(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();

  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  // Per RFC 4122 §4.4: set version (4) and variant bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

/**
 * Build the public URL for a listing photo path. Returns null when there is
 * no photo. Works on both server and client (uses the public env var).
 */
export function listingPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${LISTING_PHOTOS_BUCKET}/${path}`;
}
