import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { planIdFromStripePrice } from "@/lib/billing";

export const runtime = "nodejs";

async function syncSubscription(
  sub: Stripe.Subscription,
  userIdFallback?: string | null,
) {
  const admin = createAdminClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price?.id;
  const plan = planIdFromStripePrice(priceId);
  const userId =
    sub.metadata?.supabase_user_id ||
    userIdFallback ||
    (
      await admin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle()
    ).data?.id;

  if (!userId) {
    console.error("[stripe webhook] no user for customer", customerId);
    return;
  }

  const status = sub.status;
  const active = status === "active" || status === "trialing";

  // Stripe types vary by API version; read period end safely
  const periodEndUnix =
    (sub as { current_period_end?: number }).current_period_end ?? null;

  await admin
    .from("profiles")
    .update({
      plan: active ? plan : "free",
      plan_status: status,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan_period_end: periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Webhook no configurado" },
      { status: 503 },
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(
            sub,
            session.metadata?.supabase_user_id || null,
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const admin = createAdminClient();
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await admin
          .from("profiles")
          .update({
            plan: "free",
            plan_status: "canceled",
            stripe_subscription_id: null,
            plan_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
