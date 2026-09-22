import type { Metadata } from "next";
import { Fraunces, Noto_Kufi_Arabic, IBM_Plex_Mono } from "next/font/google";
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

/* ── Metadata ──────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
