"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  BookmarkPlus,
  Loader2,
  Send,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ModuleId, RoleMode } from "@/lib/modules";
import {
  getActiveProject,
  projectToContext,
  saveDeliverable,
} from "@/lib/projects";
import { SimpleMarkdown } from "./markdown";

type Props = {
  moduleId: ModuleId;
  role: RoleMode;
  title: string;
  subtitle: string;
  starters: string[];
};

export function ChatPanel({ moduleId, role, title, subtitle, starters }: Props) {
  const [input, setInput] = useState("");
  const [projectName, setProjectName] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef({ role, moduleId, projectContext: "" });

  useEffect(() => {
    const p = getActiveProject();
    contextRef.current = {
      role,
      moduleId,
      projectContext: projectToContext(p),
    };
    setProjectName(p?.name ?? null);
  }, [role, moduleId]);

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
    id: `apex-${moduleId}`,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  }

  async function runStarter(text: string) {
    if (busy) return;
    setInput("");
    await sendMessage({ text });
  }

  function clearChat() {
    setMessages([]);
  }

  function saveLastAsDeliverable() {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const text = last.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n");
    if (!text.trim()) return;

    const project = getActiveProject();
    saveDeliverable({
      projectId: project?.id ?? null,
      moduleId,
      title: `${title} · ${new Date().toLocaleString("es")}`,
      content: text,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3 w-3" />
              {roleLabel(role)}
            </span>
            {projectName && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-400">
                Proyecto: {projectName}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveLastAsDeliverable}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            {savedFlash ? "Guardado" : "Guardar deliverable"}
          </button>
          <button
            type="button"
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6">
              <p className="text-sm leading-relaxed text-zinc-300">
                Habla con el equipo senior de APEX. Obtén estrategia, ads, copy,
                arquitectura y código en un solo flujo — con el rigor de una
                agencia + CTO + lead dev de 15+ años.
              </p>
            </div>
            {starters.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-1">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Empieza con
                </p>
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => runStarter(s)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((m) => {
              const text = m.parts
                .filter(
                  (p): p is { type: "text"; text: string } => p.type === "text",
                )
                .map((p) => p.text)
                .join("");

              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[90%] rounded-2xl rounded-br-md bg-amber-500/15 px-4 py-3 text-sm text-amber-50 ring-1 ring-amber-400/20">
                      {text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-amber-400/80">
                    APEX · {roleLabel(role)}
                  </div>
                  <SimpleMarkdown content={text || "…"} />
                </div>
              );
            })}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                El consejo está trabajando…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-red-500/30 bg-red-500/10 px-5 py-2 text-sm text-red-200">
          {error.message ||
            "Error al contactar el modelo. Revisa XAI_API_KEY en .env.local"}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="border-t border-white/10 bg-[#0b0b0f]/95 px-5 py-4 backdrop-blur"
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
            rows={2}
            placeholder="Pide estrategia, ads, arquitectura o código… (Enter envía, Shift+Enter nueva línea)"
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-amber-400/0 transition placeholder:text-zinc-600 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex h-[52px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex h-[52px] items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Enviar
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
      return "Consejo Senior";
  }
}
