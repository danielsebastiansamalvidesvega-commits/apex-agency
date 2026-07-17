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
    label: "Inicio",
    short: "Inicio",
    description: "Tu punto de partida. Elige qué quieres hacer hoy.",
    role: "agencia",
    icon: "layout",
    starters: [],
  },
  {
    id: "consejo",
    href: "/app/consejo",
    label: "Hablar con APEX",
    short: "Chat",
    description: "Pregunta lo que necesites: ideas, ventas, web o negocio.",
    role: "agencia",
    icon: "users",
    starters: [
      "Ayúdame a armar un plan simple para vender mi producto en redes.",
      "No sé por dónde empezar con mi negocio. Guíame paso a paso.",
      "Revisa mi idea y dime qué mejorar para vender más.",
    ],
  },
  {
    id: "estrategia",
    href: "/app/estrategia",
    label: "Plan de negocio",
    short: "Plan",
    description: "Define a quién le vendes, qué ofreces y cómo lanzarlo.",
    role: "cmo",
    icon: "target",
    starters: [
      "Describe a mi cliente ideal para [mi negocio] de forma clara y realista.",
      "¿Cuáles son los problemas más urgentes de la gente en [mi tema]?",
      "Diseña un producto simple que resuelva este problema: [describe el problema].",
    ],
  },
  {
    id: "copy",
    href: "/app/copy",
    label: "Textos y posts",
    short: "Textos",
    description: "Páginas de venta, mensajes y publicaciones listas para copiar.",
    role: "cmo",
    icon: "pen",
    starters: [
      "Escribe una página de ventas sencilla para [mi producto].",
      "Dame 5 objeciones que me harían al comprar y cómo responderlas.",
      "Escribe 5 posts para Facebook sobre [mi tema], fáciles de leer.",
    ],
  },
  {
    id: "ads",
    href: "/app/ads",
    label: "Anuncios",
    short: "Ads",
    description: "Cómo armar y mejorar tus anuncios en Facebook y Meta.",
    role: "cmo",
    icon: "megaphone",
    starters: [
      "Explícame cómo armar anuncios en Facebook para [mi producto], paso a paso.",
      "Dame 5 ideas de anuncios con un beneficio claro.",
      "Tengo poco presupuesto. ¿Cómo empiezo a anunciar sin quemar dinero?",
    ],
  },
  {
    id: "tech",
    href: "/app/tech",
    label: "Tecnología",
    short: "Tech",
    description: "Qué herramientas usar y cómo organizar tu web o app.",
    role: "cto",
    icon: "cpu",
    starters: [
      "¿Qué necesito para tener una página de ventas y captar clientes?",
      "Recomiéndame herramientas simples para [mi tipo de negocio].",
      "Explícame en palabras simples cómo medir si mi embudo funciona.",
    ],
  },
  {
    id: "code",
    href: "/app/code",
    label: "Código",
    short: "Código",
    description: "Ayuda para programar páginas, formularios y componentes.",
    role: "lead",
    icon: "code",
    starters: [
      "Ayúdame a crear una landing simple en Next.js.",
      "Hazme un formulario de contacto con validación.",
      "Explica este código y cómo mejorarlo: [pega tu código].",
    ],
  },
  {
    id: "proyectos",
    href: "/app/proyectos",
    label: "Mis negocios",
    short: "Negocios",
    description: "Guarda la info de tu marca o cliente para no repetirla.",
    role: "agencia",
    icon: "folder",
    starters: [],
  },
  {
    id: "memoria",
    href: "/app/memoria",
    label: "Lo que recuerdo",
    short: "Notas",
    description: "Cosas importantes que APEX guarda para ti entre sesiones.",
    role: "agencia",
    icon: "brain",
    starters: [],
  },
];

export function getModule(id: ModuleId) {
  return MODULES.find((m) => m.id === id)!;
}
