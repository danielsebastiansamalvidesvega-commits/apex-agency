import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cpu,
  Megaphone,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Consejo Senior",
    desc: "CMO + CTO + Lead Dev en una sola mesa. Decisiones de negocio y producto sin silos.",
  },
  {
    icon: Target,
    title: "Estrategia & GTM",
    desc: "Posicionamiento, ICP, oferta, embudos y planes 30/60/90 con métricas reales.",
  },
  {
    icon: Megaphone,
    title: "Ads & Creativos",
    desc: "Estructuras de campaña, testing, scripts UGC, copy y scaling con unit economics.",
  },
  {
    icon: Cpu,
    title: "Arquitectura CTO",
    desc: "Stack, data model, integraciones, performance y roadmap técnico orientado a growth.",
  },
  {
    icon: Code2,
    title: "Code Lab",
    desc: "Código production-ready, componentes, APIs y specs de implementación shippables.",
  },
  {
    icon: Sparkles,
    title: "Proyectos",
    desc: "Workspaces por marca o cliente con contexto persistente y deliverables guardados.",
  },
];

const vs = [
  { label: "Solo copy / creativos", apex: "Estrategia + media + tech + código" },
  { label: "Chat genérico", apex: "Roles senior con playbooks de 15+ años" },
  { label: "Marketing aislado", apex: "Growth unido a producto y arquitectura" },
  { label: "Sin contexto de negocio", apex: "Proyectos con ICP, oferta y stack" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 apex-glow" />
      <div className="pointer-events-none absolute inset-0 apex-grid opacity-40" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-amber-500/25">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div>
            <div className="text-sm font-bold tracking-tight">APEX</div>
            <div className="text-[11px] text-zinc-500">Agency OS</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-sm text-zinc-400 transition hover:text-white sm:inline"
          >
            Entrar al workspace
          </Link>
          <Link
            href="/app/consejo"
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Abrir Consejo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pt-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Agencia digital + equipo técnico senior en un solo workspace
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
            Tu{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Director de Marketing + CTO + Lead Full-Stack
            </span>{" "}
            en un solo sistema.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            APEX actúa como una agencia senior de 15+ años de experiencia:
            growth, ads, copy, arquitectura y código — con decisiones
            ejecutivas, no respuestas genéricas de chatbot.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app/consejo"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
            >
              Empezar gratis en el Consejo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/proyectos"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Crear un proyecto
            </Link>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              ["CMO", "Growth, media, copy, funnels, unit economics"],
              ["CTO", "Arquitectura, stack, data, seguridad, roadmap"],
              ["Lead Dev", "Código, APIs, UI, ship con calidad"],
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

        <section className="border-y border-white/10 bg-white/[0.02] py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Una agencia completa. No un prompt bonito.
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Módulos operativos para dueños de negocio, freelancers, e-commerce
              y equipos que quieren operar a nivel senior sin contratar 8
              roles.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Una operación integral
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-2 bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <div className="px-5 py-3">Herramientas típicas</div>
              <div className="px-5 py-3 text-amber-400/90">APEX Agency OS</div>
            </div>
            {vs.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-2 border-t border-white/10 text-sm"
              >
                <div className="px-5 py-3.5 text-zinc-500">{row.label}</div>
                <div className="px-5 py-3.5 text-zinc-200">{row.apex}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/15 via-transparent to-orange-500/10 p-8 sm:p-12">
            <h2 className="max-w-xl text-2xl font-semibold text-white sm:text-3xl">
              Lista para operar como agencia senior hoy.
            </h2>
            <p className="mt-3 max-w-xl text-zinc-400">
              Configura tu API key de xAI, crea un proyecto y abre el Consejo.
              En minutos tienes estrategia, media plan y specs técnicas
              alineadas.
            </p>
            <Link
              href="/app"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Entrar al Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-zinc-600">
        APEX Agency OS · Powered by SpaceXAI / xAI (Grok) · CMO + CTO + Lead
        Full-Stack
      </footer>
    </div>
  );
}
