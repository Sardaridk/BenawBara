import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ListingForm from "../listing-form";
import { t } from "@/lib/strings";

export default async function NewListingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to prefill neighborhood
  const { data: profile } = await supabase
    .from("profiles")
    .select("location")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight font-display text-ink">
            {t.postListingTitle}
          </h1>
          <Link
            href="/"
            className="text-stone hover:text-ink text-sm font-semibold transition-colors cursor-pointer"
          >
            {t.cancel}
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-sand-2 p-6 shadow-sm">
          <ListingForm defaultLocation={profile?.location || ""} />
        </div>
      </div>
    </div>
  );
}
