import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getPriceIdForPlan, getStripe, isStripeConfigured } from "@/lib/stripe";
import { getBillingProfile } from "@/lib/billing";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Pagos aún no configurados. Añade las claves de Stripe en Vercel (STRIPE_SECRET_KEY, STRIPE_PRICE_PRO).",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe()!;
  const body = await req.json().catch(() => ({}));
  const planId = body.planId === "agency" ? "agency" : "pro";
  const priceId = getPriceIdForPlan(planId);

  if (!priceId) {
    return NextResponse.json(
      { error: `Falta el Price ID de Stripe para el plan ${planId}.` },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const billing = await getBillingProfile(supabase, user.id);
  const origin = new URL(req.url).origin;

  let customerId = billing.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { supabase_user_id: user.id },
      name:
        (user.user_metadata?.full_name as string) ||
        user.email?.split("@")[0] ||
        undefined,
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app/planes?success=1`,
    cancel_url: `${origin}/app/planes?canceled=1`,
    allow_promotion_codes: true,
    metadata: {
      supabase_user_id: user.id,
      plan_id: planId,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
