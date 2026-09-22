import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the phone (over LAN) to reach Next.js dev resources like HMR and the
  // Server Action runtime. Without this, Next blocks cross-origin dev requests
  // from the phone's URL and sign-up fails. Dev-only.
  allowedDevOrigins: ["192.168.0.104"],
  // Allow Server Actions (sign-up/sign-in POSTs) when the app is reached over
  // the LAN from a phone. Without this, Next's CSRF check rejects any POST
  // whose Origin isn't localhost. Dev-only convenience; harmless in prod.
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.0.104:3000"],
    },
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "znxtxwnvhrsjxqwiyvat.supabase.co",
        pathname: "/storage/v1/object/public/listing-photos/**",
      },
    ],
  },
};

export default nextConfig;
