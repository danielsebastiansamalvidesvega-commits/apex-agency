import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import {
  getPayPalSubscription,
  planIdFromPayPalPlan,
} from "@/lib/paypal";

/**
 * PayPal redirige aquí tras aprobar la suscripción (?subscription_id=I-xxx&token=...)
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const subscriptionId =
    searchParams.get("subscription_id") || searchParams.get("token");
  const planHint = searchParams.get("plan"); // pro | agency

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?next=/app/planes`);
  }

  if (!subscriptionId) {
    return NextResponse.redirect(`${origin}/app/planes?canceled=1`);
  }

  try {
    const sub = await getPayPalSubscription(subscriptionId);
    const status = (sub.status || "").toUpperCase();
    const active =
      status === "ACTIVE" ||
      status === "APPROVED" ||
      status === "SUSPENDED"; // keep access until cancelled fully

    // Prefer custom_id (user) match
    if (sub.custom_id && sub.custom_id !== user.id) {
      console.warn("[paypal return] custom_id mismatch", sub.custom_id, user.id);
    }

    let plan =
      planIdFromPayPalPlan(sub.plan_id) ||
      (planHint === "agency" ? "agency" : planHint === "pro" ? "pro" : "free");

    if (!active && status !== "APPROVED") {
      // Still try to activate if just approved
      if (status !== "APPROVED") plan = "free";
    }

    // APPROVED needs capture? For subscriptions, approve often becomes ACTIVE via webhook.
    // We set plan if ACTIVE or APPROVED.
    if (status === "ACTIVE" || status === "APPROVED") {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({
          plan: plan === "free" ? planHint || "pro" : plan,
          plan_status: status.toLowerCase(),
          stripe_subscription_id: sub.id,
          stripe_customer_id:
            sub.subscriber?.payer_id || sub.subscriber?.email_address || null,
          plan_period_end: sub.billing_info?.next_billing_time || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    return NextResponse.redirect(`${origin}/app/planes?success=1`);
  } catch (e) {
    console.error("[paypal return]", e);
    return NextResponse.redirect(`${origin}/app/planes?error=paypal`);
  }
}
