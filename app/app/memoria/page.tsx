"use client";

import { useEffect, useState } from "react";
import type { Memory } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Brain, Plus, Trash2 } from "lucide-react";

export default function MemoriaPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const res = await fetch("/api/memories");
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar memoria");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), kind: "fact", source: "manual" }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "No se pudo guardar");
      return;
    }
    setContent("");
    await refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/memories?id=${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-amber-400" />
          <h1 className="text-xl font-semibold text-white">Memoria</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Hechos que tomatito recuerda entre sesiones — solo visibles para tu
          cuenta. Se alimentan desde proyectos, deliverables, chat (&quot;recuerda
          que…&quot;) o aquí manualmente.
        </p>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <form
          onSubmit={addMemory}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Nuevo recuerdo
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder='Ej. "El cliente odia el tono corporativo" o "Presupuesto ads: $1.5k/mes"'
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40"
          />
          <button
            type="submit"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
          >
            <Plus className="h-4 w-4" />
            Guardar en memoria
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Cargando memoria…</p>
        ) : memories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
            Aún no hay recuerdos. Crea un proyecto o escribe hechos clave aquí.
          </p>
        ) : (
          <ul className="space-y-2">
            {memories.map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">{m.content}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-600">
                    {m.kind} · {m.source} · {formatDate(m.updated_at || m.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(m.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
