"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Zap } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${origin}/auth/callback?next=/app`,
        },
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // If email confirmation is disabled, session exists
      if (data.session) {
        router.push("/app");
        router.refresh();
        return;
      }

      setInfo(
        "Cuenta creada. Revisa tu email para confirmar (si está activado en Supabase) o inicia sesión.",
      );
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 apex-glow" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c10]/90 p-8 shadow-2xl backdrop-blur">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-black">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div>
            <div className="text-sm font-bold text-white">APEX</div>
            <div className="text-[11px] text-zinc-500">Agency OS</div>
          </div>
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Workspace personal con memoria de proyectos, historial y deliverables
          privados.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm text-zinc-400">
            Nombre
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
              placeholder="Tu nombre"
            />
          </label>
          <label className="block text-sm text-zinc-400">
            Email de trabajo
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
              placeholder="Mínimo 8 caracteres"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
