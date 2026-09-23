import type { Metadata, Viewport } from "next";
import { Fraunces, Noto_Kufi_Arabic, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { t } from "@/lib/strings";
import "./globals.css";

/* ── Fonts ─────────────────────────────────────────────────────── */

// Fraunces stays as the display face for the Latin "BenawBara" wordmark.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // Fraunces is a variable font with optical size axis
  axes: ["opsz"],
});

// Noto Kufi Arabic renders Sorani (Arabic-script Kurdish) cleanly; it's the
// primary UI sans face now that the app is Kurdish.
const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-inter",
  subsets: ["arabic"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
});

/* ── Viewport & Metadata ────────────────────────────────────────── */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16262B",
};

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BenawBara",
  },
};

/* ── Root Layout ───────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ckb"
      dir="rtl"
      className={`${fraunces.variable} ${notoKufiArabic.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden max-w-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

