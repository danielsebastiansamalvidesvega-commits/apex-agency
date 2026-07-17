"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Loader2, Mail, Zap } from "lucide-react";

type Phase = "form" | "check-email";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [registeredEmail, setRegisteredEmail] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const name = fullName.trim();

    try {
      const supabase = createClient();
      // En producción esto es https://apex-agency-nine.vercel.app (no localhost)
      const origin = window.location.origin;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${origin}/auth/callback?next=/app`,
        },
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered")) {
          setError("Este email ya tiene una cuenta. Inicia sesión.");
        } else if (msg.includes("password")) {
          setError(
            "La contraseña no cumple los requisitos (mínimo 8 caracteres).",
          );
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Confirm email OFF en Supabase → sesión inmediata
      if (data.session) {
        if (name) {
          await supabase.from("profiles").upsert(
            {
              id: data.session.user.id,
              email: cleanEmail,
              full_name: name,
            },
            { onConflict: "id" },
          );
        }
        router.replace("/app");
        router.refresh();
        return;
      }

      // Confirm email ON → flujo profesional: verifica correo
      // (no intentar login: fallará hasta confirmar)
      setRegisteredEmail(cleanEmail);
      setPhase("check-email");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
      setLoading(false);
    }
  }

  if (phase === "check-email") {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0 apex-glow" />
        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c10]/90 p-8 shadow-2xl backdrop-blur">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
            Revisa tu correo
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Enviamos un enlace de verificación a{" "}
            <span className="font-medium text-zinc-200">{registeredEmail}</span>.
            Ábrelo para activar tu cuenta y entrar a APEX.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-zinc-500">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
              Revisa también spam o promociones.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
              El enlace te llevará de vuelta a APEX (no a localhost).
            </li>
          </ul>
          <Link
            href="/login"
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-amber-400 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Ir a iniciar sesión
          </Link>
          <button
            type="button"
            onClick={() => {
              setPhase("form");
              setError(null);
            }}
            className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-300"
          >
            Usar otro email
          </button>
        </div>
      </div>
    );
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
          Te enviaremos un email para verificar tu identidad y proteger tu
          workspace.
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-amber-400 hover:text-amber-300"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
