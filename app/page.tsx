import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  MessageCircle,
  PenLine,
  Sparkles,
  Target,
  FolderKanban,
  Zap,
} from "lucide-react";

const pillars = [
  {
    icon: MessageCircle,
    title: "Habla con APEX",
    desc: "Como un asesor de confianza. Pregunta en español y recibe pasos claros.",
  },
  {
    icon: Target,
    title: "Plan de negocio",
    desc: "Define a quién le vendes, qué ofreces y cómo empezar.",
  },
  {
    icon: PenLine,
    title: "Textos listos",
    desc: "Páginas de venta, posts y mensajes que puedes copiar y usar.",
  },
  {
    icon: Lightbulb,
    title: "Anuncios",
    desc: "Ideas y estructura para Facebook sin enredarte con tecnicismos.",
  },
  {
    icon: FolderKanban,
    title: "Tus negocios",
    desc: "Guarda la info de tu marca. APEX la recuerda en la siguiente charla.",
  },
  {
    icon: Sparkles,
    title: "Memoria",
    desc: "No empieces de cero cada vez. APEX guarda lo importante.",
  },
];

const steps = [
  { n: "1", t: "Crea tu cuenta", d: "En un minuto, con email o Google." },
  { n: "2", t: "Cuéntanos tu negocio", d: "Nombre, a qué te dedicas y qué vendes." },
  { n: "3", t: "Pregunta lo que necesites", d: "Plan, textos, anuncios o ideas." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 apex-glow" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-amber-500/25">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div>
            <div className="text-sm font-bold tracking-tight">APEX</div>
            <div className="text-[11px] text-zinc-500">Tu equipo digital</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-full bg-amber-400 px-3.5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 sm:px-4"
          >
            Empezar
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Simple. Claro. Para cualquier negocio.
          </div>
          <h1 className="max-w-3xl text-[1.9rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
            Todo lo que necesitas para{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              vender y crecer
            </span>
            , en un solo lugar.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
            APEX te ayuda a pensar tu negocio, escribir textos, armar anuncios y
            ordenar ideas — como un equipo de marketing y tecnología a tu lado.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition active:scale-[0.98] hover:bg-amber-300"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98] hover:bg-white/10"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/15 text-sm font-bold text-amber-300">
                  {s.n}
                </div>
                <p className="mt-3 font-medium text-white">{s.t}</p>
                <p className="mt-1 text-sm text-zinc-500">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02] py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
              ¿Qué puedes hacer aquí?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
              Sin jerga rara. Solo herramientas útiles para personas y negocios
              reales.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-[#0c0c10] p-5"
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

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/15 via-transparent to-orange-500/10 p-6 sm:p-10">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Empieza en menos de 2 minutos
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400 sm:text-base">
              Crea tu cuenta, cuenta un poco de tu negocio y haz tu primera
              pregunta. Así de simple.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:w-auto"
            >
              Quiero empezar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 text-center text-xs text-zinc-600">
        APEX · Hecho para personas y negocios reales
      </footer>
    </div>
  );
}
