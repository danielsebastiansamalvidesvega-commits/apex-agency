import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = await createClient();
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name:
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Usuario",
      })
      .select("*")
      .single();
    profile = created;
  }

  let activeProject = null;
  if (profile?.active_project_id) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", profile.active_project_id)
      .eq("user_id", user.id)
      .maybeSingle();
    activeProject = data;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    activeProject,
  });
}

export async function PATCH(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.full_name !== undefined) patch.full_name = String(body.full_name);
  if (body.active_project_id !== undefined) {
    patch.active_project_id = body.active_project_id || null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
