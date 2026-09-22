import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ListingForm from "../../listing-form";
import { t } from "@/lib/strings";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, description, price, category, location, emoji, image_path, seller_id")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  // Only the owner may edit. Anyone else is bounced to the detail page.
  if (listing.seller_id !== user.id) {
    redirect(`/listings/${id}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight font-display text-ink">
            {t.editListingTitle}
          </h1>
          <Link
            href={`/listings/${id}`}
            className="text-stone hover:text-ink text-sm font-semibold transition-colors cursor-pointer"
          >
            {t.cancel}
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-sand-2 p-6 shadow-sm">
          <ListingForm
            initial={{
              id: listing.id,
              title: listing.title,
              description: listing.description,
              price: listing.price,
              category: listing.category,
              location: listing.location,
              emoji: listing.emoji,
              image_path: listing.image_path,
            }}
          />
        </div>
      </div>
    </div>
  );
}
