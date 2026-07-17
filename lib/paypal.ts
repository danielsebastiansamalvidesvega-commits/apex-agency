/**
 * PayPal Billing Subscriptions
 * Sandbox: https://api-m.sandbox.paypal.com
 * Live:    https://api-m.paypal.com
 */

function paypalBase(): string {
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim() &&
      (process.env.PAYPAL_PLAN_PRO?.trim() ||
        process.env.PAYPAL_LINK_PRO?.trim()),
  );
}

/** Static hosted subscribe links (no API plans needed) */
export function getPayPalLink(planId: "pro" | "agency"): string | null {
  if (planId === "pro") return process.env.PAYPAL_LINK_PRO?.trim() || null;
  return process.env.PAYPAL_LINK_AGENCY?.trim() || null;
}

export function getPayPalPlanId(planId: "pro" | "agency"): string | null {
  if (planId === "pro") return process.env.PAYPAL_PLAN_PRO?.trim() || null;
  return process.env.PAYPAL_PLAN_AGENCY?.trim() || null;
}

export function planIdFromPayPalPlan(
  planId: string | null | undefined,
): "free" | "pro" | "agency" {
  if (!planId) return "free";
  if (planId === process.env.PAYPAL_PLAN_AGENCY?.trim()) return "agency";
  if (planId === process.env.PAYPAL_PLAN_PRO?.trim()) return "pro";
  return "free";
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) throw new Error("Faltan PAYPAL_CLIENT_ID / SECRET");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || "No se pudo autenticar con PayPal");
  }
  return json.access_token as string;
}

export async function createPayPalSubscription(opts: {
  planId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
  email?: string | null;
}): Promise<{ id: string; approveUrl: string }> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${paypalBase()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: opts.planId,
      custom_id: opts.userId,
      subscriber: opts.email
        ? { email_address: opts.email }
        : undefined,
      application_context: {
        brand_name: "APEX Agency OS",
        locale: "es-PE",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    const detail =
      json?.message ||
      json?.details?.[0]?.description ||
      JSON.stringify(json).slice(0, 200);
    throw new Error(detail || `PayPal error ${res.status}`);
  }

  const approve = (json.links as { rel: string; href: string }[] | undefined)?.find(
    (l) => l.rel === "approve",
  )?.href;

  if (!approve) throw new Error("PayPal no devolvió link de aprobación");

  return { id: json.id as string, approveUrl: approve };
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getPayPalAccessToken();
  const res = await fetch(
    `${paypalBase()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Error al leer suscripción");
  return json as {
    id: string;
    status: string;
    custom_id?: string;
    plan_id?: string;
    billing_info?: { next_billing_time?: string };
    subscriber?: { email_address?: string; payer_id?: string };
  };
}

/** Verify PayPal webhook signature (optional but recommended) */
export async function verifyPayPalWebhook(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) {
    // Sin webhook id: aceptamos el evento (configura PAYPAL_WEBHOOK_ID en producción)
    return true;
  }

  const token = await getPayPalAccessToken();
  const res = await fetch(
    `${paypalBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );
  const json = await res.json();
  return json.verification_status === "SUCCESS";
}
