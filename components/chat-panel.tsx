"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowRightLeft,
  BookmarkPlus,
  Check,
  ChevronDown,
  Clapperboard,
  FileText,
  Images,
  Loader2,
  Send,
  Sparkles,
  Square,
  Tag,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COPY_ACTIONS,
  expandToFullPostsPrompt,
} from "@/lib/copy-actions";
import {
  formatHandoffsForPrompt,
  HANDOFF_TARGETS,
  lsAddHandoff,
  lsListHandoffs,
  lsRemoveHandoff,
  moduleLabel,
  type Handoff,
} from "@/lib/handoffs";
import type { ModuleId, RoleMode } from "@/lib/modules";
import { MODULES } from "@/lib/modules";
import { SimpleMarkdown } from "./markdown";

type Props = {
  moduleId: ModuleId;
  role: RoleMode;
  title: string;
  subtitle: string;
  starters: string[];
};

function textFromMessage(m: UIMessage) {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}

function titleFromContent(content: string, from: string) {
  const firstLine = content
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 8);
  const base = (firstLine || content).replace(/\s+/g, " ").slice(0, 72);
  return base || `Desde ${moduleLabel(from)}`;
}

export function ChatPanel({ moduleId, role, title, subtitle, starters }: Props) {
  const [input, setInput] = useState("");
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeHandoffs, setActiveHandoffs] = useState<Handoff[]>([]);
  const [handoffPickerFor, setHandoffPickerFor] = useState<string | null>(null);
  const [handoffSaving, setHandoffSaving] = useState<string | null>(null);
  const [handoffToast, setHandoffToast] = useState<{
    label: string;
    href: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef({
    role,
    moduleId,
    projectContext: "",
    handoffContext: "",
  });
  const lastSavedCount = useRef(0);

  const refreshHandoffs = useCallback(
    async (pid?: string | null) => {
      const local = lsListHandoffs(moduleId);
      let remote: Handoff[] = [];
      try {
        const qs = new URLSearchParams({ toModule: moduleId });
        if (pid) qs.set("projectId", pid);
        const res = await fetch(`/api/handoffs?${qs}`);
        if (res.ok) {
          const data = await res.json();
          remote = (data.handoffs || []) as Handoff[];
        }
      } catch {
        /* offline / table missing */
      }

      // Merge by id, prefer remote
      const map = new Map<string, Handoff>();
      for (const h of local) map.set(h.id, h);
      for (const h of remote) map.set(h.id, h);
      const merged = Array.from(map.values()).sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || ""),
      );
      setActiveHandoffs(merged);

      const ctx = formatHandoffsForPrompt(merged, moduleId);
      contextRef.current = {
        ...contextRef.current,
        handoffContext: ctx,
      };
    },
    [moduleId],
  );

  useEffect(() => {
    contextRef.current = {
      ...contextRef.current,
      role,
      moduleId,
      projectContext,
    };
  }, [role, moduleId, projectContext]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ ...contextRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport,
    id: `apex-${moduleId}-${projectId || "none"}`,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setHydrated(false);
      try {
        const profileRes = await fetch("/api/profile");
        let activeId: string | null = null;
        let ctx = "";
        let name: string | null = null;

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.activeProject) {
            activeId = data.activeProject.id;
            name = data.activeProject.name;
            const p = data.activeProject;
            ctx = [
              `Nombre: ${p.name}`,
              p.industry && `Industria: ${p.industry}`,
              p.offer && `Oferta: ${p.offer}`,
              p.audience && `Audiencia: ${p.audience}`,
              p.goals && `Objetivos: ${p.goals}`,
              p.stack && `Stack: ${p.stack}`,
              p.budget && `Presupuesto: ${p.budget}`,
              p.notes && `Notas: ${p.notes}`,
            ]
              .filter(Boolean)
              .join("\n");
          }
        }

        if (cancelled) return;
        setProjectId(activeId);
        setProjectName(name);
        setProjectContext(ctx);
        contextRef.current = {
          ...contextRef.current,
          projectContext: ctx,
        };

        await refreshHandoffs(activeId);

        const qs = new URLSearchParams({ moduleId });
        if (activeId) qs.set("projectId", activeId);
        const convRes = await fetch(`/api/conversations?${qs}`);
        if (convRes.ok) {
          const { conversation, messages: dbMessages } = await convRes.json();
          if (cancelled) return;
          setConversationId(conversation.id);
          const uiMessages: UIMessage[] = (dbMessages || []).map(
            (m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              parts: [{ type: "text" as const, text: m.content }],
            }),
          );
          setMessages(uiMessages);
          lastSavedCount.current = uiMessages.length;
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [moduleId, setMessages, refreshHandoffs]);

  useEffect(() => {
    if (!conversationId || !hydrated) return;
    if (busy) return;
    if (messages.length <= lastSavedCount.current) return;

    const newOnes = messages.slice(lastSavedCount.current);
    const payload = newOnes
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: textFromMessage(m),
      }))
      .filter((m) => m.content.trim());

    if (!payload.length) {
      lastSavedCount.current = messages.length;
      return;
    }

    void fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        projectId,
        messages: payload,
      }),
    }).then(() => {
      lastSavedCount.current = messages.length;
    });
  }, [messages, busy, conversationId, hydrated, projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Close picker on outside click (simple)
  useEffect(() => {
    if (!handoffPickerFor) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setHandoffPickerFor(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handoffPickerFor]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy || !hydrated) return;
    setInput("");
    await sendMessage({ text });
  }

  async function runStarter(text: string) {
    if (busy || !hydrated) return;
    setInput("");
    await sendMessage({ text });
  }

  const clearChat = useCallback(async () => {
    setMessages([]);
    lastSavedCount.current = 0;
    if (conversationId) {
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", conversationId }),
      });
    }
  }, [conversationId, setMessages]);

  async function saveLastAsDeliverable() {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const text = textFromMessage(last);
    if (!text.trim()) return;

    const res = await fetch("/api/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        moduleId,
        title: `${title} · ${new Date().toLocaleString("es")}`,
        content: text,
      }),
    });
    if (res.ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    }
  }

  async function sendHandoff(content: string, toModule: ModuleId, msgId: string) {
    if (!content.trim()) return;
    setHandoffSaving(`${msgId}:${toModule}`);
    const handoffTitle = titleFromContent(content, moduleId);

    // Always persist locally so coherence works even without the SQL table
    lsAddHandoff({
      from_module: moduleId,
      to_module: toModule,
      title: handoffTitle,
      content: content.slice(0, 12000),
      project_id: projectId,
    });

    try {
      const res = await fetch("/api/handoffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromModule: moduleId,
          toModule,
          title: handoffTitle,
          content: content.slice(0, 12000),
          projectId,
        }),
      });
      if (!res.ok) {
        // localStorage already saved — still OK
      }
    } catch {
      /* local fallback is enough */
    }

    setHandoffPickerFor(null);
    setHandoffSaving(null);
    const dest = moduleLabel(toModule);
    setHandoffToast({
      label: `Listo: se usará en ${dest}`,
      href: moduleHref(toModule),
    });
    setTimeout(() => setHandoffToast(null), 4000);
  }

  async function dismissHandoff(id: string) {
    lsRemoveHandoff(id);
    setActiveHandoffs((prev) => prev.filter((h) => h.id !== id));
    try {
      await fetch(`/api/handoffs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      /* ignore */
    }
    // refresh context for next messages
    const remaining = activeHandoffs.filter((h) => h.id !== id);
    contextRef.current = {
      ...contextRef.current,
      handoffContext: formatHandoffsForPrompt(remaining, moduleId),
    };
  }

  const handoffTargets = HANDOFF_TARGETS.filter((t) => t.id !== moduleId);
  const moduleHref = (id: ModuleId) =>
    MODULES.find((m) => m.id === id)?.href || "/app";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-white/10 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300 sm:text-[11px]">
                <Sparkles className="h-3 w-3" />
                {roleLabel(role)}
              </span>
              {projectName && (
                <span className="max-w-[10rem] truncate rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 sm:max-w-none sm:text-[11px]">
                  {projectName}
                </span>
              )}
              {activeHandoffs.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 sm:text-[11px]">
                  <ArrowRightLeft className="h-3 w-3" />
                  {activeHandoffs.length} decisión
                  {activeHandoffs.length > 1 ? "es" : ""} activa
                  {activeHandoffs.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
              {title}
            </h1>
            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 sm:line-clamp-none sm:text-sm sm:text-zinc-400">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={saveLastAsDeliverable}
              title="Guardar deliverable"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs font-medium text-zinc-200 transition active:scale-95 hover:bg-white/10 sm:px-3"
            >
              <BookmarkPlus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {savedFlash ? "Guardado" : "Guardar"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void clearChat()}
              title="Limpiar chat"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs font-medium text-zinc-300 transition active:scale-95 hover:bg-white/10 sm:px-3"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner: decisiones activas transferidas a este módulo */}
      {activeHandoffs.length > 0 && hydrated && (
        <div className="shrink-0 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-3 py-2.5 sm:px-5">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-emerald-300/90">
              Contexto de otros módulos (la IA lo respeta)
            </p>
            <div className="flex flex-col gap-2">
              {activeHandoffs.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="group flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-black/20 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-medium text-emerald-200">
                        {h.title || "Idea transferida"}
                      </span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400">
                        desde {moduleLabel(h.from_module)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-zinc-400">
                      {h.content.slice(0, 180)}
                      {h.content.length > 180 ? "…" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void dismissHandoff(h.id)}
                    title="Dejar de usar esta idea"
                    className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5">
        {!hydrated ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando historial…
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/10 to-transparent p-4 sm:mb-6 sm:p-6">
              <p className="text-sm leading-relaxed text-zinc-300">
                Conversación privada. APEX usa tu proyecto, memoria y{" "}
                <span className="text-emerald-300/90">
                  decisiones transferidas
                </span>{" "}
                de otros módulos (ej. estrategia → copy) para mantener
                coherencia.
              </p>
              {moduleId === "copy" && (
                <p className="mt-2 text-xs leading-relaxed text-violet-200/90">
                  Cada pieza sale etiquetada por red:{" "}
                  <strong className="font-semibold text-violet-100">
                    Facebook (texto largo)
                  </strong>
                  ,{" "}
                  <strong className="font-semibold text-violet-100">
                    Instagram (estético + mensaje directo)
                  </strong>
                  ,{" "}
                  <strong className="font-semibold text-violet-100">
                    TikTok (reels / carrusel)
                  </strong>
                  . Usa los botones de abajo: listo para copiar + creativo nativo.
                </p>
              )}
              {activeHandoffs.length > 0 && (
                <p className="mt-2 text-xs text-emerald-300/80">
                  Hay {activeHandoffs.length} decisión
                  {activeHandoffs.length > 1 ? "es" : ""} activa
                  {activeHandoffs.length > 1 ? "s" : ""} de{" "}
                  {moduleLabel(activeHandoffs[0].from_module)}
                  {activeHandoffs.length > 1 ? " y más" : ""}. Tus ideas de
                  contenido/ads respetarán ese plan.
                </p>
              )}
            </div>
            {starters.length > 0 && (
              <div className="grid gap-2">
                <p className="mb-0.5 text-xs font-medium text-zinc-500">
                  Sugerencias para empezar
                </p>
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => runStarter(s)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3.5 text-left text-[13px] leading-snug text-zinc-300 transition active:scale-[0.99] hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-white sm:px-4 sm:text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
            {messages.map((m) => {
              const text = textFromMessage(m);
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[92%] rounded-2xl rounded-br-md bg-amber-500/15 px-3.5 py-2.5 text-[13px] leading-relaxed text-amber-50 ring-1 ring-amber-400/20 sm:max-w-[90%] sm:px-4 sm:py-3 sm:text-sm">
                      {text}
                    </div>
                  </div>
                );
              }
              const pickerOpen = handoffPickerFor === m.id;
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3.5 sm:px-4 sm:py-4"
                >
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-amber-400/80 sm:text-[11px]">
                    APEX · {roleLabel(role)}
                  </div>
                  <div className="text-[13px] sm:text-[15px]">
                    <SimpleMarkdown content={text || "…"} />
                  </div>

                  {/* Acciones de copy + handoffs */}
                  {text.trim().length > 40 && !busy && (
                    <div className="relative mt-3 border-t border-white/5 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {moduleId === "copy" && (
                          <button
                            type="button"
                            onClick={() =>
                              void runStarter(expandToFullPostsPrompt(text))
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/35 bg-violet-400/15 px-3 py-1.5 text-[11px] font-semibold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-400/25 active:scale-[0.98] sm:text-xs"
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            Expandir por red (FB / IG / TikTok)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setHandoffPickerFor(pickerOpen ? null : m.id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-400/15 active:scale-[0.98] sm:text-xs"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          Usar esta idea en…
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition ${pickerOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        {/* Quick chips for top related modules */}
                        {quickTargets(moduleId).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            disabled={handoffSaving === `${m.id}:${t.id}`}
                            onClick={() => void sendHandoff(text, t.id, m.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-200 disabled:opacity-50 sm:text-xs"
                          >
                            {handoffSaving === `${m.id}:${t.id}` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : null}
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {pickerOpen && (
                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-[#121218] p-2 shadow-2xl shadow-black/50 ring-1 ring-amber-400/10 sm:left-0 sm:right-auto sm:min-w-[280px]">
                          <p className="px-2 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                            ¿En qué apartado quieres usar esta respuesta?
                          </p>
                          <div className="grid gap-0.5">
                            {handoffTargets.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                disabled={!!handoffSaving}
                                onClick={() =>
                                  void sendHandoff(text, t.id, m.id)
                                }
                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-amber-400/10 hover:text-amber-100 disabled:opacity-50"
                              >
                                <span className="font-medium">{t.label}</span>
                                {handoffSaving === `${m.id}:${t.id}` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
                                ) : (
                                  <span className="text-[11px] text-zinc-500">
                                    → /app/{t.id === "consejo" ? "consejo" : t.id}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Trabajando…
              </div>
            )}
            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>

      {handoffToast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 sm:bottom-28">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-[#0f1410] px-4 py-2.5 text-sm text-emerald-100 shadow-xl shadow-black/40">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{handoffToast.label}</span>
            <Link
              href={handoffToast.href}
              className="ml-1 shrink-0 font-semibold text-amber-300 underline-offset-2 hover:underline"
            >
              Ir →
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="shrink-0 border-t border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200 sm:px-5 sm:py-3">
          <p className="font-medium">No se pudo completar</p>
          <p className="mt-0.5 text-xs text-red-200/90 sm:text-sm">
            {error.message || "Error al contactar el modelo."}
          </p>
          {(error.message?.includes("plan") ||
            error.message?.includes("límite") ||
            error.message?.includes("Mejora") ||
            error.message?.includes("402")) && (
            <a
              href="/app/planes"
              className="mt-2 inline-flex text-xs font-semibold text-amber-300 underline-offset-2 hover:underline"
            >
              Ver planes y mejorar →
            </a>
          )}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-white/10 bg-[#0b0b0f]/98 px-3 py-3 backdrop-blur sm:px-5 sm:py-4"
      >
        <div className="mx-auto max-w-3xl">
          {/* Botones fijos de Copy: posts listos para redes */}
          {moduleId === "copy" && (
            <div className="mb-2.5">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Por red · FB texto largo · IG estético · TikTok reels
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {COPY_ACTIONS.map((action) => {
                  const Icon = copyActionIcon(action.id);
                  return (
                    <button
                      key={action.id}
                      type="button"
                      disabled={busy || !hydrated}
                      onClick={() => void runStarter(action.prompt)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[11px] font-medium text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-400/20 active:scale-[0.98] disabled:opacity-40 sm:text-xs"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="sm:hidden">{action.shortLabel}</span>
                      <span className="hidden sm:inline">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void onSubmit(e);
                }
              }}
              rows={1}
              placeholder={
                moduleId === "copy"
                  ? "Pide un post, reel o sales page… o usa los botones de arriba"
                  : activeHandoffs.length
                    ? "Pregunta alineada a tu estrategia activa…"
                    : "Escribe tu mensaje…"
              }
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20 sm:min-h-[52px] sm:px-4 sm:text-sm"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white active:scale-95 sm:h-[52px] sm:w-auto sm:gap-2 sm:px-4 sm:text-sm sm:font-medium"
                aria-label="Detener"
              >
                <Square className="h-4 w-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || !hydrated}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-black transition active:scale-95 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:h-[52px] sm:w-auto sm:gap-2 sm:px-4 sm:text-sm sm:font-semibold"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function copyActionIcon(id: string) {
  switch (id) {
    case "tiktok":
      return Clapperboard;
    case "instagram":
      return Images;
    case "facebook":
      return FileText;
    case "oferta":
      return Tag;
    case "mix-redes":
      return Sparkles;
    default:
      return FileText;
  }
}

/** Módulos relacionados más comunes según el origen (atajos visuales) */
function quickTargets(from: ModuleId): { id: ModuleId; label: string }[] {
  const map: Partial<Record<ModuleId, ModuleId[]>> = {
    estrategia: ["copy", "ads", "tech"],
    copy: ["ads", "estrategia", "code"],
    ads: ["copy", "estrategia", "tech"],
    tech: ["code", "estrategia", "ads"],
    code: ["tech", "copy", "estrategia"],
    consejo: ["estrategia", "copy", "ads", "tech"],
  };
  const ids = (map[from] || ["estrategia", "copy", "ads"]).filter(
    (id) => id !== from,
  );
  return ids.slice(0, 3).map((id) => ({
    id,
    label: moduleLabel(id),
  }));
}

function roleLabel(role: RoleMode) {
  switch (role) {
    case "cmo":
      return "Marketing";
    case "cto":
      return "Tech";
    case "lead":
      return "Código";
    default:
      return "Consejo";
  }
}
