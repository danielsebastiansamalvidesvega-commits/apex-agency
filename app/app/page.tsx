import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { ModuleIcon } from "@/components/icons";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";

const PRIMARY = ["consejo", "estrategia", "copy", "ads", "proyectos"] as const;
const MORE = ["tech", "code", "memoria"] as const;

export default function DashboardPage() {
  const primary = MODULES.filter((m) =>
    (PRIMARY as readonly string[]).includes(m.id),
  );
  const more = MODULES.filter((m) => (MORE as readonly string[]).includes(m.id));

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-xs font-medium text-amber-400/90">Hola 👋</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          ¿En qué te ayudo hoy?
        </h1>
        <p className="mt-2 max-w-lg text-sm text-zinc-400">
          Elige una opción. No necesitas saber de marketing ni de programación.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <Link
          href="/app/consejo"
          className="flex flex-col gap-3 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/20 to-orange-500/5 p-5 transition active:scale-[0.99] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-black">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-amber-300">
                Lo más fácil
              </p>
              <h2 className="mt-0.5 text-lg font-semibold text-white">
                Hablar con APEX
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Cuéntame tu idea o problema y te guío paso a paso.
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black sm:shrink-0">
            Empezar chat
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <div className="px-4 pb-4 sm:px-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Qué quieres hacer
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {primary.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition active:scale-[0.99] hover:border-amber-400/30 hover:bg-amber-400/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                <ModuleIcon name={m.icon} className="h-5 w-5 text-amber-400" />
              </span>
              <div className="min-w-0">
                <h4 className="font-semibold text-white">{m.label}</h4>
                <p className="mt-0.5 text-sm leading-snug text-zinc-500">
                  {m.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6">
        <h3 className="mb-3 text-sm font-medium text-zinc-500">
          Más opciones
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {more.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5 transition hover:border-white/20"
            >
              <div className="flex items-center gap-2">
                <ModuleIcon name={m.icon} className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">
                  {m.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">{m.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
