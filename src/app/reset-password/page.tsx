import { t } from "@/lib/strings";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight font-display text-ink">
            Benaw<span className="text-saffron">Bara</span>
          </h1>
        </div>
        <div className="bg-card rounded-2xl border border-sand-2 p-6 shadow-sm">
          <h2 className="text-lg font-semibold font-display text-ink mb-1">
            {t.resetPasswordTitle}
          </h2>
          <p className="text-sm text-stone mb-5">{t.resetPasswordSubtitle}</p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
