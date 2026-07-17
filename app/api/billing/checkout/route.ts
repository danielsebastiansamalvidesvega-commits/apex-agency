import { NextResponse } from "next/server";
import { getAuthUser, createClient } from "@/lib/supabase/server";
import {
  createLemonCheckout,
  getLemonVariantId,
  isLemonConfigured,
} from "@/lib/lemon";
import {
  createPayPalSubscription,
  getPayPalLink,
  getPayPalPlanId,
  isPayPalConfigured,
} from "@/lib/paypal";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const planId = body.planId === "agency" ? "agency" : "pro";
  const origin = new URL(req.url).origin;
  const fullName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    null;

  const supabase = await createClient();
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  // 1) PayPal (recomendado desde Perú)
  if (isPayPalConfigured()) {
    try {
      // A) Link hospedado (más simple)
      const link = getPayPalLink(planId);
      if (link) {
        // Guardamos userId en cookie para mapear al volver
        const res = NextResponse.json({
          url: link,
          provider: "paypal_link",
        });
        return res;
      }

      // B) API de suscripciones
      const paypalPlanId = getPayPalPlanId(planId);
      if (!paypalPlanId) {
        return NextResponse.json(
          {
            error: `Falta PAYPAL_PLAN_${planId.toUpperCase()} o PAYPAL_LINK_${planId.toUpperCase()}.`,
          },
          { status: 500 },
        );
      }

      const sub = await createPayPalSubscription({
        planId: paypalPlanId,
        userId: user.id,
        email: user.email,
        returnUrl: `${origin}/api/billing/paypal/return?plan=${planId}`,
        cancelUrl: `${origin}/app/planes?canceled=1`,
      });

      // Guardamos subscription id temporal
      await supabase
        .from("profiles")
        .update({
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.json({
        url: sub.approveUrl,
        provider: "paypal",
        subscriptionId: sub.id,
      });
    } catch (e) {
      console.error("[paypal checkout]", e);
      return NextResponse.json(
        {
          error:
            e instanceof Error ? e.message : "Error al crear suscripción PayPal",
        },
        { status: 500 },
      );
    }
  }

  // 2) Lemon Squeezy (si está configurado)
  if (isLemonConfigured()) {
    try {
      const variantId = getLemonVariantId(planId);
      const storeId = process.env.LEMON_SQUEEZY_STORE_ID!.trim();
      if (!variantId) {
        return NextResponse.json(
          { error: `Falta variant de Lemon para ${planId}` },
          { status: 500 },
        );
      }
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
            e instanceof Error ? e.message : "No se pudo crear checkout Lemon",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    {
      error:
        "Pagos no configurados. Configura PayPal (recomendado desde Perú): PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET y PAYPAL_PLAN_PRO (o PAYPAL_LINK_PRO). Guía en supabase/PAYPAL_SETUP.md",
    },
    { status: 503 },
  );
}
