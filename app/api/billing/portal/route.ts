import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getBillingProfile } from "@/lib/billing";
import { getCustomerPortalUrl, isLemonConfigured } from "@/lib/lemon";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isLemonConfigured()) {
    return NextResponse.json(
      { error: "Lemon Squeezy no está configurado." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const billing = await getBillingProfile(supabase, user.id);

  // Reutilizamos stripe_customer_id para guardar el customer id de Lemon
  if (!billing.stripe_customer_id) {
    return NextResponse.json(
      {
        error:
          "Aún no tienes un cliente de pago. Suscríbete a un plan primero.",
      },
      { status: 400 },
    );
  }

  const url = await getCustomerPortalUrl(billing.stripe_customer_id);
  if (!url) {
    return NextResponse.json(
      {
        error:
          "No se pudo abrir el portal. Revisa tu email de Lemon Squeezy o contacta soporte.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ url, provider: "lemon" });
}
