/**
 * Lemon Squeezy helpers (API v1 — JSON:API).
 * Docs: https://docs.lemonsqueezy.com/api
 */

const API = "https://api.lemonsqueezy.com/v1";

export function isLemonConfigured(): boolean {
  return Boolean(
    process.env.LEMON_SQUEEZY_API_KEY?.trim() &&
      process.env.LEMON_SQUEEZY_STORE_ID?.trim() &&
      process.env.LEMON_SQUEEZY_VARIANT_PRO?.trim(),
  );
}

export function getLemonVariantId(planId: "pro" | "agency"): string | null {
  if (planId === "pro")
    return process.env.LEMON_SQUEEZY_VARIANT_PRO?.trim() || null;
  if (planId === "agency")
    return process.env.LEMON_SQUEEZY_VARIANT_AGENCY?.trim() || null;
  return null;
}

export function planIdFromLemonVariant(variantId: string | number | null | undefined): "free" | "pro" | "agency" {
  if (variantId == null) return "free";
  const id = String(variantId);
  if (id === process.env.LEMON_SQUEEZY_VARIANT_AGENCY?.trim()) return "agency";
  if (id === process.env.LEMON_SQUEEZY_VARIANT_PRO?.trim()) return "pro";
  return "free";
}

async function lemonFetch(path: string, init?: RequestInit) {
  const key = process.env.LEMON_SQUEEZY_API_KEY?.trim();
  if (!key) throw new Error("Falta LEMON_SQUEEZY_API_KEY");

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${key}`,
      ...(init?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.errors?.[0]?.detail ||
      json?.error ||
      `Lemon Squeezy error ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export async function createLemonCheckout(opts: {
  variantId: string;
  storeId: string;
  email?: string | null;
  userId: string;
  userName?: string | null;
  redirectUrl: string;
}): Promise<string> {
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: opts.email || undefined,
          name: opts.userName || undefined,
          custom: {
            user_id: opts.userId,
          },
        },
        checkout_options: {
          embed: false,
          media: true,
          logo: true,
        },
        product_options: {
          redirect_url: opts.redirectUrl,
          receipt_button_text: "Volver a tomatito",
          receipt_link_url: opts.redirectUrl,
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: String(opts.storeId) },
        },
        variant: {
          data: { type: "variants", id: String(opts.variantId) },
        },
      },
    },
  };

  const json = await lemonFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const url = json?.data?.attributes?.url as string | undefined;
  if (!url) throw new Error("Lemon no devolvió URL de checkout");
  return url;
}

export async function getCustomerPortalUrl(
  customerId: string,
): Promise<string | null> {
  try {
    const json = await lemonFetch(`/customers/${customerId}`);
    return (
      (json?.data?.attributes?.urls?.customer_portal as string) ||
      null
    );
  } catch {
    return null;
  }
}

/** Verify X-Signature: HMAC-SHA256 hex of raw body with webhook secret */
export async function verifyLemonSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;

  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature),
    );
  } catch {
    return digest === signature;
  }
}
