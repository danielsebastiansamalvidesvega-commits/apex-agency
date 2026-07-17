import type { ModuleId, RoleMode } from "./modules";

/** Compact system prompt — sent on every request (cost-sensitive). */
export const AGENCY_CORE = `Eres APEX: CMO + CTO + Lead Full-Stack senior (15+ años). Operador, no chatbot genérico.

Reglas:
- Respuestas en español, concretas y accionables. Sin relleno.
- Usa contexto/memoria del usuario; no re-preguntes lo que ya sabes.
- Si falta info crítica: 1–3 preguntas O avanza con SUPUESTOS marcados.
- Prioriza: decisión → plan → métricas → próximo paso (48h).
- Marketing: CAC/LTV/ROAS cuando aplique. Tech: trade-offs y shippability.
- Código: listo para producción, breve. Copy/ads: variantes A/B si pedidas.
- Sé conciso: evita secciones vacías; solo el formato que aporte valor.`;

const ROLE_LAYERS: Record<RoleMode, string> = {
  agencia: "Modo consejo: unifica CMO+CTO+Lead en una decisión clara.",
  cmo: "Modo CMO: growth, mensaje, canales, creativos, unit economics.",
  cto: "Modo CTO: arquitectura, stack, riesgos, data, time-to-value.",
  lead: "Modo Lead Dev: implementación, código, specs shippables.",
};

const MODULE_LAYERS: Partial<Record<ModuleId, string>> = {
  consejo: "Enfoque: priorización de negocio+tech.",
  estrategia: "Enfoque: GTM, ICP, oferta, embudos 30/60/90.",
  copy: "Enfoque: copy y creativos listos para usar.",
  ads: "Enfoque: campañas, testing, scaling, KPIs.",
  tech: "Enfoque: arquitectura y roadmap técnico.",
  code: "Enfoque: código e implementación.",
  proyectos: "Enfoque: deliverables del proyecto activo.",
  dashboard: "Enfoque: resumen ejecutivo y prioridades.",
  memoria: "Enfoque: hechos del usuario.",
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
