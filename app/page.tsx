import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cpu,
  Megaphone,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";

const pillars = [
  {
    icon: Users,
    title: "Consejo",
    desc: "Marketing, tecnología y producto en una sola conversación. Decisiones claras.",
  },
  {
    icon: Target,
    title: "Estrategia",
    desc: "Cliente ideal, oferta, embudos y plan de crecimiento con métricas útiles.",
  },
  {
    icon: Megaphone,
    title: "Anuncios & creativos",
    desc: "Campañas, testing, scripts y copy listos para Meta y redes.",
  },
  {
    icon: Cpu,
    title: "Tecnología",
    desc: "Stack, arquitectura e integraciones orientados a resultados de negocio.",
  },
  {
    icon: Code2,
    title: "Código",
    desc: "Componentes, APIs y código listo para implementar en tu producto.",
  },
  {
    icon: Sparkles,
    title: "Proyectos + Memoria",
    desc: "Tu contexto privado: historial, proyectos y lo que tomatito recuerda de ti.",
  },
];

const vs = [
  { label: "Solo textos sueltos", apex: "Estrategia + anuncios + tech + código" },
  { label: "Chat genérico sin cuenta", apex: "Tu espacio privado con historial" },
  { label: "Empiezas de cero cada vez", apex: "Proyectos y memoria entre sesiones" },
  { label: "Marketing o tech por separado", apex: "Todo alineado al crecimiento" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 apex-glow" />
      <div className="pointer-events-none absolute inset-0 apex-grid opacity-40" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-5">
        <Brand href="/" tagline="Tu agencia digital" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 sm:gap-2 sm:px-4"
          >
            Crear cuenta
            <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-16">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium leading-snug text-amber-200 sm:mb-6 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">
              Marketing + tecnología + código · en un solo workspace
            </span>
          </div>
          <h1 className="max-w-4xl text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
            Tu{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              equipo de marketing y tech
            </span>{" "}
            en un solo sistema.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
            tomatito te ayuda a vender mejor, escribir textos, armar anuncios y
            tomar decisiones técnicas — con el rigor de una agencia senior, sin
            enredarte.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition active:scale-[0.98] hover:bg-amber-300"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition active:scale-[0.98] hover:bg-white/10"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              ["Marketing", "Crecimiento, anuncios, copy y embudos"],
              ["Tecnología", "Arquitectura, stack y decisiones de producto"],
              ["Código", "APIs, interfaces e implementación lista"],
            ].map(([role, desc]) => (
              <div
                key={role}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {role}
                </div>
                <p className="mt-1 text-sm text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
              Todo lo que necesitas, sin fricción.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Para dueños de negocio, freelancers y equipos que quieren
              resultados de agencia sin montar un equipo completo.
            </p>
            <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-[#0c0c10] p-5 transition hover:border-amber-400/30"
                >
                  <p.icon className="h-5 w-5 text-amber-400" />
                  <h3 className="mt-3 font-semibold text-white">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
            Una operación integral
          </h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 sm:mt-8">
            <div className="grid grid-cols-2 bg-white/5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
              <div className="px-3 py-2.5 sm:px-5 sm:py-3">Típico</div>
              <div className="px-3 py-2.5 text-amber-400/90 sm:px-5 sm:py-3">
                tomatito
              </div>
            </div>
            {vs.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-2 border-t border-white/10 text-xs sm:text-sm"
              >
                <div className="px-3 py-3 text-zinc-500 sm:px-5 sm:py-3.5">
                  {row.label}
                </div>
                <div className="px-3 py-3 text-zinc-200 sm:px-5 sm:py-3.5">
                  {row.apex}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-[max(5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-24">
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/15 via-transparent to-orange-500/10 p-6 sm:p-12">
            <h2 className="max-w-xl text-xl font-semibold text-white sm:text-3xl">
              Empieza hoy. Es simple.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
              Crea tu cuenta, agrega tu proyecto y abre el Consejo. APEX
              recuerda tu contexto y guarda tu historial de forma privada.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:w-auto"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 text-center text-xs text-zinc-600">
        tomatito 🍅 · Tu agencia digital
      </footer>
    </div>
  );
}
