import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const toModule = searchParams.get("toModule");
  const projectId = searchParams.get("projectId");

  const supabase = await createClient();
  let q = supabase
    .from("handoffs")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (toModule) {
    q = q.or(`to_module.eq.${toModule},to_module.eq.all`);
  }
  if (projectId) q = q.eq("project_id", projectId);

  const { data, error } = await q;
  if (error) {
    // Table may not exist yet
    return NextResponse.json({ handoffs: [], warning: error.message });
  }
  return NextResponse.json({ handoffs: data || [] });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const from_module = String(body.fromModule || "consejo");
  const to_module = String(body.toModule || "all");
  const content = String(body.content || "").trim();
  const title = String(body.title || "").trim().slice(0, 120);
  const project_id = body.projectId || null;

  if (!content) {
    return NextResponse.json({ error: "Contenido vacío" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("handoffs")
    .insert({
      user_id: user.id,
      project_id,
      from_module,
      to_module,
      title: title || `Desde ${from_module}`,
      content: content.slice(0, 12000),
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message, offline: true }, { status: 500 });
  }

  // Also mirror a short memory note for coherence
  await supabase.from("memories").insert({
    user_id: user.id,
    project_id,
    kind: "handoff",
    content: `Decisión usada en ${to_module} (desde ${from_module}): ${title || content.slice(0, 100)}`,
    source: "handoff",
  });

  return NextResponse.json({ handoff: data });
}

export async function DELETE(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const toModule = searchParams.get("toModule");

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from("handoffs")
      .update({ active: false })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (toModule) {
    const { error } = await supabase
      .from("handoffs")
      .update({ active: false })
      .eq("user_id", user.id)
      .or(`to_module.eq.${toModule},to_module.eq.all`);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "id o toModule requerido" }, { status: 400 });
}
