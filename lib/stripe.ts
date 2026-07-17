import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_PRO?.trim(),
  );
}

export function getPriceIdForPlan(planId: "pro" | "agency"): string | null {
  if (planId === "pro") return process.env.STRIPE_PRICE_PRO?.trim() || null;
  if (planId === "agency")
    return process.env.STRIPE_PRICE_AGENCY?.trim() || null;
  return null;
}
