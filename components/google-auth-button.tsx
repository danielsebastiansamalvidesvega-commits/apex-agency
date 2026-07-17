"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type Props = {
  next?: string;
  label?: string;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  next = "/app",
  label = "Continuar con Google",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const safeNext = next.startsWith("/") ? next : "/app";

      // Cookie so callback can redirect without putting ?next= in allow-list
      document.cookie = `apex_auth_next=${encodeURIComponent(safeNext)}; Path=/; Max-Age=600; SameSite=Lax`;

      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Must match exactly a Redirect URL in Supabase Auth settings
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (err) {
        const msg = err.message.toLowerCase();
        if (msg.includes("provider is not enabled") || msg.includes("validation")) {
          setError(
            "Google no está activado aún. En Supabase: Authentication → Providers → Google (Client ID + Secret).",
          );
        } else {
          setError(err.message);
        }
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setError("No se pudo iniciar el flujo de Google.");
      setLoading(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo conectar con Google",
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        {loading ? "Conectando con Google…" : label}
      </button>
      {error && <p className="text-center text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function AuthDivider({
  text = "o con tu email",
}: {
  text?: string;
}) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-[#0c0c10] px-3 text-zinc-500">{text}</span>
      </div>
    </div>
  );
}
