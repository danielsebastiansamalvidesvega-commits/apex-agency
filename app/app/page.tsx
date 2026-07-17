import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { ModuleIcon } from "@/components/icons";
import { ArrowRight, Rocket, Shield, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const modules = MODULES.filter((m) => m.id !== "dashboard");

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
          Tu workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Bienvenido a APEX
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Marketing, tecnología y código en un solo lugar. Elige un módulo o
          abre el Consejo para empezar.
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:gap-4 sm:p-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/15 to-transparent p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-amber-300">
            <Rocket className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Recomendado
            </span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Habla con el Consejo
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Ideas de negocio, ventas, web o producto. Una conversación, un plan
            claro para avanzar.
          </p>
          <Link
            href="/app/consejo"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Abrir Consejo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="mt-2 text-sm font-medium text-white">Crecimiento</p>
            <p className="mt-1 text-xs text-zinc-500">
              Recomendaciones orientadas a vender más y mejor.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Shield className="h-4 w-4 text-sky-400" />
            <p className="mt-2 text-sm font-medium text-white">Tecnología</p>
            <p className="mt-1 text-xs text-zinc-500">
              Decisiones técnicas claras, sin complicaciones innecesarias.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 sm:px-6 sm:pb-8">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Módulos</h3>
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition active:scale-[0.99] hover:border-amber-400/35 hover:bg-amber-400/5"
            >
              <ModuleIcon
                name={m.icon}
                className="h-5 w-5 text-amber-400/90"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-white">{m.label}</h4>
                <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-amber-400" />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                {m.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
