import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  planIdFromLemonVariant,
  verifyLemonSignature,
} from "@/lib/lemon";

export const runtime = "nodejs";

type LemonMeta = {
  event_name?: string;
  custom_data?: { user_id?: string };
};

type LemonSubAttrs = {
  status?: string;
  customer_id?: number | string;
  variant_id?: number | string;
  product_id?: number | string;
  renews_at?: string | null;
  ends_at?: string | null;
  user_email?: string;
};

async function applySubscription(opts: {
  userId: string | null | undefined;
  customerId: string | null;
  subscriptionId: string | null;
  variantId: string | number | null | undefined;
  status: string;
  periodEnd: string | null;
  email?: string | null;
}) {
  const admin = createAdminClient();
  let userId = opts.userId || null;

  if (!userId && opts.customerId) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", String(opts.customerId))
      .maybeSingle();
    userId = data?.id ?? null;
  }

  if (!userId && opts.email) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("email", opts.email)
      .maybeSingle();
    userId = data?.id ?? null;
  }

  if (!userId) {
    console.error("[lemon webhook] no user_id for event", opts);
    return;
  }

  const active =
    opts.status === "active" ||
    opts.status === "on_trial" ||
    opts.status === "paid" ||
    opts.status === "cancelled"; // cancelled but still active until ends_at

  // If fully expired / unpaid / expired
  const expired =
    opts.status === "expired" ||
    opts.status === "unpaid" ||
    opts.status === "past_due";

  const plan = expired
    ? "free"
    : active
      ? planIdFromLemonVariant(opts.variantId)
      : "free";

  // cancelled with ends_at in future → keep plan until period ends
  let finalPlan = plan;
  if (opts.status === "cancelled" && opts.periodEnd) {
    const end = new Date(opts.periodEnd).getTime();
    if (end > Date.now()) {
      finalPlan = planIdFromLemonVariant(opts.variantId);
    } else {
      finalPlan = "free";
    }
  }

  await admin
    .from("profiles")
    .update({
      plan: finalPlan,
      plan_status: opts.status || "active",
      stripe_customer_id: opts.customerId
        ? String(opts.customerId)
        : undefined,
      stripe_subscription_id: opts.subscriptionId,
      plan_period_end: opts.periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  const ok = await verifyLemonSignature(rawBody, signature);
  if (!ok) {
    // Allow skipping verify only if secret not set (dev) — still log
    if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET?.trim()) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
    console.warn("[lemon webhook] sin LEMON_SQUEEZY_WEBHOOK_SECRET — no verificado");
  }

  let payload: {
    meta?: LemonMeta;
    data?: { id?: string; type?: string; attributes?: LemonSubAttrs };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name || "";
  const attrs = payload.data?.attributes || {};
  const userId = payload.meta?.custom_data?.user_id;
  const customerId =
    attrs.customer_id != null ? String(attrs.customer_id) : null;
  const subscriptionId = payload.data?.id ? String(payload.data.id) : null;
  const variantId = attrs.variant_id;
  const status = attrs.status || "active";
  const periodEnd = attrs.ends_at || attrs.renews_at || null;

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_unpaused":
      case "subscription_payment_success":
      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_paused":
      case "subscription_payment_failed":
      case "subscription_payment_recovered": {
        await applySubscription({
          userId,
          customerId,
          subscriptionId,
          variantId,
          status:
            eventName === "subscription_expired" ? "expired" : status,
          periodEnd,
          email: attrs.user_email,
        });
        break;
      }
      case "order_created": {
        // One-time orders — map variant if present
        if (variantId && userId) {
          const plan = planIdFromLemonVariant(variantId);
          if (plan !== "free") {
            await applySubscription({
              userId,
              customerId,
              subscriptionId: subscriptionId || `order_${payload.data?.id}`,
              variantId,
              status: "active",
              periodEnd: null,
              email: attrs.user_email,
            });
          }
        }
        break;
      }
      default:
        console.log("[lemon webhook] ignored event", eventName);
    }
  } catch (e) {
    console.error("[lemon webhook] handler", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
