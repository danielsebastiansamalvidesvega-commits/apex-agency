import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { memoriesFromProject } from "@/lib/memory";
import type { Project } from "@/lib/types";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data as Project[] });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const supabase = await createClient();

  const row = {
    user_id: user.id,
    name: String(body.name || "").trim(),
    industry: String(body.industry || ""),
    offer: String(body.offer || ""),
    audience: String(body.audience || ""),
    goals: String(body.goals || ""),
    stack: String(body.stack || ""),
    budget: String(body.budget || ""),
    notes: String(body.notes || ""),
  };

  if (!row.name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(row)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const project = data as Project;

  // Set as active project
  await supabase
    .from("profiles")
    .update({ active_project_id: project.id, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  // Seed memory from project
  const mems = memoriesFromProject(project).map((m) => ({
    user_id: user.id,
    project_id: project.id,
    kind: m.kind,
    content: m.content,
    source: "project",
  }));
  if (mems.length) {
    await supabase.from("memories").insert(mems);
  }

  return NextResponse.json({ project });
}
