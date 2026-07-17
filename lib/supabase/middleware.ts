import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase env, skip auth gate (local preview without config)
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isApp = path.startsWith("/app");
  const isAuthPage = path === "/login" || path === "/signup";
  // Webhook de Stripe no usa sesión de usuario
  if (path.startsWith("/api/billing/webhook")) {
    return supabaseResponse;
  }

  const isProtectedApi =
    path.startsWith("/api/chat") ||
    path.startsWith("/api/projects") ||
    path.startsWith("/api/deliverables") ||
    path.startsWith("/api/conversations") ||
    path.startsWith("/api/memories") ||
    path.startsWith("/api/profile") ||
    (path.startsWith("/api/billing") &&
      !path.startsWith("/api/billing/webhook"));

  if (!user && (isApp || isProtectedApi)) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
