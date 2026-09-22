import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
import { t } from "@/lib/strings";

type ProfileSetupProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function ProfileSetupPage({ searchParams }: ProfileSetupProps) {
  const { edit } = await searchParams;
  const isEditing = edit === "1";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch their profile row
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, location, phone")
    .eq("id", user.id)
    .single();

  // If they already completed setup and not in edit mode, redirect home
  if (profile?.name && profile?.location && !isEditing) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        {/* Navigation if editing */}
        {isEditing && (
          <div className="mb-6">
            <Link
              href="/my-listings"
              className="text-stone hover:text-ink text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              ← {t.myListings}
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight font-display text-ink">
            {isEditing ? t.editProfile : t.profileTitle}
          </h1>
          <p className="text-sm text-stone mt-2">
            {t.profileSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-sand-2 p-6 shadow-sm">
          <ProfileForm initialProfile={profile || undefined} />
        </div>
      </div>
    </div>
  );
}
