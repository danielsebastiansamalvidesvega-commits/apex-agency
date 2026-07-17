import type { ModuleId } from "./modules";

export type PlanId = "free" | "pro" | "agency";

export type PlanDef = {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  currency: string;
  popular?: boolean;
  messagesPerDay: number | null; // null = unlimited
  maxProjects: number | null;
  modules: ModuleId[] | "all";
  features: string[];
  /** Env var for Lemon Squeezy variant ID */
  lemonVariantEnv: string | null;
};

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "Gratis",
    tagline: "Para probar y validar ideas",
    priceMonthly: 0,
    currency: "USD",
    messagesPerDay: 20,
    maxProjects: 1,
    modules: [
      "dashboard",
      "consejo",
      "estrategia",
      "copy",
      "proyectos",
      "memoria",
      "planes",
    ],
    features: [
      "20 mensajes de IA al día",
      "Consejo, Estrategia y Copy",
      "1 proyecto activo",
      "Memoria básica",
      "Historial de chat",
    ],
    lemonVariantEnv: null,
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Para freelancers y negocios en crecimiento",
    priceMonthly: 19,
    currency: "USD",
    popular: true,
    messagesPerDay: 300,
    maxProjects: 10,
    modules: "all",
    features: [
      "300 mensajes de IA al día",
      "Todos los módulos (Ads, Tech, Código)",
      "Hasta 10 proyectos",
      "Memoria completa",
      "Guardar documentos ilimitados",
      "Soporte prioritario por email",
    ],
    lemonVariantEnv: "LEMON_SQUEEZY_VARIANT_PRO",
  },
  agency: {
    id: "agency",
    name: "Agency",
    tagline: "Para agencias y operadores a full",
    priceMonthly: 49,
    currency: "USD",
    messagesPerDay: null,
    maxProjects: null,
    modules: "all",
    features: [
      "Mensajes de IA ilimitados",
      "Todos los módulos sin restricciones",
      "Proyectos ilimitados",
      "Memoria y deliverables ilimitados",
      "Prioridad en el modelo / colas",
      "Ideal para multi-cliente",
    ],
    lemonVariantEnv: "LEMON_SQUEEZY_VARIANT_AGENCY",
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "agency"];

export function getPlan(id: string | null | undefined): PlanDef {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

export function planAllowsModule(plan: PlanDef, moduleId: ModuleId): boolean {
  if (plan.modules === "all") return true;
  return plan.modules.includes(moduleId);
}

export function formatPrice(plan: PlanDef): string {
  if (plan.priceMonthly === 0) return "Gratis";
  return `$${plan.priceMonthly}/mes`;
}

/** Effective plan: if subscription inactive, fall back to free */
export function resolveEffectivePlan(
  planId: string | null | undefined,
  status: string | null | undefined,
): PlanDef {
  const statusOk =
    !status ||
    status === "active" ||
    status === "trialing" ||
    status === "on_trial" ||
    status === "paid" ||
    status === "cancelled" || // Lemon: acceso hasta ends_at (plan ya resuelto en webhook)
    status === "free";
  if (!statusOk) return PLANS.free;
  return getPlan(planId);
}
