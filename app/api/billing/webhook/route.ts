import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  planIdFromLemonVariant,
  verifyLemonSignature,
} from "@/lib/lemon";
import {
  planIdFromPayPalPlan,
  verifyPayPalWebhook,
} from "@/lib/paypal";

export const runtime = "nodejs";

/** Detect provider from payload shape */
function detectProvider(raw: string, headers: Headers): "paypal" | "lemon" {
  if (headers.get("paypal-transmission-id") || headers.get("paypal-auth-algo")) {
    return "paypal";
  }
  try {
    const j = JSON.parse(raw);
    if (j?.meta?.event_name) return "lemon";
    if (j?.event_type?.startsWith("BILLING.") || j?.event_type?.startsWith("PAYMENT.")) {
      return "paypal";
    }
  } catch {
    /* ignore */
  }
  // default lemon if x-signature, else paypal
  if (headers.get("x-signature")) return "lemon";
  return "paypal";
}

async function applyPlan(opts: {
  userId: string | null;
  email?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  plan: "free" | "pro" | "agency";
  status: string;
  periodEnd?: string | null;
}) {
  const admin = createAdminClient();
  let userId = opts.userId;

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
  if (!userId && opts.subscriptionId) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", opts.subscriptionId)
      .maybeSingle();
    userId = data?.id ?? null;
  }

  if (!userId) {
    console.error("[billing webhook] no user", opts);
    return;
  }

  await admin
    .from("profiles")
    .update({
      plan: opts.plan,
      plan_status: opts.status,
      stripe_customer_id: opts.customerId
        ? String(opts.customerId)
        : undefined,
      stripe_subscription_id: opts.subscriptionId ?? undefined,
      plan_period_end: opts.periodEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

async function handleLemon(rawBody: string, headers: Headers) {
  const sig = headers.get("x-signature");
  const ok = await verifyLemonSignature(rawBody, sig);
  if (!ok && process.env.LEMON_SQUEEZY_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json({ error: "Firma Lemon inválida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name || "";
  const attrs = payload.data?.attributes || {};
  const userId = payload.meta?.custom_data?.user_id as string | undefined;
  const variantId = attrs.variant_id;
  const status = attrs.status || "active";
  const plan = planIdFromLemonVariant(variantId);

  if (eventName.startsWith("subscription_") || eventName === "order_created") {
    const expired =
      status === "expired" ||
      status === "unpaid" ||
      eventName === "subscription_expired";
    await applyPlan({
      userId: userId || null,
      email: attrs.user_email,
      customerId:
        attrs.customer_id != null ? String(attrs.customer_id) : null,
      subscriptionId: payload.data?.id ? String(payload.data.id) : null,
      plan: expired ? "free" : plan,
      status: expired ? "expired" : status,
      periodEnd: attrs.ends_at || attrs.renews_at || null,
    });
  }

  return NextResponse.json({ received: true, provider: "lemon" });
}

async function handlePayPal(rawBody: string, headers: Headers) {
  const ok = await verifyPayPalWebhook(headers, rawBody);
  if (!ok) {
    return NextResponse.json({ error: "Firma PayPal inválida" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const type = event.event_type as string;
  const resource = event.resource || {};

  // Subscription events
  if (type?.startsWith("BILLING.SUBSCRIPTION.")) {
    const status = (resource.status || "").toUpperCase();
    const userId = resource.custom_id as string | undefined;
    const planId = resource.plan_id as string | undefined;
    let plan = planIdFromPayPalPlan(planId);

    if (
      status === "CANCELLED" ||
      status === "EXPIRED" ||
      status === "SUSPENDED"
    ) {
      // Keep paid plan until cancelled fully — free on expired
      if (status === "EXPIRED") plan = "free";
      if (status === "CANCELLED") {
        // often still active until end — keep plan if we had one
        // for simplicity keep current plan from plan_id until expired
      }
    }

    if (status === "ACTIVE" || status === "APPROVED") {
      if (plan === "free") plan = "pro"; // fallback
    }

    if (
      status === "ACTIVE" ||
      status === "APPROVED" ||
      status === "CANCELLED" ||
      status === "EXPIRED" ||
      status === "SUSPENDED"
    ) {
      await applyPlan({
        userId: userId || null,
        email: resource.subscriber?.email_address,
        customerId: resource.subscriber?.payer_id || null,
        subscriptionId: resource.id || null,
        plan:
          status === "EXPIRED"
            ? "free"
            : plan === "free"
              ? "pro"
              : plan,
        status: status.toLowerCase(),
        periodEnd: resource.billing_info?.next_billing_time || null,
      });
    }
  }

  // Payment sale completed for subscription
  if (type === "PAYMENT.SALE.COMPLETED") {
    const custom = resource.custom as string | undefined;
    // sometimes custom_id is here
    if (custom) {
      await applyPlan({
        userId: custom,
        subscriptionId: resource.billing_agreement_id || resource.id,
        plan: "pro",
        status: "active",
        customerId: resource.payer?.payer_info?.payer_id || null,
      });
    }
  }

  return NextResponse.json({ received: true, provider: "paypal" });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const provider = detectProvider(rawBody, req.headers);

  try {
    if (provider === "lemon") {
      return await handleLemon(rawBody, req.headers);
    }
    return await handlePayPal(rawBody, req.headers);
  } catch (e) {
    console.error("[billing webhook]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
