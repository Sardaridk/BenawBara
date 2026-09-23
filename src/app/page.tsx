import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listingPhotoUrl } from "@/lib/supabase/storage";
import { signOut } from "@/app/actions/auth";
import { t, CATEGORY_LABELS } from "@/lib/strings";

type SearchParams = Promise<{
  search?: string;
  category?: string;
  sort?: string;
}>;

type HomeProps = {
  searchParams: SearchParams;
};

const CATEGORY_IDS = [
  "electronics",
  "furniture",
  "vehicles",
  "realestate",
  "fashion",
  "jobs",
  "other",
];

const CAT_COLORS: Record<string, string> = {
  electronics: "#DCEEEC",
  furniture: "#F3E6D8",
  vehicles: "#E4E9F2",
  realestate: "#EAE3F0",
  fashion: "#FBE3E0",
  jobs: "#E6F0DC",
  other: "#EFE7D4",
};

export default async function Home({ searchParams }: HomeProps) {
  const { search = "", category = "", sort = "newest" } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch listings from database
  let query = supabase.from("listings").select("*");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  // Apply sorting
  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: listings } = await query;

  // This is an async Server Component — it renders once per request on the
  // server, so reading the wall clock here is deterministic for that render.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  // Timeago helper
  function timeAgo(dateStr: string): string {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t.justNow;
    if (mins < 60) return t.minutesAgo(mins);
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t.hoursAgo(hrs);
    return t.daysAgo(Math.floor(hrs / 24));
  }

  // Helper to build URL preserving filters
  function buildUrl(newParams: { category?: string; sort?: string; search?: string }) {
    const params = new URLSearchParams();
    const c = newParams.category !== undefined ? newParams.category : category;
    const s = newParams.sort !== undefined ? newParams.sort : sort;
    const q = newParams.search !== undefined ? newParams.search : search;

    if (c && c !== "all") params.set("category", c);
    if (s && s !== "newest") params.set("sort", s);
    if (q) params.set("search", q);

    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="flex flex-col min-h-screen bg-sand text-ink">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="glass sticky top-0 z-20 text-sand border-b-[3px] border-saffron px-4 py-4.5">
        <div className="max-w-2xl mx-auto">
          {/* Logo & Navigation */}
          <div className="flex justify-between items-center flex-wrap gap-2.5 mb-4">
            <div>
              <Link href="/" className="text-3xl font-semibold tracking-tight font-display text-sand hover:opacity-95 transition-opacity">
                Benaw<span className="text-saffron">Bara</span>
              </Link>
              <p className="text-[10px] text-[#B9C4C2] tracking-[0.06em]">
                {t.tagline}
              </p>
            </div>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/my-listings"
                  className="text-xs font-semibold text-sand hover:text-saffron transition-colors flex items-center gap-1.5 cursor-pointer bg-white/10 px-2.5 py-1 rounded-lg"
                >
                  <span>📦</span>
                  <span>{t.myListings}</span>
                </Link>

                <form action={signOut} className="flex items-center">
                  <button
                    type="submit"
                    className="text-xs font-semibold text-stone/70 hover:text-saffron transition-colors cursor-pointer"
                  >
                    {t.signOut}
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-saffron hover:underline transition-colors"
              >
                {t.signIn}
              </Link>
            )}
          </div>

          {/* Search Form */}
          <form method="GET" action="/" className="relative">
            {category && <input type="hidden" name="category" value={category} />}
            {sort && sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            <span className="absolute start-3.5 top-1/2 -translate-y-1/2 opacity-70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FA6A3" strokeWidth="2.2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder={t.searchPlaceholder}
              className="w-full ps-10 pe-4 py-3 rounded-xl border border-white/5 bg-[#213A3E]/80 text-sand text-[15px]
                         font-sans placeholder:text-[#8FA6A3] focus:outline-none focus:border-saffron/50
                         focus:ring-2 focus:ring-saffron/20 transition-all"
            />
          </form>
        </div>
      </header>

      {/* ── Category Chips ─────────────────────────────────────────── */}
      <div className="bg-sand py-4 px-4 overflow-x-auto scrollbar-none border-b border-sand-2 max-w-full">
        <div className="max-w-2xl mx-auto flex gap-2">
          {/* All chip */}
          <Link
            href={buildUrl({ category: "all" })}
            className={`chip flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border-[1.5px] transition-all
                       ${
                         !category || category === "all"
                           ? "bg-teal border-teal-deep text-white shadow-xs"
                           : "bg-card border-sand-2 text-ink hover:border-stone"
                       }`}
          >
            {t.categoryAll}
          </Link>

          {/* Map categories */}
          {CATEGORY_IDS.map((id) => (
            <Link
              key={id}
              href={buildUrl({ category: id })}
              className={`chip flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border-[1.5px] whitespace-nowrap transition-all
                         ${
                           category === id
                             ? "bg-teal border-teal-deep text-white shadow-xs"
                             : "bg-card border-sand-2 text-ink hover:border-stone"
                         }`}
            >
              {CATEGORY_LABELS[id]}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Feed ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 overflow-x-hidden">
        {/* Controls Bar: Count + Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2">
          <p className="text-[11px] font-bold tracking-[0.03em] uppercase text-stone">
            {t.listingsNearby(listings?.length || 0)}
          </p>

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none max-w-full pb-1">
            <span className="text-stone text-[11px] ms-1 shrink-0">🏷️</span>
            <Link
              href={buildUrl({ sort: "newest" })}
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sort === "newest"
                  ? "bg-stone/20 text-ink font-bold"
                  : "text-stone hover:text-ink"
              }`}
            >
              {t.sortNewest}
            </Link>
            <Link
              href={buildUrl({ sort: "price_asc" })}
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sort === "price_asc"
                  ? "bg-stone/20 text-ink font-bold"
                  : "text-stone hover:text-ink"
              }`}
            >
              {t.sortPriceAsc}
            </Link>
            <Link
              href={buildUrl({ sort: "price_desc" })}
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sort === "price_desc"
                  ? "bg-stone/20 text-ink font-bold"
                  : "text-stone hover:text-ink"
              }`}
            >
              {t.sortPriceDesc}
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {listings?.length === 0 ? (
          <div className="text-center py-20 text-stone">
            <h3 className="text-xl font-semibold font-display text-ink mb-1">
              {t.emptyTitle}
            </h3>
            <p className="text-sm">{t.emptyBody}</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            {listings?.map((l, i) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                className="card animate-rise group flex flex-col bg-card rounded-2xl overflow-hidden
                           border border-sand-2 cursor-pointer hover:shadow-md transition-all min-w-0"
              >
                {/* Visual Header — photo if present, else category-colored emoji */}
                <div
                  className="media-frame aspect-square flex items-center justify-center text-4xl relative"
                  style={{ backgroundColor: CAT_COLORS[l.category] || "#EFE7D4" }}
                >
                  {l.sold && (
                    <span className="absolute top-2 start-2 z-10 bg-clay text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                      {t.sold}
                    </span>
                  )}
                  {listingPhotoUrl(l.image_path) ? (
                    <Image
                      src={listingPhotoUrl(l.image_path)!}
                      alt={l.title}
                      fill
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {l.emoji}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3 flex flex-col flex-1 gap-2 min-w-0">
                  <h3 className="text-xs font-semibold text-ink line-clamp-2 leading-tight break-words">
                    {l.title}
                  </h3>
                  <div className="text-[10px] text-stone flex items-center gap-1 mt-auto truncate">
                    📍 {l.location} · {timeAgo(l.created_at)}
                  </div>
                  <div className="ticket text-xs font-mono select-none self-start max-w-full truncate">
                    {Number(l.price).toLocaleString("en-US")} {t.currency}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ── Post Floating Action Button (FAB) ──────────────────────── */}
      <Link
        href="/listings/new"
        aria-label={t.postListingTitle}
        className="fixed bottom-6 end-6 z-30 w-14 h-14 rounded-2xl bg-saffron flex items-center justify-center
                   shadow-[0_10px_24px_rgba(232,162,61,0.45)] hover:scale-110 hover:rotate-90
                   active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16262B" strokeWidth="2.6" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </div>
  );
}
