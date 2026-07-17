"use client";

import { useEffect, useState } from "react";
import type { Deliverable, Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Check, FolderPlus, Trash2 } from "lucide-react";

const emptyForm = {
  name: "",
  industry: "",
  offer: "",
  audience: "",
  goals: "",
  stack: "",
  budget: "",
  notes: "",
};

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDel, setSelectedDel] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const [pRes, profileRes, dRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/profile"),
        fetch("/api/deliverables"),
      ]);
      if (!pRes.ok) throw new Error((await pRes.json()).error || "Error proyectos");
      const pData = await pRes.json();
      setProjects(pData.projects || []);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setActiveId(profile.profile?.active_project_id ?? null);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDeliverables(dData.deliverables || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      const res = await fetch(`/api/projects/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError((await res.json()).error || "Error al actualizar");
        return;
      }
      setEditingId(null);
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError((await res.json()).error || "Error al crear");
        return;
      }
    }
    setForm(emptyForm);
    await refresh();
  }

  async function activate(id: string) {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active_project_id: id }),
    });
    setActiveId(id);
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      industry: p.industry,
      offer: p.offer,
      audience: p.audience,
      goals: p.goals,
      stack: p.stack,
      budget: p.budget,
      notes: p.notes,
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este proyecto y datos asociados en memoria?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    await refresh();
  }

  async function removeDeliverable(id: string) {
    await fetch(`/api/deliverables?id=${id}`, { method: "DELETE" });
    if (selectedDel?.id === id) setSelectedDel(null);
    await refresh();
  }

  const projectDels = deliverables.filter(
    (d) => !activeId || d.project_id === activeId || d.project_id === null,
  );

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-white/10 px-6 py-5">
        <h1 className="text-xl font-semibold text-white">Proyectos</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Workspaces privados por marca o cliente. El proyecto activo se
          inyecta en el chat y alimenta la memoria de APEX.
        </p>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Cargando tus proyectos…</p>
      ) : (
        <div className="grid gap-6 p-6 xl:grid-cols-2">
          <section>
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">
                  {editingId ? "Editar proyecto" : "Nuevo proyecto"}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["name", "Nombre *", "Ej. Marca X / Cliente Y"],
                    ["industry", "Industria", "SaaS B2B, e-commerce…"],
                    ["offer", "Oferta principal", "Qué vendes y a qué precio"],
                    ["audience", "Audiencia / ICP", "Quién compra y por qué"],
                    ["goals", "Objetivos", "MRR, leads, ROAS…"],
                    ["stack", "Stack actual", "Next, Shopify, Meta Ads…"],
                    ["budget", "Presupuesto", "Ads + tech / mes"],
                  ] as const
                ).map(([key, label, ph]) => (
                  <label key={key} className="block text-xs text-zinc-400">
                    {label}
                    <input
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      placeholder={ph}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/40"
                    />
                  </label>
                ))}
                <label className="block text-xs text-zinc-400 sm:col-span-2">
                  Notas / contexto extra
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={3}
                    placeholder="Historial, restricciones, competidores, KPIs…"
                    className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/40"
                  />
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
                >
                  {editingId ? "Guardar cambios" : "Crear y activar"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 space-y-2">
              {projects.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                  Crea tu primer proyecto. APEX lo recordará en cada sesión.
                </p>
              )}
              {projects.map((p) => {
                const active = p.id === activeId;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-4 ${
                      active
                        ? "border-amber-400/40 bg-amber-400/10"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{p.name}</h3>
                          {active && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                              <Check className="h-3 w-3" /> Activo
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {[p.industry, p.offer].filter(Boolean).join(" · ") ||
                            "Sin detalle"}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-600">
                          Actualizado {formatDate(p.updated_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        {!active && (
                          <button
                            type="button"
                            onClick={() => void activate(p.id)}
                            className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"
                          >
                            Activar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(p.id)}
                          className="rounded-lg border border-red-500/20 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-white">
              Deliverables guardados
            </h2>
            <div className="space-y-2">
              {projectDels.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                  Usa &quot;Guardar deliverable&quot; en cualquier chat para
                  archivar respuestas.
                </p>
              )}
              {projectDels.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDel(d)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-amber-400/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{d.title}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">
                        {d.module_id} · {formatDate(d.created_at)}
                      </p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeDeliverable(d.id);
                      }}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedDel && (
              <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-amber-200">
                    {selectedDel.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedDel(null)}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Cerrar
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">
                  {selectedDel.content}
                </pre>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
