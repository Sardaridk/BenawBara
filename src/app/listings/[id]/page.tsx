import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listingPhotoUrl } from "@/lib/supabase/storage";
import { notFound } from "next/navigation";
import { toggleSold, deleteListing } from "@/app/actions/listings";
import { t, CATEGORY_LABELS } from "@/lib/strings";
import ReportModal from "./report-modal";
import ShareButton from "./share-button";

type ListingDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ListingDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, price, location, image_path")
    .eq("id", id)
    .single();

  if (!listing) {
    return {
      title: "ڕاگەیەنراو نەدۆزرایەوە — بەناوبارا",
    };
  }

  const priceFormatted = `${Number(listing.price).toLocaleString("en-US")} ${t.currency}`;
  const pageTitle = `${listing.title} (${priceFormatted}) — بەناوبارا`;
  const pageDescription =
    listing.description ||
    `کڕین و فرۆشتنی ${listing.title} لە گەڕەکی ${listing.location}. پەیوەندی ڕاستەوخۆ بە واتساپ لە بازاڕی بەناوبارا.`;

  const photoUrl = listingPhotoUrl(listing.image_path);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      locale: "ckb_IQ",
      siteName: "BenawBara — بەناوبارا",
      images: photoUrl ? [{ url: photoUrl, width: 1200, height: 900, alt: listing.title }] : [],
    },
    twitter: {
      card: photoUrl ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      images: photoUrl ? [photoUrl] : [],
    },
  };
}

const CAT_COLORS: Record<string, string> = {
  electronics: "#DCEEEC",
  furniture: "#F3E6D8",
  vehicles: "#E4E9F2",
  realestate: "#EAE3F0",
  fashion: "#FBE3E0",
  jobs: "#E6F0DC",
  other: "#EFE7D4",
};

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch listing and join with profile to get seller name & phone
  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      profiles (
        name,
        phone
      )
    `)
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const isOwner = user && user.id === listing.seller_id;
  const sellerName = listing.profiles?.name || t.seller;
  const sellerPhone = listing.profiles?.phone || "";

  // Format WhatsApp link
  const waNumber = sellerPhone.replace(/[^\d]/g, "");
  const waMsg = encodeURIComponent(t.whatsappMessage(listing.title));
  const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;

  // Time formatting helper
  const createdDate = new Date(listing.created_at);
  const timeString = createdDate.toLocaleDateString("ckb-IQ", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-stone hover:text-ink text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            ← {t.backToMarket}
          </Link>
          <ShareButton
            title={listing.title}
            price={`${Number(listing.price).toLocaleString("en-US")} ${t.currency}`}
          />
        </div>

        {/* Listing Card */}
        <div className="bg-card rounded-2xl border border-sand-2 overflow-hidden shadow-sm">
          {/* Visual Header — photo if present, else category-colored emoji.
              A fixed 4:3 media-frame gives every listing a consistent hero. */}
          <div
            className="media-frame aspect-[4/3] flex items-center justify-center text-7xl"
            style={{ backgroundColor: CAT_COLORS[listing.category] || "#EFE7D4" }}
          >
            {listing.sold && (
              <span className="absolute top-4 start-4 z-10 bg-clay text-white text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">
                {t.sold}
              </span>
            )}
            {listingPhotoUrl(listing.image_path) ? (
              <Image
                src={listingPhotoUrl(listing.image_path)!}
                alt={listing.title}
                fill
                sizes="(min-width: 512px) 512px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              listing.emoji
            )}
          </div>

          {/* Details Body */}
          <div className="p-4 sm:p-6 break-words overflow-hidden">
            <span className="ticket text-base mb-4 max-w-full truncate">
              {Number(listing.price).toLocaleString("en-US")} {t.currency}
            </span>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-ink mt-2 break-words">
              {listing.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone mt-3 mb-6 pb-6 border-b border-sand-2">
              <span>📍 {listing.location}</span>
              <span>•</span>
              <span>🏷️ {CATEGORY_LABELS[listing.category] || listing.category}</span>
              <span>•</span>
              <span>🕒 {timeString}</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.05em] text-stone mb-2">
                {t.description}
              </h2>
              <p className="text-ink/80 text-[15px] font-sans leading-relaxed whitespace-pre-line break-words">
                {listing.description || t.noDescription}
              </p>
            </div>

            {/* Seller profile card */}
            <div className="bg-sand/30 rounded-xl border border-sand-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-ink truncate">{sellerName}</h3>
                  <p className="text-xs text-stone truncate">📍 {listing.location}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                {waNumber && !listing.sold && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25A85A] hover:bg-[#1E8E4A] text-white px-4 py-2.5 rounded-lg
                               text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto shrink-0"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.07-1.32A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.18-1.76 1.24-.45.06-.98.09-3.02-.65-2.55-.94-4.2-3.53-4.33-3.7-.13-.17-1.03-1.37-1.03-2.6s.65-1.85.88-2.1c.22-.25.5-.31.66-.31h.48c.15 0 .35-.02.55.42.22.5.73 1.73.8 1.86.06.13.1.28.02.45-.08.17-.13.28-.25.43-.13.15-.27.34-.38.46-.13.13-.26.27-.11.53.15.26.66 1.09 1.42 1.76 1 .87 1.83 1.15 2.1 1.28.27.13.42.11.58-.07.15-.18.66-.77.83-1.03.17-.27.35-.22.58-.13.24.09 1.5.71 1.75.84.26.13.42.19.48.3.07.11.07.61-.15 1.22z" />
                    </svg>
                    {t.chatWhatsapp}
                  </a>
                )}
                <ShareButton
                  title={listing.title}
                  price={`${Number(listing.price).toLocaleString("en-US")} ${t.currency}`}
                />
              </div>
            </div>

            {/* Non-owner report button */}
            {!isOwner && user && (
              <div className="flex justify-end mb-6">
                <ReportModal listingId={listing.id} />
              </div>
            )}

            {/* Owner settings panel */}
            {isOwner && (
              <div className="border-t border-sand-2 pt-6 space-y-3">
                <Link
                  href={`/listings/${listing.id}/edit`}
                  className="block w-full py-3 rounded-lg bg-teal text-white text-center font-bold text-sm
                             hover:bg-teal-deep transition-colors cursor-pointer"
                >
                  {t.editListing}
                </Link>
                <div className="flex gap-3">
                <form action={toggleSold.bind(null, listing.id, listing.sold)} className="flex-1">
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-colors cursor-pointer text-white
                               ${listing.sold ? "bg-stone hover:bg-stone/85" : "bg-clay hover:bg-clay/85"}`}
                  >
                    {listing.sold ? t.markAvailable : t.markSold}
                  </button>
                </form>

                <form action={deleteListing.bind(null, listing.id)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg border-[1.5px] border-sand-2 font-bold text-sm
                               text-stone hover:text-clay hover:border-clay/35 transition-colors cursor-pointer"
                  >
                    {t.deleteListing}
                  </button>
                </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
