"use server";

import { createClient } from "@/lib/supabase/server";
import { errors } from "@/lib/strings";

export type ReportResult = {
  success?: boolean;
  error?: string;
};

export async function submitReport(
  listingId: string,
  _prev: ReportResult | undefined,
  formData: FormData,
): Promise<ReportResult> {
  const reason = (formData.get("reason") as string || "").trim();
  const details = (formData.get("details") as string || "").trim();

  if (!reason) {
    return { error: errors.reportReasonRequired };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: errors.noSession };
  }

  const { error } = await supabase.from("reports").insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason,
    details: details || null,
  });

  if (error) {
    console.error("[reports] Failed to submit report:", error);
    return { error: errors.reportFailed };
  }

  return { success: true };
}
