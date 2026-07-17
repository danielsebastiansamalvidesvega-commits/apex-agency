# APEX — Planes de pago (Stripe)

## 1. SQL en Supabase

Ejecuta `billing.sql` en el SQL Editor.

## 2. Productos en Stripe

1. https://dashboard.stripe.com → Products
2. Crea **APEX Pro** — $19/mes (recurring)
3. Crea **APEX Agency** — $49/mes (recurring)
4. Copia los **Price ID** (`price_...`)

## 3. Variables en Vercel

| Variable | Valor |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` o `sk_test_...` |
| `STRIPE_PRICE_PRO` | `price_...` Pro |
| `STRIPE_PRICE_AGENCY` | `price_...` Agency |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (paso 4) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |

## 4. Webhook

Stripe → Developers → Webhooks → Add endpoint:

- URL: `https://apex-agency-nine.vercel.app/api/billing/webhook`
- Eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copia el signing secret a `STRIPE_WEBHOOK_SECRET`.

## 5. Customer Portal

Stripe → Settings → Billing → Customer portal → activar (cancelar, métodos de pago).

## 6. Redeploy

Tras guardar env vars, redeploy del proyecto.
