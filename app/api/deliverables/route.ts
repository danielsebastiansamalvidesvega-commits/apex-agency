import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const supabase = await createClient();
  let q = supabase
    .from("deliverables")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (projectId) q = q.eq("project_id", projectId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverables: data });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const supabase = await createClient();

  const row = {
    user_id: user.id,
    project_id: body.projectId || null,
    module_id: String(body.moduleId || "consejo"),
    title: String(body.title || "Deliverable").slice(0, 200),
    content: String(body.content || ""),
  };

  if (!row.content.trim()) {
    return NextResponse.json({ error: "Contenido vacío" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("deliverables")
    .insert(row)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Memory note
  await supabase.from("memories").insert({
    user_id: user.id,
    project_id: row.project_id,
    kind: "deliverable",
    content: `Deliverable guardado (${row.module_id}): ${row.title}`,
    source: "deliverable",
  });

  return NextResponse.json({ deliverable: data });
}

export async function DELETE(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("deliverables")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
