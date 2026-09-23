import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // revalidate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://benawbara.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: listings } = await supabase
      .from("listings")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    const listingRoutes: MetadataRoute.Sitemap = (listings || []).map((l) => ({
      url: `${baseUrl}/listings/${l.id}`,
      lastModified: new Date(l.created_at),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch (err) {
    console.error("[sitemap] Failed to fetch listings:", err);
    return staticRoutes;
  }
}
