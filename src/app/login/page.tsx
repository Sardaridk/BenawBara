import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { t } from "@/lib/strings";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-sand min-h-screen px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight font-display text-ink">
            Benaw<span className="text-saffron">Bara</span>
          </h1>
          <p className="text-stone text-xs tracking-[0.06em] mt-1">
            {t.tagline}
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-card rounded-2xl border border-sand-2 p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-stone mt-6">
          {t.loginHelp}
          <br />
          <span className="text-stone/60">{t.loginHelpSub}</span>
        </p>
      </div>
    </div>
  );
}
