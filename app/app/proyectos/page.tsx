"use client";

import { useEffect, useState } from "react";
import {
  createProject,
  deleteDeliverable,
  deleteProject,
  getActiveProjectId,
  listDeliverables,
  listProjects,
  setActiveProjectId,
  updateProject,
  type Deliverable,
  type Project,
} from "@/lib/projects";
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

  function refresh() {
    setProjects(listProjects());
    setActiveId(getActiveProjectId());
    setDeliverables(listDeliverables());
  }

  useEffect(() => {
    refresh();
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      updateProject(editingId, form);
      setEditingId(null);
    } else {
      createProject(form);
    }
    setForm(emptyForm);
    refresh();
  }

  function activate(id: string) {
    setActiveProjectId(id);
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

  function remove(id: string) {
    if (!confirm("¿Eliminar este proyecto y sus deliverables asociados?")) return;
    deleteProject(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    refresh();
  }

  const projectDels = deliverables.filter(
    (d) => !activeId || d.projectId === activeId || d.projectId === null,
  );

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-white/10 px-6 py-5">
        <h1 className="text-xl font-semibold text-white">Proyectos</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Workspaces por marca o cliente. El proyecto activo se inyecta como
          contexto en todos los módulos de la agencia.
        </p>
      </header>

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
                  ["industry", "Industria", "SaaS B2B, e-commerce, salud…"],
                  ["offer", "Oferta principal", "Qué vendes y a qué precio"],
                  ["audience", "Audiencia / ICP", "Quién compra y por qué"],
                  ["goals", "Objetivos", "MRR, leads, ROAS, launch…"],
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
                Aún no hay proyectos. Crea el primero para dar contexto al
                equipo APEX.
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
                        Actualizado {formatDate(p.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {!active && (
                        <button
                          type="button"
                          onClick={() => activate(p.id)}
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
                        onClick={() => remove(p.id)}
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
                Desde cualquier módulo, usa &quot;Guardar deliverable&quot;
                para archivar respuestas del equipo.
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
                      {d.moduleId} · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeliverable(d.id);
                      if (selectedDel?.id === d.id) setSelectedDel(null);
                      refresh();
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
    </div>
  );
}
