import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getPlan,
  planAllowsModule,
  resolveEffectivePlan,
  PLANS,
  type PlanDef,
  type PlanId,
} from "./plans";
import type { ModuleId } from "./modules";
import { isOwner } from "./owner";

export type BillingProfile = {
  plan: string;
  plan_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_period_end: string | null;
};

export async function getBillingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<BillingProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "plan, plan_status, stripe_customer_id, stripe_subscription_id, plan_period_end",
    )
    .eq("id", userId)
    .maybeSingle();

  // Columns missing until billing.sql is run → treat as free
  if (error) {
    return {
      plan: "free",
      plan_status: "active",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      plan_period_end: null,
    };
  }

  return {
    plan: data?.plan ?? "free",
    plan_status: data?.plan_status ?? "active",
    stripe_customer_id: data?.stripe_customer_id ?? null,
    stripe_subscription_id: data?.stripe_subscription_id ?? null,
    plan_period_end: data?.plan_period_end ?? null,
  };
}

export function effectivePlanFromProfile(profile: BillingProfile): PlanDef {
  return resolveEffectivePlan(profile.plan, profile.plan_status);
}

export async function getTodayMessageCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const day = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("usage_daily")
    .select("messages")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();
  if (error) return 0;
  return data?.messages ?? 0;
}

export async function incrementMessageUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const day = new Date().toISOString().slice(0, 10);
  const current = await getTodayMessageCount(supabase, userId);
  const next = current + 1;

  const { error } = await supabase.from("usage_daily").upsert(
    {
      user_id: userId,
      day,
      messages: next,
    },
    { onConflict: "user_id,day" },
  );

  if (error) {
    // Fallback: try update then insert
    await supabase.from("usage_daily").upsert({
      user_id: userId,
      day,
      messages: next,
    });
  }

  return next;
}

export type ChatGateResult =
  | { ok: true; plan: PlanDef; used: number; limit: number | null }
  | {
      ok: false;
      code: "MODULE_LOCKED" | "LIMIT_REACHED";
      plan: PlanDef;
      used: number;
      limit: number | null;
      message: string;
    };

export async function assertCanChat(
  supabase: SupabaseClient,
  userId: string,
  moduleId: ModuleId,
  userEmail?: string | null,
): Promise<ChatGateResult> {
  // Owner: full Agency access, no module/message gates
  if (isOwner(userEmail, userId)) {
    // Persist so UI/billing status also show Agency
    void supabase
      .from("profiles")
      .update({ plan: "agency", plan_status: "active" })
      .eq("id", userId)
      .neq("plan", "agency");

    const used = await getTodayMessageCount(supabase, userId);
    return {
      ok: true,
      plan: PLANS.agency,
      used,
      limit: null,
    };
  }

  const profile = await getBillingProfile(supabase, userId);
  const plan = effectivePlanFromProfile(profile);
  const used = await getTodayMessageCount(supabase, userId);

  if (!planAllowsModule(plan, moduleId)) {
    return {
      ok: false,
      code: "MODULE_LOCKED",
      plan,
      used,
      limit: plan.messagesPerDay,
      message: `El módulo no está incluido en el plan ${plan.name}. Mejora a Pro o Agency para desbloquearlo.`,
    };
  }

  if (plan.messagesPerDay !== null && used >= plan.messagesPerDay) {
    return {
      ok: false,
      code: "LIMIT_REACHED",
      plan,
      used,
      limit: plan.messagesPerDay,
      message: `Alcanzaste el límite de ${plan.messagesPerDay} mensajes de hoy en el plan ${plan.name}. Mejora tu plan para seguir.`,
    };
  }

  return {
    ok: true,
    plan,
    used,
    limit: plan.messagesPerDay,
  };
}

export function planIdFromStripePrice(priceId: string | undefined): PlanId {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_AGENCY) return "agency";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return "free";
}
