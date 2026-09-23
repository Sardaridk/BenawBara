"use client";

import { useState } from "react";
import { t } from "@/lib/strings";

type ShareButtonProps = {
  title: string;
  price: string;
};

export default function ShareButton({ title, price }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = t.shareMessage(title, price);

    // 1. Try native Web Share API on mobile
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Ignore user cancellation (AbortError)
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // 2. Fallback: Copy link to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // Fallback to WhatsApp direct URL if clipboard failed
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText}\n${shareUrl}`
        )}`;
        window.open(waUrl, "_blank");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
        copied
          ? "bg-teal/15 border-teal text-teal font-bold"
          : "border-sand-2 text-stone hover:text-ink hover:border-stone/60 bg-card hover:bg-sand-2/40"
      }`}
      aria-label={copied ? t.linkCopied : t.share}
      title={t.share}
    >
      {copied ? (
        <>
          <span className="text-teal font-bold">✓</span>
          <span>{t.linkCopied}</span>
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>{t.share}</span>
        </>
      )}
    </button>
  );
}
