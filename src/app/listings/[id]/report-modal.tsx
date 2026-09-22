"use client";

import { useActionState, useState } from "react";
import { submitReport, type ReportResult } from "@/app/actions/reports";
import { t } from "@/lib/strings";

const REASONS = [
  { id: "scam", label: t.reasonScam },
  { id: "sold", label: t.reasonSold },
  { id: "inappropriate", label: t.reasonInappropriate },
  { id: "wrong_info", label: t.reasonWrongInfo },
  { id: "other", label: t.reasonOther },
];

export default function ReportModal({ listingId }: { listingId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const boundAction = submitReport.bind(null, listingId);
  const [state, formAction, pending] = useActionState<ReportResult | undefined, FormData>(
    boundAction,
    undefined,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-stone hover:text-clay text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer py-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        {t.reportListing}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-card w-full max-w-md rounded-2xl border border-sand-2 p-6 shadow-xl relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold font-display text-ink">
                  {t.reportTitle}
                </h3>
                <p className="text-xs text-stone mt-1">{t.reportSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-ink text-sm p-1 cursor-pointer transition-colors"
                aria-label={t.close}
              >
                ✕
              </button>
            </div>

            {state?.success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3 text-xl">
                  ✓
                </div>
                <p className="text-sm font-semibold text-ink mb-4">{t.reportSuccess}</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal-deep transition-colors cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <div>
                  <label htmlFor="report-reason" className="block text-xs font-bold text-stone uppercase tracking-wider mb-2">
                    {t.reportReasonLabel}
                  </label>
                  <select
                    id="report-reason"
                    name="reason"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-sand-2 bg-sand text-ink text-sm font-sans focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal cursor-pointer"
                  >
                    <option value="">{t.reportReasonPlaceholder}</option>
                    {REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="report-details" className="block text-xs font-bold text-stone uppercase tracking-wider mb-2">
                    {t.reportDetailsLabel}
                  </label>
                  <textarea
                    id="report-details"
                    name="details"
                    rows={3}
                    placeholder={t.reportDetailsPlaceholder}
                    className="w-full px-3 py-2 rounded-lg border border-sand-2 bg-sand text-ink text-sm font-sans focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                  />
                </div>

                {state?.error && (
                  <p className="text-xs text-clay font-medium">{state.error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 py-2.5 rounded-lg bg-clay text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {pending ? t.submittingReport : t.submitReport}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-sand-2 text-stone hover:text-ink text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
