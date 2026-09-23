import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://benawbara.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/profile-setup",
          "/reset-password",
          "/auth/callback",
          "/my-listings",
          "/listings/new",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
