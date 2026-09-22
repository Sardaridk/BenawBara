import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listingPhotoUrl } from "@/lib/supabase/storage";
import { toggleSold, deleteListing } from "@/app/actions/listings";
import { t, CATEGORY_LABELS } from "@/lib/strings";

type MyListingsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

const CAT_COLORS: Record<string, string> = {
  electronics: "#DCEEEC",
  furniture: "#F3E6D8",
  vehicles: "#E4E9F2",
  realestate: "#EAE3F0",
  fashion: "#FBE3E0",
  jobs: "#E6F0DC",
  other: "#EFE7D4",
};

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const { tab = "active" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's listings
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const allListings = listings || [];
  const activeListings = allListings.filter((l) => !l.sold);
  const soldListings = allListings.filter((l) => l.sold);

  const currentList = tab === "sold" ? soldListings : activeListings;
  const userName = profile?.name || user.email?.split("@")[0] || t.seller;

  return (
    <div className="flex flex-col min-h-screen bg-sand text-ink px-4 py-8">
      <div className="max-w-2xl w-full mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-stone hover:text-ink text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            ← {t.backToMarket}
          </Link>

          <Link
            href="/listings/new"
            className="px-3.5 py-1.5 rounded-lg bg-saffron text-ink text-xs font-bold hover:brightness-105 transition-all cursor-pointer shadow-xs"
          >
            + {t.postListingTitle}
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="bg-card rounded-2xl border border-sand-2 p-5 mb-8 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-ink leading-snug">
                {userName}
              </h1>
              <p className="text-xs text-stone">
                📍 {profile?.location || "—"} {profile?.phone && `· 📱 ${profile.phone}`}
              </p>
            </div>
          </div>

          <Link
            href="/profile-setup?edit=1"
            className="px-3 py-1.5 rounded-lg border border-sand-2 text-stone hover:text-ink text-xs font-semibold hover:border-stone transition-all cursor-pointer whitespace-nowrap"
          >
            ✏️ {t.editProfile}
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-sand-2 mb-6">
          <Link
            href="/my-listings?tab=active"
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              tab !== "sold"
                ? "border-teal text-teal"
                : "border-transparent text-stone hover:text-ink"
            }`}
          >
            <span>{t.activeListings}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand-2/60 text-ink font-mono">
              {activeListings.length}
            </span>
          </Link>

          <Link
            href="/my-listings?tab=sold"
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              tab === "sold"
                ? "border-teal text-teal"
                : "border-transparent text-stone hover:text-ink"
            }`}
          >
            <span>{t.soldListings}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand-2/60 text-ink font-mono">
              {soldListings.length}
            </span>
          </Link>
        </div>

        {/* Listings List / Grid */}
        {currentList.length === 0 ? (
          <div className="text-center py-16 text-stone bg-card/60 rounded-2xl border border-sand-2 p-8">
            <div className="text-3xl mb-3">{tab === "sold" ? "🏷️" : "📦"}</div>
            <h3 className="text-base font-semibold font-display text-ink mb-1">
              {tab === "sold" ? t.noSoldListings : t.noMyListings}
            </h3>
            {tab !== "sold" && (
              <div className="mt-5">
                <Link
                  href="/listings/new"
                  className="inline-block px-5 py-2.5 rounded-lg bg-teal text-white text-sm font-bold hover:bg-teal-deep transition-colors cursor-pointer"
                >
                  {t.postFirstListing}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((l) => (
              <div
                key={l.id}
                className="bg-card rounded-2xl border border-sand-2 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className="w-16 h-16 rounded-xl relative overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: CAT_COLORS[l.category] || "#EFE7D4" }}
                  >
                    {listingPhotoUrl(l.image_path) ? (
                      <Image
                        src={listingPhotoUrl(l.image_path)!}
                        alt={l.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      l.emoji
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/listings/${l.id}`}
                      className="font-semibold text-sm text-ink hover:text-teal transition-colors block truncate"
                    >
                      {l.title}
                    </Link>
                    <div className="text-[11px] text-stone mt-1 flex items-center gap-2">
                      <span>🏷️ {CATEGORY_LABELS[l.category] || l.category}</span>
                      <span>·</span>
                      <span>📍 {l.location}</span>
                    </div>
                    <div className="ticket text-xs mt-2 self-start inline-block">
                      {Number(l.price).toLocaleString("en-US")} {t.currency}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-sand-2">
                  <Link
                    href={`/listings/${l.id}/edit`}
                    className="px-3 py-1.5 rounded-lg border border-sand-2 text-stone hover:text-ink text-xs font-semibold hover:border-stone transition-all cursor-pointer"
                  >
                    {t.editListing}
                  </Link>

                  <form action={toggleSold.bind(null, l.id, l.sold)}>
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        l.sold
                          ? "bg-sand-2 text-ink hover:bg-stone/20"
                          : "bg-clay/10 text-clay hover:bg-clay/20"
                      }`}
                    >
                      {l.sold ? t.markAvailable : t.markSold}
                    </button>
                  </form>

                  <form action={deleteListing.bind(null, l.id)}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg text-stone hover:text-clay transition-colors cursor-pointer"
                      title={t.deleteListing}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
