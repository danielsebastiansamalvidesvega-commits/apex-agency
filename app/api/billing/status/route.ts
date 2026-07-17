import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import {
  effectivePlanFromProfile,
  getBillingProfile,
  getTodayMessageCount,
} from "@/lib/billing";
import { isLemonConfigured } from "@/lib/lemon";
import { isPayPalConfigured } from "@/lib/paypal";
import { PLAN_ORDER, PLANS } from "@/lib/plans";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabase = await createClient();
  const profile = await getBillingProfile(supabase, user.id);
  const plan = effectivePlanFromProfile(profile);
  const used = await getTodayMessageCount(supabase, user.id);

  const paypal = isPayPalConfigured();
  const lemon = isLemonConfigured();
  const paymentsConfigured = paypal || lemon;

  return NextResponse.json({
    plan: plan.id,
    planName: plan.name,
    planStatus: profile.plan_status,
    periodEnd: profile.plan_period_end,
    messagesUsedToday: used,
    messagesLimit: plan.messagesPerDay,
    maxProjects: plan.maxProjects,
    modules: plan.modules,
    paymentsConfigured,
    stripeConfigured: paymentsConfigured,
    provider: paypal ? "paypal" : lemon ? "lemon_squeezy" : "none",
    hasCustomer: Boolean(profile.stripe_customer_id || profile.stripe_subscription_id),
    plans: PLAN_ORDER.map((id) => PLANS[id]),
  });
}
