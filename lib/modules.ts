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
    short: "Inicio",
    description:
      "Visión ejecutiva del negocio, prioridades y próximos movimientos.",
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
      "Mesa ejecutiva: CMO + CTO + Lead. Decisiones de negocio, ventas y producto.",
    role: "agencia",
    icon: "users",
    starters: [
      "Quiero construir un ecosistema de ventas completo para [tu nicho]: avatar de cliente, problema principal, producto digital que lo resuelva, y estructura de contenido para venderlo en Facebook. Dame cada pieza por separado.",
      "Toma todo lo que hemos creado en esta conversación —avatar, investigación, producto, página de ventas, objeciones— y resume el sistema completo en un flujo de 5 pasos que pueda repetir cada vez que lance un producto nuevo.",
      "Audita en qué sigo perdiendo tiempo (investigación, avatar, sales page, objeciones, posts) y dame el plan de 48h para resolverlo con el sistema APEX.",
    ],
  },
  {
    id: "estrategia",
    href: "/app/estrategia",
    label: "Estrategia",
    short: "Estrategia",
    description:
      "Posicionamiento, cliente ideal, oferta, embudos y plan de crecimiento (GTM).",
    role: "cmo",
    icon: "target",
    starters: [
      "Analiza el nicho de [tu tema] y créame un avatar de cliente específico: no genérico. Edad aprox, problema exacto, palabras que usaría y qué lo detiene de comprar.",
      "Analiza el mercado de [tu nicho]. Dime los 5 problemas más urgentes, qué soluciones ya existen y qué les sigue faltando.",
      "Con base en este problema: [describe el problema], dame la estructura completa de una herramienta/producto simple que lo resuelva en menos de 30 minutos. Pasos concretos, sin teoría.",
    ],
  },
  {
    id: "copy",
    href: "/app/copy",
    label: "Copy & Creativos",
    short: "Copy",
    description:
      "Página de ventas, ganchos, objeciones y posts listos para Facebook/Meta.",
    role: "cmo",
    icon: "pen",
    starters: [
      "Escribe una página de ventas para [tu producto]. Incluye: gancho principal, 3 dolores del cliente, cómo mi producto los resuelve, 3 objeciones con respuesta, y un cierre con urgencia.",
      "Dame las 5 objeciones más comunes antes de comprar [tu producto], y una respuesta corta y directa para cada una.",
      "Escribe 5 posts para Facebook sobre [tu tema], cada uno con un gancho distinto de máximo 4 líneas. Deben prometer un resultado concreto, no un consejo genérico.",
    ],
  },
  {
    id: "ads",
    href: "/app/ads",
    label: "Anuncios (Ads)",
    short: "Ads",
    description:
      "Estructura de campañas Meta/Facebook, testing de creativos y scaling.",
    role: "cmo",
    icon: "megaphone",
    starters: [
      "Con este avatar y oferta [resumen], diseña la estructura de campañas Facebook/Meta y 5 ángulos creativos con resultado concreto.",
      "Plan de testing de creativos para [producto]: hipótesis, variables y criterios de kill/scale.",
      "Cómo escalar de $50/día a $500/día en Meta sin romper el CPA, alineado a mi página de ventas.",
    ],
  },
  {
    id: "tech",
    href: "/app/tech",
    label: "Arquitectura & Tech",
    short: "Tech",
    description:
      "Stack, arquitectura, integraciones, performance, seguridad y roadmap técnico.",
    role: "cto",
    icon: "cpu",
    starters: [
      "Propón el stack mínimo para landing de ventas + captura de leads + tracking de Meta para [producto].",
      "Arquitectura de una herramienta digital simple que resuelva [problema] en <30 min de uso.",
      "Diseña el data model y eventos de tracking del embudo (view → lead → compra).",
    ],
  },
  {
    id: "code",
    href: "/app/code",
    label: "Código",
    short: "Código",
    description:
      "Programación lista para usar: componentes, APIs, landings y refactors.",
    role: "lead",
    icon: "code",
    starters: [
      "Genera la estructura de una landing de ventas (secciones del copy) en React/Next listo para pegar.",
      "API route Next.js para captura de lead con validación Zod.",
      "Componente de pricing/CTA con urgencia y toggle si aplica.",
    ],
  },
  {
    id: "proyectos",
    href: "/app/proyectos",
    label: "Proyectos",
    short: "Proyectos",
    description:
      "Workspaces por marca o cliente: contexto, notas y documentos guardados.",
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
