export interface Project {
  id: string;
  user_id?: string;
  name: string;
  industry: string;
  offer: string;
  audience: string;
  goals: string;
  stack: string;
  budget: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  user_id?: string;
  project_id: string | null;
  module_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Memory {
  id: string;
  user_id?: string;
  project_id: string | null;
  kind: string;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id?: string;
  project_id: string | null;
  module_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  user_id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  active_project_id: string | null;
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

/** Map snake_case DB rows to the older camelCase shape used in UI helpers */
export function toUiProject(p: Project) {
  return {
    id: p.id,
    name: p.name,
    industry: p.industry,
    offer: p.offer,
    audience: p.audience,
    goals: p.goals,
    stack: p.stack,
    budget: p.budget,
    notes: p.notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}
