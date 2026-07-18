import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import {
  effectivePlanFromProfile,
  getBillingProfile,
  getTodayMessageCount,
} from "@/lib/billing";
import { isLemonConfigured } from "@/lib/lemon";
import { isOwner } from "@/lib/owner";
import { isPayPalConfigured } from "@/lib/paypal";
import { PLAN_ORDER, PLANS } from "@/lib/plans";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabase = await createClient();
  const profile = await getBillingProfile(supabase, user.id);
  let plan = effectivePlanFromProfile(profile);
  const used = await getTodayMessageCount(supabase, user.id);

  if (isOwner(user.email, user.id)) {
    plan = PLANS.agency;
    // Keep DB in sync so you stay Agency even if env is missing later
    await supabase
      .from("profiles")
      .update({ plan: "agency", plan_status: "active" })
      .eq("id", user.id);
  }

  const paypal = isPayPalConfigured();
  const lemon = isLemonConfigured();
  const paymentsConfigured = paypal || lemon;

  return NextResponse.json({
    plan: plan.id,
    planName: plan.name,
    planStatus: isOwner(user.email, user.id) ? "active" : profile.plan_status,
    periodEnd: profile.plan_period_end,
    messagesUsedToday: used,
    messagesLimit: plan.messagesPerDay,
    maxProjects: plan.maxProjects,
    modules: plan.modules,
    isOwner: isOwner(user.email, user.id),
    paymentsConfigured,
    stripeConfigured: paymentsConfigured,
    provider: paypal ? "paypal" : lemon ? "lemon_squeezy" : "none",
    hasCustomer: Boolean(profile.stripe_customer_id || profile.stripe_subscription_id),
    plans: PLAN_ORDER.map((id) => PLANS[id]),
  });
}
