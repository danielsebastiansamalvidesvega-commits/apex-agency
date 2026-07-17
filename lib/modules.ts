export type ModuleId =
  | "dashboard"
  | "consejo"
  | "estrategia"
  | "copy"
  | "ads"
  | "tech"
  | "code"
  | "proyectos"
  | "memoria";

export type RoleMode = "agencia" | "cmo" | "cto" | "lead";

export interface ModuleDef {
  id: ModuleId;
  href: string;
  label: string;
  short: string;
  description: string;
  role: RoleMode;
  icon:
    | "layout"
    | "users"
    | "target"
    | "pen"
    | "megaphone"
    | "cpu"
    | "code"
    | "folder"
    | "brain";
  starters: string[];
}

export const MODULES: ModuleDef[] = [
  {
    id: "dashboard",
    href: "/app",
    label: "Command Center",
    short: "HQ",
    description: "Visión ejecutiva del negocio, prioridades y próximos movimientos.",
    role: "agencia",
    icon: "layout",
    starters: [],
  },
  {
    id: "consejo",
    href: "/app/consejo",
    label: "Consejo Senior",
    short: "Consejo",
    description:
      "Mesa ejecutiva: CMO + CTO + Lead Full-Stack en un solo hilo de decisiones.",
    role: "agencia",
    icon: "users",
    starters: [
      "Audita mi negocio y dime las 5 palancas de crecimiento más fuertes este trimestre.",
      "Quiero lanzar un SaaS B2B en LATAM: plan de go-to-market + stack técnico + MVP en 30 días.",
      "Mi ROAS bajó 40%. Diagnóstico CMO + acciones técnicas de tracking y landing.",
    ],
  },
  {
    id: "estrategia",
    href: "/app/estrategia",
    label: "Estrategia & GTM",
    short: "Estrategia",
    description:
      "Posicionamiento, ICP, oferta, embudos, pricing y plan de crecimiento.",
    role: "cmo",
    icon: "target",
    starters: [
      "Diseña un posicionamiento y oferta irresistible para [mi industria].",
      "Arma un GTM de 90 días con métricas y hitos semanales.",
      "Define ICP, buyer persona y mensajes por etapa del embudo.",
    ],
  },
  {
    id: "copy",
    href: "/app/copy",
    label: "Copy & Creativos",
    short: "Copy",
    description:
      "Headlines, scripts, emails, landing copy y frameworks de creativos ganadores.",
    role: "cmo",
    icon: "pen",
    starters: [
      "Escribe 10 ángulos creativos y 5 scripts UGC de 15–30s para Meta Ads.",
      "Redacta la home completa: hero, prueba social, oferta, objeciones y CTA.",
      "Crea una secuencia de email de 5 emails para nurture post-lead.",
    ],
  },
  {
    id: "ads",
    href: "/app/ads",
    label: "Media & Ads",
    short: "Ads",
    description:
      "Estructura de campañas, presupuestos, testing, creative matrix y scaling.",
    role: "cmo",
    icon: "megaphone",
    starters: [
      "Diseña la estructura de campañas Meta + Google para un presupuesto de $2,000/mes.",
      "Plan de testing de creativos: hipótesis, variables y criterios de kill/scale.",
      "Cómo escalar de $50/día a $500/día sin romper el CPA.",
    ],
  },
  {
    id: "tech",
    href: "/app/tech",
    label: "Arquitectura & CTO",
    short: "Tech",
    description:
      "Stack, arquitectura, integraciones, performance, seguridad y roadmap técnico.",
    role: "cto",
    icon: "cpu",
    starters: [
      "Propón arquitectura y stack para un marketplace MVP multi-tenant.",
      "Auditoría técnica: qué priorizar en performance, SEO y conversiones.",
      "Diseña el data model y eventos de tracking para growth analytics.",
    ],
  },
  {
    id: "code",
    href: "/app/code",
    label: "Code Lab",
    short: "Code",
    description:
      "Código production-ready, componentes, APIs, refactors y specs de implementación.",
    role: "lead",
    icon: "code",
    starters: [
      "Genera un componente React de pricing table con toggle mensual/anual.",
      "API route Next.js para checkout con validación Zod y manejo de errores.",
      "Refactoriza este código y explica trade-offs + tests mínimos.",
    ],
  },
  {
    id: "proyectos",
    href: "/app/proyectos",
    label: "Proyectos",
    short: "Proyectos",
    description:
      "Workspaces por marca o cliente: contexto, notas y deliverables guardados.",
    role: "agencia",
    icon: "folder",
    starters: [],
  },
  {
    id: "memoria",
    href: "/app/memoria",
    label: "Memoria",
    short: "Memoria",
    description:
      "Hechos y preferencias que APEX recuerda entre sesiones, solo para ti.",
    role: "agencia",
    icon: "brain",
    starters: [],
  },
];

export function getModule(id: ModuleId) {
  return MODULES.find((m) => m.id === id)!;
}
