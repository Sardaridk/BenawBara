"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileResult } from "@/app/actions/profile";
import { t } from "@/lib/strings";

type ProfileFormProps = {
  initialProfile?: {
    name: string | null;
    location: string | null;
    phone: string | null;
  };
};

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [state, action, pending] = useActionState<ProfileResult | undefined, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="name-input"
          className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
        >
          {t.fullNameLabel}
        </label>
        <input
          id="name-input"
          name="name"
          type="text"
          placeholder={t.fullNamePlaceholder}
          defaultValue={initialProfile?.name || ""}
          required
          className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                     text-ink text-[15px] font-sans placeholder:text-stone/50
                     focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                     transition-colors"
        />
        <p className="text-[11px] text-stone mt-1">
          {t.fullNameHelp}
        </p>
      </div>

      {/* Neighborhood / Location */}
      <div>
        <label
          htmlFor="location-input"
          className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
        >
          {t.locationLabel}
        </label>
        <input
          id="location-input"
          name="location"
          type="text"
          placeholder={t.locationPlaceholder}
          defaultValue={initialProfile?.location || ""}
          required
          className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                     text-ink text-[15px] font-sans placeholder:text-stone/50
                     focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                     transition-colors"
        />
        <p className="text-[11px] text-stone mt-1">
          {t.locationHelp}
        </p>
      </div>

      {/* WhatsApp Number */}
      <div>
        <label
          htmlFor="phone-input"
          className="block text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-1.5"
        >
          {t.whatsappLabel}
        </label>
        <input
          id="phone-input"
          name="phone"
          type="tel"
          placeholder={t.whatsappPlaceholder}
          defaultValue={initialProfile?.phone || ""}
          required
          className="w-full px-3 py-3 rounded-lg border-[1.5px] border-sand-2 bg-card
                     text-ink text-[15px] font-sans placeholder:text-stone/50
                     focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
                     transition-colors"
        />
        <p className="text-[11px] text-stone mt-1">
          {t.whatsappHelp}
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-clay pt-1">{state.error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full mt-6 py-3.5 rounded-lg bg-teal text-white font-bold text-[15px]
                   hover:bg-teal-deep active:bg-teal-deep transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? t.savingProfile : t.saveAndContinue}
      </button>
    </form>
  );
}
