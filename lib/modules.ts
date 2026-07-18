export type ModuleId =
  | "dashboard"
  | "consejo"
  | "estrategia"
  | "copy"
  | "ads"
  | "tech"
  | "code"
  | "proyectos"
  | "memoria"
  | "planes";

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
    | "brain"
    | "card";
  starters: string[];
}

export const MODULES: ModuleDef[] = [
  {
    id: "dashboard",
    href: "/app",
    label: "Inicio",
    short: "Inicio",
    description: "Resumen y acceso rápido a todo tu workspace.",
    role: "agencia",
    icon: "layout",
    starters: [],
  },
  {
    id: "consejo",
    href: "/app/consejo",
    label: "Consejo",
    short: "Consejo",
    description:
      "Tu mesa de expertos: marketing, tecnología y producto en una sola charla.",
    role: "agencia",
    icon: "users",
    starters: [
      "Quiero construir un ecosistema de ventas completo para [tu nicho]: avatar de cliente, problema principal, oferta que lo resuelva (puede ser producto digital, servicio o producto físico), y estructura de contenido para venderlo en Facebook. Dame cada pieza por separado.",
      "Toma todo lo que hemos creado en esta conversación —avatar, investigación, oferta, página de ventas, objeciones— y resume el sistema completo en un flujo de 5 pasos que pueda repetir cada vez que lance una oferta nueva.",
      "Audita en qué sigo perdiendo tiempo (investigación, avatar, sales page, objeciones, posts) y dame el plan de 48h para resolverlo con el sistema APEX.",
    ],
  },
  {
    id: "estrategia",
    href: "/app/estrategia",
    label: "Estrategia",
    short: "Estrategia",
    description:
      "Cliente ideal, mercado, oferta y plan de crecimiento claro.",
    role: "cmo",
    icon: "target",
    starters: [
      "Analiza el nicho de [tu tema] y créame un avatar de cliente específico: no genérico. Edad aprox, problema exacto, palabras que usaría y qué lo detiene de comprar.",
      "Analiza el mercado de [tu nicho]. Dime los 5 problemas más urgentes, qué soluciones ya existen y qué les sigue faltando.",
      "Con base en este problema: [describe el problema], propón 2–3 ofertas posibles (digital, servicio o producto físico) y desarrolla la mejor: qué es, cómo se entrega, precio sugerido y pasos concretos para venderla. Sin teoría de relleno.",
    ],
  },
  {
    id: "copy",
    href: "/app/copy",
    label: "Copy & textos",
    short: "Copy",
    description:
      "Páginas de venta, posts, ganchos y mensajes listos para publicar.",
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
    label: "Anuncios",
    short: "Ads",
    description:
      "Campañas en Meta/Facebook: estructura, creativos y cómo escalar.",
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
    label: "Tecnología",
    short: "Tech",
    description:
      "Stack, arquitectura, integraciones y decisiones técnicas con sentido de negocio.",
    role: "cto",
    icon: "cpu",
    starters: [
      "Propón el stack mínimo para landing de ventas + captura de leads + tracking de Meta para [producto].",
      "Arquitectura o proceso simple para entregar [mi oferta: digital / servicio / físico] de forma escalable (web, citas, envíos, etc. según aplique).",
      "Diseña el data model y eventos de tracking del embudo (view → lead → compra).",
    ],
  },
  {
    id: "code",
    href: "/app/code",
    label: "Código",
    short: "Código",
    description:
      "Componentes, APIs y código listo para implementar en tu producto.",
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
      "Tus marcas o clientes: contexto, notas y documentos guardados.",
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
      "Lo que APEX recuerda de ti entre sesiones (privado, solo tuyo).",
    role: "agencia",
    icon: "brain",
    starters: [],
  },
  {
    id: "planes",
    href: "/app/planes",
    label: "Planes",
    short: "Planes",
    description: "Gratis, Pro y Agency. Desbloquea más mensajes y módulos.",
    role: "agencia",
    icon: "card",
    starters: [],
  },
];

export function getModule(id: ModuleId) {
  return MODULES.find((m) => m.id === id)!;
}
