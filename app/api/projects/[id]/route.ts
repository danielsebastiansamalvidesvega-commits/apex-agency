import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { memoriesFromProject } from "@/lib/memory";
import type { Project } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const supabase = await createClient();

  const patch: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };
  for (const key of [
    "name",
    "industry",
    "offer",
    "audience",
    "goals",
    "stack",
    "budget",
    "notes",
  ] as const) {
    if (body[key] !== undefined) patch[key] = String(body[key]);
  }

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const project = data as Project;

  // Refresh project-sourced memories
  await supabase
    .from("memories")
    .delete()
    .eq("user_id", user.id)
    .eq("project_id", id)
    .eq("source", "project");

  const mems = memoriesFromProject(project).map((m) => ({
    user_id: user.id,
    project_id: project.id,
    kind: m.kind,
    content: m.content,
    source: "project",
  }));
  if (mems.length) await supabase.from("memories").insert(mems);

  return NextResponse.json({ project });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clear active if needed
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_project_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.active_project_id === id) {
    const { data: next } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase
      .from("profiles")
      .update({
        active_project_id: next?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
