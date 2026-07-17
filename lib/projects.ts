import { uid } from "./utils";

export interface Project {
  id: string;
  name: string;
  industry: string;
  offer: string;
  audience: string;
  goals: string;
  stack: string;
  budget: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string | null;
  moduleId: string;
  title: string;
  content: string;
  createdAt: string;
}

const PROJECTS_KEY = "apex_projects_v1";
const ACTIVE_KEY = "apex_active_project_v1";
const DELIVERABLES_KEY = "apex_deliverables_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listProjects(): Project[] {
  if (typeof window === "undefined") return [];
  return safeParse<Project[]>(localStorage.getItem(PROJECTS_KEY), []);
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveProjectId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function getActiveProject(): Project | null {
  const id = getActiveProjectId();
  if (!id) return null;
  return listProjects().find((p) => p.id === id) ?? null;
}

export function createProject(
  input: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Project {
  const now = new Date().toISOString();
  const project: Project = {
    ...input,
    id: uid("proj"),
    createdAt: now,
    updatedAt: now,
  };
  const all = listProjects();
  all.unshift(project);
  saveProjects(all);
  setActiveProjectId(project.id);
  return project;
}

export function updateProject(id: string, patch: Partial<Project>): Project | null {
  const all = listProjects();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const updated: Project = {
    ...all[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveProjects(all);
  return updated;
}

export function deleteProject(id: string) {
  const all = listProjects().filter((p) => p.id !== id);
  saveProjects(all);
  if (getActiveProjectId() === id) setActiveProjectId(all[0]?.id ?? null);

  const dels = listDeliverables().filter((d) => d.projectId !== id);
  localStorage.setItem(DELIVERABLES_KEY, JSON.stringify(dels));
}

export function projectToContext(p: Project | null | undefined): string {
  if (!p) return "";
  return [
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

export function listDeliverables(projectId?: string | null): Deliverable[] {
  if (typeof window === "undefined") return [];
  const all = safeParse<Deliverable[]>(localStorage.getItem(DELIVERABLES_KEY), []);
  if (projectId === undefined) return all;
  return all.filter((d) => d.projectId === projectId);
}

export function saveDeliverable(
  input: Omit<Deliverable, "id" | "createdAt">,
): Deliverable {
  const item: Deliverable = {
    ...input,
    id: uid("del"),
    createdAt: new Date().toISOString(),
  };
  const all = listDeliverables();
  all.unshift(item);
  localStorage.setItem(DELIVERABLES_KEY, JSON.stringify(all));
  return item;
}

export function deleteDeliverable(id: string) {
  const all = listDeliverables().filter((d) => d.id !== id);
  localStorage.setItem(DELIVERABLES_KEY, JSON.stringify(all));
}
