import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getBillingProfile } from "@/lib/billing";
import { getCustomerPortalUrl, isLemonConfigured } from "@/lib/lemon";
import { isPayPalConfigured } from "@/lib/paypal";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Lemon portal si aplica
  if (isLemonConfigured()) {
    const supabase = await createClient();
    const billing = await getBillingProfile(supabase, user.id);
    if (billing.stripe_customer_id) {
      const url = await getCustomerPortalUrl(billing.stripe_customer_id);
      if (url) return NextResponse.json({ url, provider: "lemon" });
    }
  }

  // PayPal: portal genérico de suscripciones del usuario
  if (isPayPalConfigured()) {
    const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
    const url =
      mode === "live"
        ? "https://www.paypal.com/myaccount/autopay/"
        : "https://www.sandbox.paypal.com/myaccount/autopay/";
    return NextResponse.json({ url, provider: "paypal" });
  }

  return NextResponse.json(
    { error: "No hay portal de pagos configurado." },
    { status: 503 },
  );
}
