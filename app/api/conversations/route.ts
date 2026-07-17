import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";

/** Get or create the active conversation for module + optional project, with messages */
export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId") || "consejo";
  const projectId = searchParams.get("projectId");

  const supabase = await createClient();

  let q = supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (projectId) q = q.eq("project_id", projectId);
  else q = q.is("project_id", null);

  let { data: conversation } = await q.maybeSingle();

  if (!conversation) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        module_id: moduleId,
        project_id: projectId || null,
        title: `Chat · ${moduleId}`,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    conversation = created;
  }

  const { data: messages, error: msgErr } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ conversation, messages: messages || [] });
}

/** Append messages and optionally clear conversation */
export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const supabase = await createClient();

  if (body.action === "clear") {
    const conversationId = body.conversationId as string;
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId requerido" }, { status: 400 });
    }
    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  }

  const conversationId = body.conversationId as string;
  const messages = (body.messages || []) as {
    role: "user" | "assistant" | "system";
    content: string;
  }[];

  if (!conversationId || !messages.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Verify ownership
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });

  const rows = messages
    .filter((m) => m.content?.trim())
    .map((m) => ({
      conversation_id: conversationId,
      user_id: user.id,
      role: m.role,
      content: m.content,
    }));

  if (rows.length) {
    const { error } = await supabase.from("messages").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  // Auto-memory from user messages
  for (const m of messages) {
    if (m.role !== "user") continue;
    const { extractFactsFromUserMessage } = await import("@/lib/memory");
    const facts = extractFactsFromUserMessage(m.content);
    if (facts.length) {
      await supabase.from("memories").insert(
        facts.map((content) => ({
          user_id: user.id,
          project_id: body.projectId || null,
          kind: "fact",
          content,
          source: "chat",
        })),
      );
    }
  }

  return NextResponse.json({ ok: true });
}
