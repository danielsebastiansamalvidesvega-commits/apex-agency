import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError =
    searchParams.get("error_description") || searchParams.get("error");

  const cookieStore = await cookies();
  const nextCookie = cookieStore.get("apex_auth_next")?.value;
  let next = "/app";
  if (nextCookie) {
    try {
      const decoded = decodeURIComponent(nextCookie);
      if (decoded.startsWith("/")) next = decoded;
    } catch {
      next = "/app";
    }
  }
  const nextFromQuery = searchParams.get("next");
  if (nextFromQuery?.startsWith("/")) next = nextFromQuery;

  if (oauthError) {
    const res = NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`,
    );
    res.cookies.set("apex_auth_next", "", { path: "/", maxAge: 0 });
    return res;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const fullName =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          user.email?.split("@")[0] ||
          "Usuario";

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }

      const res = NextResponse.redirect(`${origin}${next}`);
      res.cookies.set("apex_auth_next", "", { path: "/", maxAge: 0 });
      return res;
    }

    const res = NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
    res.cookies.set("apex_auth_next", "", { path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
