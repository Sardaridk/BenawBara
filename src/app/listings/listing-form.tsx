"use client";

import { useActionState, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  createListing,
  updateListing,
  type ListingResult,
} from "@/app/actions/listings";
import { createClient } from "@/lib/supabase/client";
import { LISTING_PHOTOS_BUCKET, listingPhotoUrl, safeUuid } from "@/lib/supabase/storage";
import { t, CATEGORY_LABELS } from "@/lib/strings";

type CategoryOption = {
  id: string;
  label: string;
  icons: string[];
};

const CATEGORIES: CategoryOption[] = [
  { id: "electronics", label: CATEGORY_LABELS.electronics, icons: ["📱", "💻", "🎧", "📺", "🎮"] },
  { id: "furniture", label: CATEGORY_LABELS.furniture, icons: ["🛋️", "🪑", "🛏️", "🗄️"] },
  { id: "vehicles", label: CATEGORY_LABELS.vehicles, icons: ["🚗", "🏍️", "🚲"] },
  { id: "realestate", label: CATEGORY_LABELS.realestate, icons: ["🏠", "🏢", "🏬"] },
  { id: "fashion", label: CATEGORY_LABELS.fashion, icons: ["👕", "👗", "👟", "👜"] },
  { id: "jobs", label: CATEGORY_LABELS.jobs, icons: ["💼"] },
  { id: "other", label: CATEGORY_LABELS.other, icons: ["📦", "🎁", "🔧", "📚"] },
];

export type ListingInitial = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  location: string;
  emoji: string;
  image_path: string | null;
};

type ListingFormProps = {
  /** Prefilled neighborhood for new listings. */
  defaultLocation?: string;
  /** When present, the form edits this listing instead of creating one. */
  initial?: ListingInitial;
};

export default function ListingForm({ defaultLocation = "", initial }: ListingFormProps) {
  const isEdit = Boolean(initial);

  // Resolve the initial category/emoji from the existing listing when editing.
  const initialCat =
    (initial && CATEGORIES.find((c) => c.id === initial.category)) || CATEGORIES[0];

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [selectedEmoji, setSelectedEmoji] = useState(
    initial?.emoji || initialCat.icons[0],
  );

  // Photo upload state. We upload the compressed image to Storage as soon as
  // it's picked, then carry the resulting object path through a hidden field.
  const [imagePath, setImagePath] = useState<string | null>(initial?.image_path ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    listingPhotoUrl(initial?.image_path),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track the photo the listing was saved with, so we don't delete the still-
  // referenced original when the user re-picks during an edit. The server
  // handles cleanup of the replaced original on save.
  const savedImagePath = useRef<string | null>(initial?.image_path ?? null);

  const boundAction = isEdit ? updateListing.bind(null, initial!.id) : createListing;
  const [state, action, pending] = useActionState<ListingResult | undefined, FormData>(
    boundAction,
    undefined,
  );

  function handleCategoryChange(catId: string) {
    const found = CATEGORIES.find((c) => c.id === catId);
    if (found) {
      setSelectedCat(found);
      setSelectedEmoji(found.icons[0]);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUploadError(t.uploadSessionExpired);
        return;
      }

      // Compress client-side before upload to keep uploads fast and cheap.
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: "image/webp",
      });

      // Remove the previously uploaded photo for this in-progress edit so we
      // don't leave orphans when re-picking — but never delete the saved
      // original (the server does that on save if it changed).
      if (imagePath && imagePath !== savedImagePath.current) {
        await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([imagePath]);
      }

      const path = `${user.id}/${safeUuid()}.webp`;
      const { error } = await supabase.storage
        .from(LISTING_PHOTOS_BUCKET)
        .upload(path, compressed, { contentType: "image/webp", upsert: false });

      if (error) {
        console.error("Storage upload failed:", error);
        setUploadError(t.uploadFailed);
        return;
      }

      setImagePath(path);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch (err) {
      console.error("Photo processing failed:", err);
      setUploadError(t.uploadProcessFailed);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    // Only delete from storage if it's a freshly uploaded (unsaved) photo.
    if (imagePath && imagePath !== savedImagePath.current) {
      const supabase = createClient();
      await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([imagePath]);
    }
    setImagePath(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={action} className="space-y-5">
      {/* Title */}
      <div>
        <label
          htmlFor="title-input"
          className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
        >
          {t.titleLabel}
        </label>
        <input
          id="title-input"
          name="title"
          type="text"
          placeholder={t.titlePlaceholder}
          defaultValue={initial?.title || ""}
          required
          className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                     text-ink text-[15px] font-sans placeholder:text-stone/50
                     focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                     transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category-select"
          className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
        >
          {t.categoryLabel}
        </label>
        <select
          id="category-select"
          name="category"
          value={selectedCat.id}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                     text-ink text-[15px] font-sans focus:outline-none focus:border-teal
                     transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {CATEGORY_LABELS[c.id]}
            </option>
          ))}
        </select>
      </div>

      {/* Emoji Picker */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5">
          {t.selectIcon}
        </label>
        <input type="hidden" name="emoji" value={selectedEmoji} />
        <div className="flex flex-wrap gap-2.5">
          {selectedCat.icons.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji)}
              className={`w-11 h-11 text-xl flex items-center justify-center rounded-lg border-[1.5px]
                         transition-colors cursor-pointer bg-card
                         ${
                           selectedEmoji === emoji
                             ? "border-teal bg-teal/5"
                             : "border-sand-2 hover:border-stone"
                         }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Photo (optional) */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5">
          {t.photoLabel} <span className="font-medium normal-case tracking-normal">{t.photoOptional}</span>
        </label>
        <input type="hidden" name="image_path" value={imagePath ?? ""} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
          id="photo-input"
        />

        {previewUrl ? (
          <div className="media-frame aspect-[4/3] w-full rounded-lg border-[1.5px] border-sand-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={t.photoPreviewAlt}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 end-2 bg-ink/80 text-sand text-xs font-semibold
                         px-3 py-1.5 rounded-lg hover:bg-ink transition-colors cursor-pointer"
            >
              {t.removePhoto}
            </button>
          </div>
        ) : (
          <label
            htmlFor="photo-input"
            className={`flex flex-col items-center justify-center gap-1.5 w-full h-28 rounded-lg
                       border-[1.5px] border-dashed border-sand-2 bg-card text-stone
                       transition-colors cursor-pointer hover:border-teal
                       ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <span className="text-sm font-semibold">{t.uploading}</span>
            ) : (
              <>
                <span className="text-2xl">📷</span>
                <span className="text-xs font-semibold">{t.addPhoto}</span>
              </>
            )}
          </label>
        )}

        {uploadError && <p className="text-sm text-clay pt-1.5">{uploadError}</p>}
      </div>

      {/* Price & Location Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price-input"
            className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
          >
            {t.priceLabel}
          </label>
          <input
            id="price-input"
            name="price"
            type="number"
            placeholder={t.pricePlaceholder}
            defaultValue={initial ? String(initial.price) : ""}
            required
            className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                       text-ink text-[15px] font-sans placeholder:text-stone/50
                       focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                       transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="location-input"
            className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
          >
            {t.neighborhoodLabel}
          </label>
          <input
            id="location-input"
            name="location"
            type="text"
            placeholder={t.neighborhoodPlaceholder}
            defaultValue={initial?.location || defaultLocation}
            required
            className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                       text-ink text-[15px] font-sans placeholder:text-stone/50
                       focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                       transition-colors"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description-textarea"
          className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
        >
          {t.description}
        </label>
        <textarea
          id="description-textarea"
          name="description"
          placeholder={t.descriptionPlaceholder}
          defaultValue={initial?.description || ""}
          className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                     text-ink text-[15px] font-sans placeholder:text-stone/50
                     focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                     transition-colors min-h-[100px] resize-y"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-clay pt-1">{state.error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending || uploading}
        className="w-full mt-6 py-3.5 rounded-lg bg-teal text-white font-bold text-[15px]
                   hover:bg-teal-deep active:bg-teal-deep transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {pending
          ? isEdit
            ? t.savingChanges
            : t.creatingListing
          : uploading
            ? t.waitingForPhoto
            : isEdit
              ? t.saveChanges
              : t.postListing}
      </button>
    </form>
  );
}
