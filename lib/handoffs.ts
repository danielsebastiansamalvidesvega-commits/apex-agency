import type { ModuleId } from "./modules";
import { MODULES } from "./modules";

export type Handoff = {
  id: string;
  from_module: string;
  to_module: string;
  title: string;
  content: string;
  project_id?: string | null;
  active?: boolean;
  created_at?: string;
};

/** Módulos a los que se puede transferir una idea */
export const HANDOFF_TARGETS: { id: ModuleId; label: string }[] = MODULES.filter(
  (m) =>
    !["dashboard", "proyectos", "memoria", "planes"].includes(m.id),
).map((m) => ({ id: m.id, label: m.label }));

export function moduleLabel(id: string): string {
  return MODULES.find((m) => m.id === id)?.label || id;
}

const MAX_HANDOFF_CHARS = 3500;
const MAX_HANDOFFS_IN_PROMPT = 4;

export function formatHandoffsForPrompt(
  items: Handoff[],
  currentModule: string,
): string {
  if (!items.length) return "";

  const lines = items.slice(0, MAX_HANDOFFS_IN_PROMPT).map((h, i) => {
    const from = moduleLabel(h.from_module);
    const title = h.title?.trim() || `Idea ${i + 1}`;
    const body = h.content.trim().slice(0, 1200);
    return `### ${title}\nOrigen: ${from} → destino: ${moduleLabel(h.to_module) || currentModule}\n${body}`;
  });

  const text = lines.join("\n\n");
  return text.length > MAX_HANDOFF_CHARS
    ? text.slice(0, MAX_HANDOFF_CHARS) + "…"
    : text;
}

/** localStorage fallback when API/table not ready */
const LS_KEY = "apex_handoffs_v1";

export function lsListHandoffs(toModule?: string): Handoff[] {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Handoff[];
    const active = all.filter((h) => h.active !== false);
    if (!toModule) return active;
    return active.filter(
      (h) => h.to_module === toModule || h.to_module === "all",
    );
  } catch {
    return [];
  }
}

export function lsAddHandoff(
  input: Omit<Handoff, "id" | "created_at" | "active">,
): Handoff {
  const item: Handoff = {
    ...input,
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    active: true,
    created_at: new Date().toISOString(),
  };
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Handoff[];
    raw.unshift(item);
    localStorage.setItem(LS_KEY, JSON.stringify(raw.slice(0, 50)));
  } catch {
    localStorage.setItem(LS_KEY, JSON.stringify([item]));
  }
  return item;
}

export function lsRemoveHandoff(id: string) {
  const all = lsListHandoffs().filter((h) => h.id !== id);
  // Also need inactive ones - re-read raw
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Handoff[];
    localStorage.setItem(
      LS_KEY,
      JSON.stringify(raw.filter((h) => h.id !== id)),
    );
  } catch {
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  }
}

export function lsDeactivateForModule(toModule: string) {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Handoff[];
    const next = raw.map((h) =>
      h.to_module === toModule || h.to_module === "all"
        ? { ...h, active: false }
        : h,
    );
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
