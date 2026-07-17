import type { Project } from "./types";

/** Build memory rows from a project profile so APEX "remembers" the brand. */
export function memoriesFromProject(project: Project): { kind: string; content: string }[] {
  const items: { kind: string; content: string }[] = [];
  items.push({
    kind: "project",
    content: `Proyecto activo/conocido: ${project.name}`,
  });
  if (project.industry)
    items.push({ kind: "fact", content: `${project.name} — industria: ${project.industry}` });
  if (project.offer)
    items.push({ kind: "fact", content: `${project.name} — oferta: ${project.offer}` });
  if (project.audience)
    items.push({ kind: "fact", content: `${project.name} — audiencia/ICP: ${project.audience}` });
  if (project.goals)
    items.push({ kind: "fact", content: `${project.name} — objetivos: ${project.goals}` });
  if (project.stack)
    items.push({ kind: "fact", content: `${project.name} — stack: ${project.stack}` });
  if (project.budget)
    items.push({ kind: "fact", content: `${project.name} — presupuesto: ${project.budget}` });
  if (project.notes)
    items.push({ kind: "note", content: `${project.name} — notas: ${project.notes}` });
  return items;
}

/** Extract durable facts from a user message (simple heuristics). */
export function extractFactsFromUserMessage(text: string): string[] {
  const facts: string[] = [];
  const t = text.trim();
  if (t.length < 20 || t.length > 600) return facts;

  const patterns = [
    /(?:me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñÁÉÍÓÚÑ\s]{1,40})/i,
    /(?:mi (?:empresa|marca|negocio|proyecto) (?:se llama|es))\s+([^\n.]{2,60})/i,
    /(?:presupuesto|budget)\s*(?:de|es|:)?\s*([^\n.]{2,40})/i,
    /(?:vendo|vendemos|ofrezco|ofrecemos)\s+([^\n.]{5,80})/i,
    /(?:mi stack|usamos|stack)\s*(?:es|:)?\s*([^\n.]{3,60})/i,
  ];

  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[0]) facts.push(m[0].trim());
  }

  // Explicit "recuerda que..."
  const remember = t.match(/recuerda(?:\s+que)?\s+(.+)/i);
  if (remember?.[1]) facts.push(remember[1].trim().slice(0, 240));

  return facts.slice(0, 3);
}
