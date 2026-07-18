"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthDivider, GoogleAuthButton } from "@/components/google-auth-button";
import { Loader2 } from "lucide-react";
import { Brand } from "@/components/brand";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/app";
  const urlError = search.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? decodeURIComponent(urlError) : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        const msg = err.message.toLowerCase();
        if (err.message === "Invalid login credentials") {
          setError("Email o contraseña incorrectos.");
        } else if (msg.includes("confirm") || msg.includes("email not confirmed")) {
          setError(
            "Email no confirmado. Revisa tu correo o usa Continuar con Google.",
          );
        } else {
          setError(err.message);
        }
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <GoogleAuthButton next={next} label="Continuar con Google" />
      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm text-zinc-400">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
            placeholder="tu@empresa.com"
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Contraseña
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-none absolute inset-0 apex-glow" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c10]/95 p-5 shadow-2xl backdrop-blur sm:p-8">
        <Brand href="/" />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          Bienvenido de nuevo
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Entra a tu espacio: proyectos, memoria y chats privados.
        </p>

        <Suspense
          fallback={
            <div className="mt-8 h-40 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{" "}
          <Link
            href="/signup"
            className="font-medium text-amber-400 hover:text-amber-300"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
