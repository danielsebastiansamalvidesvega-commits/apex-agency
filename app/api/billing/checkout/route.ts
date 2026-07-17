import { NextResponse } from "next/server";
import { getAuthUser, createClient } from "@/lib/supabase/server";
import {
  createLemonCheckout,
  getLemonVariantId,
  isLemonConfigured,
} from "@/lib/lemon";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isLemonConfigured()) {
    return NextResponse.json(
      {
        error:
          "Lemon Squeezy aún no está configurado. Añade LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_STORE_ID y LEMON_SQUEEZY_VARIANT_PRO en Vercel.",
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const planId = body.planId === "agency" ? "agency" : "pro";
  const variantId = getLemonVariantId(planId);
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!.trim();

  if (!variantId) {
    return NextResponse.json(
      {
        error: `Falta el Variant ID de Lemon para el plan ${planId} (LEMON_SQUEEZY_VARIANT_${planId.toUpperCase()}).`,
      },
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const fullName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    null;

  try {
    // Ensure profile exists
    const supabase = await createClient();
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fullName,
      },
      { onConflict: "id" },
    );

    const url = await createLemonCheckout({
      variantId,
      storeId,
      email: user.email,
      userId: user.id,
      userName: fullName,
      redirectUrl: `${origin}/app/planes?success=1`,
    });

    return NextResponse.json({ url, provider: "lemon" });
  } catch (e) {
    console.error("[lemon checkout]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "No se pudo crear el checkout",
      },
      { status: 500 },
    );
  }
}
