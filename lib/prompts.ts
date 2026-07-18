import { COPY_MODULE_SYSTEM } from "./copy-actions";
import type { ModuleId, RoleMode } from "./modules";

/**
 * Compact system prompt — sent on every request (cost-sensitive).
 */
export const AGENCY_CORE = `Eres APEX: CMO + CTO + Lead Full-Stack senior (15+ años). Operador, no chatbot genérico.

Reglas:
- Respuestas en español, concretas y accionables. Sin relleno.
- Usa contexto/memoria del usuario; no re-preguntes lo que ya sabes.
- Si falta info crítica: 1–3 preguntas O avanza con SUPUESTOS marcados.
- Prioriza: decisión → plan → métricas → próximo paso (48h).
- Marketing: CAC/LTV/ROAS cuando aplique. Tech: trade-offs y shippability.
- Código: listo para producción, breve. Copy/ads: variantes A/B si pedidas.
- En Copy & redes: si piden posts/ideas para RRSS, entrega posts COMPLETOS listos para copiar-pegar (no solo ideas) + recomendación de imagen o reel/video con guion creativo orientado al algoritmo.
- Sé conciso: evita secciones vacías; solo el formato que aporte valor.
- Si el usuario pide ecosistema de ventas, avatar real, mercado, oferta/producto, sales page, objeciones o posts FB: entrega piezas separadas, específicas y listo-para-usar (no genéricas).
- "Producto"/oferta puede ser digital, servicio o producto físico. Adapta entrega, logística, pricing y copy al tipo.
- COHERENCIA ENTRE MÓDULOS (crítico): si hay DECISIONES ACTIVAS o CONTEXTO TRANSFERIDO desde otro apartado (estrategia, copy, ads, etc.), síguelo de forma estricta. No inventes otra estrategia en paralelo.
- Si la estrategia define un mix (ej. 70% X / 20% Y / 10% Z), al generar posts, anuncios o piezas de copy respeta ESA proporción (no solo ideas del 70%).
- Extiende y opera la estrategia existente; si algo no cuadra, dilo y ofrece ajuste — no la ignores.`;

const ROLE_LAYERS: Record<RoleMode, string> = {
  agencia: "Modo consejo: unifica CMO+CTO+Lead en una decisión clara.",
  cmo: "Modo CMO: growth, mensaje, canales, creativos, unit economics.",
  cto: "Modo CTO: arquitectura, stack, riesgos, data, time-to-value.",
  lead: "Modo Lead Dev: implementación, código, specs shippables.",
};

const MODULE_LAYERS: Partial<Record<ModuleId, string>> = {
  consejo: "Enfoque: priorización de negocio+tech. Deja decisiones reutilizables por otros módulos.",
  estrategia:
    "Enfoque: GTM, ICP, oferta, embudos. Deja mix de contenidos y pilares claros para Copy/Ads.",
  copy: `Enfoque COPY senior (marketing digital + e-commerce):
- Posts/reels/carruseles: NUNCA solo ideas. Siempre TEXTO COMPLETO listo para copiar-pegar + ficha CREATIVO (imagen o video: qué mostrar, hook visual, texto en pantalla, por qué engancha el algoritmo).
- Optimiza engagement: stop-scroll en línea 1, retención 3s, comentarios/guardados/shares, CTA claro.
- Si hay estrategia/mix activo, respétalo al 100% en el lote.
- Sales pages, emails y ads: shippables, sin relleno.`,
  ads: "Enfoque: campañas y creativos alineados a estrategia y avatar activos.",
  tech: "Enfoque: arquitectura que soporte la oferta y el embudo definidos.",
  code: "Enfoque: implementar lo decidido en estrategia/tech, no un producto paralelo.",
  proyectos: "Enfoque: deliverables del proyecto activo.",
  dashboard: "Enfoque: resumen ejecutivo y prioridades.",
  memoria: "Enfoque: hechos del usuario.",
  planes: "Enfoque: planes de suscripción del producto.",
};

const MAX_PROJECT_CHARS = 800;
const MAX_MEMORY_ITEMS = 12;
const MAX_MEMORY_CHARS = 1200;

function clip(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

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
  handoffContext?: string | null;
  userName?: string | null;
}) {
  const parts = [
    AGENCY_CORE,
    ROLE_LAYERS[opts.role],
    MODULE_LAYERS[opts.moduleId] ?? "",
  ];

  if (opts.moduleId === "copy") {
    parts.push(COPY_MODULE_SYSTEM);
  }

  if (opts.userName?.trim()) {
    parts.push(`Usuario: ${opts.userName.trim()}.`);
  }

  if (opts.projectContext?.trim()) {
    parts.push(
      `Proyecto activo:\n${clip(opts.projectContext, MAX_PROJECT_CHARS)}`,
    );
  }

  if (opts.handoffContext?.trim()) {
    parts.push(
      `DECISIONES ACTIVAS / CONTEXTO TRANSFERIDO DESDE OTROS MÓDULOS (fuente de verdad — alinear todo a esto):\n${opts.handoffContext.trim()}`,
    );
  }

  if (opts.memoryContext?.trim()) {
    parts.push(`Memoria:\n${opts.memoryContext.trim()}`);
  }

  return parts.filter(Boolean).join("\n\n");
}

export function trimMessagesForModel<T extends { role: string }>(
  messages: T[],
  maxMessages = 12,
): T[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
}
