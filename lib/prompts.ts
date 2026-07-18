import { COPY_MODULE_SYSTEM } from "./copy-actions";
import type { ModuleId, RoleMode } from "./modules";
import { LIVE_RESEARCH_SYSTEM } from "./research-tools";

/**
 * System prompt compacto — cada token aquí se paga en TODA request.
 */
export const AGENCY_CORE = `Eres APEX: CMO+CTO+Lead senior. Español, concreto, sin relleno.
- Usa memoria/proyecto; 1–3 preguntas o SUPUESTOS si falta info.
- Decisión → plan → métricas → próximo paso 48h.
- Coherencia: si hay DECISIONES ACTIVAS de otro módulo, síguelas (mix 70/20/10 etc.).
- Producto: digital, servicio o físico. Copy/código shippables.`;

const ROLE_LAYERS: Record<RoleMode, string> = {
  agencia: "Modo consejo: una decisión clara CMO+CTO+Lead.",
  cmo: "Modo CMO: growth, mensaje, canales, unit economics.",
  cto: "Modo CTO: arquitectura, stack, riesgos, TTV.",
  lead: "Modo Lead: código/specs shippables.",
};

const MODULE_LAYERS: Partial<Record<ModuleId, string>> = {
  consejo: "Prioriza negocio+tech; deja decisiones reutilizables.",
  estrategia: "GTM, ICP, oferta, embudo; mix claro para Copy/Ads.",
  copy: "Ver reglas COPY abajo.",
  ads: "Campañas/creativos alineados a estrategia activa. Sé breve.",
  tech: "Arquitectura que soporte oferta/embudo. Trade-offs cortos.",
  code: "Implementa lo decidido; código listo, no essays.",
  proyectos: "Deliverables del proyecto activo.",
  dashboard: "Resumen ejecutivo corto.",
  memoria: "Hechos del usuario.",
  planes: "Planes de suscripción.",
};

const MAX_PROJECT_CHARS = 400;
const MAX_MEMORY_ITEMS = 6;
const MAX_MEMORY_CHARS = 500;
const MAX_HANDOFF_IN_SYSTEM = 900;

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
    const key = content.toLowerCase().replace(/\s+/g, " ").slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`- ${clip(content, 100)}`);
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
  liveResearch?: boolean;
}) {
  const parts = [
    AGENCY_CORE,
    ROLE_LAYERS[opts.role],
    MODULE_LAYERS[opts.moduleId] ?? "",
  ];

  if (opts.moduleId === "copy") {
    parts.push(COPY_MODULE_SYSTEM);
  }

  if (opts.liveResearch) {
    parts.push(LIVE_RESEARCH_SYSTEM);
  }

  if (opts.userName?.trim()) {
    parts.push(`Usuario: ${clip(opts.userName, 40)}.`);
  }

  if (opts.projectContext?.trim()) {
    parts.push(`Proyecto:\n${clip(opts.projectContext, MAX_PROJECT_CHARS)}`);
  }

  if (opts.handoffContext?.trim()) {
    parts.push(
      `DECISIONES ACTIVAS:\n${clip(opts.handoffContext, MAX_HANDOFF_IN_SYSTEM)}`,
    );
  }

  if (opts.memoryContext?.trim()) {
    parts.push(`Memoria:\n${opts.memoryContext.trim()}`);
  }

  return parts.filter(Boolean).join("\n\n");
}

/** Recorta historial y recorta cada mensaje (historial con posts largos quema créditos). */
export function trimMessagesForModel<
  T extends { role: string; content?: unknown; parts?: unknown },
>(messages: T[], maxMessages = 6): T[] {
  const slice = messages.length <= maxMessages
    ? messages
    : messages.slice(-maxMessages);
  return slice;
}

/** Máx chars de texto por mensaje de historial hacia el modelo */
export const MAX_MSG_CHARS_FOR_MODEL = 1400;
