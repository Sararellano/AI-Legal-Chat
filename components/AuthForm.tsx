"use client";

import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UI_COPY } from "@/lib/constants/ui-copy";

type AuthMode = "signin" | "signup" | "magic";

/**
 * Email/password and magic-link authentication form.
 */
function AuthFormComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return createClient();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    if (!supabase) {
      return;
    }
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "magic") {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (magicError) {
          setError(magicError.message);
        } else {
          setInfo(UI_COPY.authMagicLinkSent);
        }
      } else if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setInfo(UI_COPY.authCheckEmail);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          window.location.href = "/";
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-legal-slate">
          {UI_COPY.authEmail}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-legal-border bg-legal-surface px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      {mode !== "magic" ? (
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-legal-slate">
            {UI_COPY.authPassword}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-legal-border bg-legal-surface px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-emerald-400" role="status">
          {info}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? UI_COPY.sidebarLoading
          : mode === "magic"
            ? UI_COPY.authSendMagicLink
            : mode === "signup"
              ? UI_COPY.authSignUp
              : UI_COPY.authSignIn}
      </Button>

      <div className="flex flex-wrap gap-2 text-xs">
        {mode !== "signin" ? (
          <button
            type="button"
            className="text-legal-slate underline-offset-2 hover:underline"
            onClick={() => setMode("signin")}
          >
            {UI_COPY.authHasAccount}
          </button>
        ) : null}
        {mode !== "signup" ? (
          <button
            type="button"
            className="text-legal-slate underline-offset-2 hover:underline"
            onClick={() => setMode("signup")}
          >
            {UI_COPY.authNoAccount}
          </button>
        ) : null}
        {mode !== "magic" ? (
          <button
            type="button"
            className="text-legal-slate underline-offset-2 hover:underline"
            onClick={() => setMode("magic")}
          >
            {UI_COPY.authMagicLink}
          </button>
        ) : null}
      </div>
    </form>
  );
}

const AuthForm = memo(AuthFormComponent);
AuthForm.displayName = "AuthForm";

export default AuthForm;
