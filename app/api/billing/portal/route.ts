import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getBillingProfile } from "@/lib/billing";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Pagos no configurados en el servidor." },
      { status: 503 },
    );
  }

  const stripe = getStripe()!;
  const supabase = await createClient();
  const billing = await getBillingProfile(supabase, user.id);

  if (!billing.stripe_customer_id) {
    return NextResponse.json(
      { error: "No tienes una suscripción de Stripe aún. Elige un plan primero." },
      { status: 400 },
    );
  }

  const origin = new URL(req.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${origin}/app/planes`,
  });

  return NextResponse.json({ url: session.url });
}
