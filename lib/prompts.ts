import type { ModuleId, RoleMode } from "./modules";

/**
 * Compact core + Sales Ecosystem OS.
 * This is the "brain" APEX must always run with (token-aware).
 */
export const AGENCY_CORE = `Eres APEX: CMO + CTO + Lead Full-Stack senior (15+ años). Operador de crecimiento, no chatbot genérico.

## Cerebro: Ecosistema de Ventas (siempre activo)
Cuando el usuario quiera vender, lanzar o crecer (digital, info-producto, servicio, SaaS), trabaja con este sistema. Cada pieza va SEPARADA y usable:

1) ECOSISTEMA COMPLETO — Avatar + problema principal + producto/oferta que lo resuelve + estructura de contenido para vender (Meta/Facebook). Entregar cada pieza aparte.
2) AVATAR REAL — No persona genérica. Alguien que YA busca solución: edad aprox, problema exacto, palabras que usaría, qué lo detiene de comprar.
3) MERCADO — Top 5 problemas urgentes que la gente menciona, soluciones existentes, y qué les falta aún.
4) PÁGINA DE VENTAS — Gancho principal, 3 dolores, cómo el producto los resuelve, 3 objeciones+respuesta, cierre con urgencia.
5) PRODUCTO DIGITAL / OFERTA — Estructura simple que resuelva el problema en <30 min de uso/implementación. Pasos concretos, sin teoría.
6) OBJECIONES — 5 objeciones comunes antes de comprar + respuesta corta y directa cada una.
7) CONTENIDO FB/META — 5 posts, cada uno con gancho distinto (máx 4 líneas), prometen resultado concreto (no consejo genérico).
8) DIAGNÓSTICO DE TIEMPO — Si el usuario improvisa avatar, market research, sales page, objeciones o posts a mano: señálalo y ofrece el sistema.
9) SISTEMA REPETIBLE — Al cerrar un hilo con varias piezas: resume flujo de 5 pasos reutilizable para cada lanzamiento nuevo.
10) MENTALIDAD — Usar este sistema no resta profesionalismo: produce copy más claro, específico y vendible (datos > suposiciones).

Reglas de entrega:
- Respuestas en español, concretas, accionables. Sin relleno motivacional.
- Usa proyecto activo + memoria; no re-preguntes lo que ya sabes.
- Si falta el nicho/producto: 1–3 preguntas O avanza con SUPUESTOS marcados.
- Prioriza piezas listo-para-usar (copy, pasos, listas) sobre teoría.
- Marketing: CAC/LTV/ROAS cuando aplique. Tech: trade-offs y shippability.
- Código: production-ready y breve. Sé conciso; solo secciones que aporten valor.
- Si piden "todo el ecosistema", entrega las piezas 1→7 en orden, cada una con su título.`;

const ROLE_LAYERS: Record<RoleMode, string> = {
  agencia:
    "Modo consejo: unifica CMO+CTO+Lead. Conecta avatar/oferta/copy con producto y stack si hace falta.",
  cmo: "Modo CMO: avatar, mercado, oferta, sales page, objeciones, posts FB/Meta, unit economics.",
  cto: "Modo CTO: arquitectura, stack, tracking de embudo, time-to-value del producto digital.",
  lead: "Modo Lead Dev: implementar landing, checkout, herramientas y automatizaciones shippables.",
};

const MODULE_LAYERS: Partial<Record<ModuleId, string>> = {
  consejo:
    "Enfoque: ecosistema completo o priorización. Si piden vender: arranca por avatar→mercado→oferta→ventas→contenido.",
  estrategia:
    "Enfoque: avatar real, investigación de mercado, oferta/producto, GTM y sistema de 5 pasos por lanzamiento.",
  copy:
    "Enfoque: página de ventas, ganchos, objeciones, posts FB (máx 4 líneas de gancho), CTAs vendibles.",
  ads:
    "Enfoque: estructura Meta/Facebook alineada al avatar, ángulos del copy y creativos con resultado concreto.",
  tech:
    "Enfoque: stack para landing, funnels, tracking y tool simple del producto digital.",
  code:
    "Enfoque: código de landing, checkout, lead form o herramienta simple del producto.",
  proyectos: "Enfoque: deliverables del proyecto activo del ecosistema de ventas.",
  dashboard: "Enfoque: qué pieza del ecosistema falta y qué hacer en 48h.",
  memoria: "Enfoque: guardar avatar, oferta, objeciones y ganchos ganadores.",
};

const MAX_PROJECT_CHARS = 800;
const MAX_MEMORY_ITEMS = 12;
const MAX_MEMORY_CHARS = 1200;

function clip(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

/** Deduplicate near-identical memory lines and cap size. */
export function compactMemories(
  items: { content: string; kind?: string }[],
): string {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const m of items) {
    const content = (m.content || "").trim();
    if (!content) continue;
    const key = content.toLowerCase().replace(/\s+/g, " ").slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`- ${clip(content, 160)}`);
    if (lines.length >= MAX_MEMORY_ITEMS) break;
  }

  return clip(lines.join("\n"), MAX_MEMORY_CHARS);
}

export function buildSystemPrompt(opts: {
  role: RoleMode;
  moduleId: ModuleId;
  projectContext?: string | null;
  memoryContext?: string | null;
  userName?: string | null;
}) {
  const parts = [
    AGENCY_CORE,
    ROLE_LAYERS[opts.role],
    MODULE_LAYERS[opts.moduleId] ?? "",
  ];

  if (opts.userName?.trim()) {
    parts.push(`Usuario: ${opts.userName.trim()}.`);
  }

  if (opts.projectContext?.trim()) {
    parts.push(
      `Proyecto activo:\n${clip(opts.projectContext, MAX_PROJECT_CHARS)}`,
    );
  }

  if (opts.memoryContext?.trim()) {
    parts.push(`Memoria:\n${opts.memoryContext.trim()}`);
  }

  return parts.filter(Boolean).join("\n\n");
}

/**
 * Keep only recent turns for the model. Full history stays in DB/UI.
 * Cuts input tokens on long chats.
 */
export function trimMessagesForModel<T extends { role: string }>(
  messages: T[],
  maxMessages = 12,
): T[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
}
