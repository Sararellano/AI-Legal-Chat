import AuthForm from "@/components/AuthForm";
import { UI_COPY } from "@/lib/constants/ui-copy";

/** Auth requires runtime env; avoid static prerender without Supabase keys. */
export const dynamic = "force-dynamic";

/**
 * Login page — email/password or magic link via Supabase Auth.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-legal-navy px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-legal-border bg-legal-navy-light p-6 sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold text-slate-100">
            {UI_COPY.loginTitle}
          </h1>
          <p className="text-sm text-legal-slate">{UI_COPY.loginSubtitle}</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
