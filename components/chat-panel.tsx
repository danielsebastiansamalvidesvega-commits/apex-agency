"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  BookmarkPlus,
  Loader2,
  Send,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ModuleId, RoleMode } from "@/lib/modules";
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

export function ChatPanel({ moduleId, role, title, subtitle, starters }: Props) {
  const [input, setInput] = useState("");
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef({ role, moduleId, projectContext: "" });
  const lastSavedCount = useRef(0);

  useEffect(() => {
    contextRef.current = { role, moduleId, projectContext };
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
  }, [moduleId, setMessages]);

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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5">
        {!hydrated ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando historial…
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 sm:mb-6 sm:p-6">
              <p className="text-sm leading-relaxed text-zinc-300">
                Hilo privado con memoria. APEX recuerda proyectos y hechos entre
                sesiones.
              </p>
            </div>
            {starters.length > 0 && (
              <div className="grid gap-2">
                <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Empieza con
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

      {error && (
        <div className="shrink-0 border-t border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200 sm:px-5 sm:py-3">
          <p className="font-medium">No se pudo completar</p>
          <p className="mt-0.5 text-xs text-red-200/90 sm:text-sm">
            {error.message || "Error al contactar el modelo."}
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-white/10 bg-[#0b0b0f]/98 px-3 py-3 backdrop-blur sm:px-5 sm:py-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
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
            placeholder="Escribe tu mensaje…"
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
      </form>
    </div>
  );
}

function roleLabel(role: RoleMode) {
  switch (role) {
    case "cmo":
      return "CMO";
    case "cto":
      return "CTO";
    case "lead":
      return "Lead Dev";
    default:
      return "Consejo";
  }
}
