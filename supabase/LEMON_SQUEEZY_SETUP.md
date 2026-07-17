# APEX + Lemon Squeezy

## 1. Cuenta Lemon Squeezy

1. Regístrate en https://lemonsqueezy.com  
2. Crea una **Store**  
3. Settings → Stores → copia el **Store ID** (número)

## 2. Productos y variantes

Crea 2 productos de **suscripción** (Subscription):

| Producto | Precio | Env |
|----------|--------|-----|
| APEX Pro | $19 / month | `LEMON_SQUEEZY_VARIANT_PRO` |
| APEX Agency | $49 / month | `LEMON_SQUEEZY_VARIANT_AGENCY` |

En cada producto → variante → copia el **Variant ID** (número).

## 3. API Key

Settings → API → Create API key  
Copia: `LEMON_SQUEEZY_API_KEY`

## 4. Webhook

Settings → Webhooks → Create:

- **URL:** `https://apex-agency-nine.vercel.app/api/billing/webhook`
- **Secret:** genera uno y guárdalo como `LEMON_SQUEEZY_WEBHOOK_SECRET`
- Eventos recomendados:
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_resumed`
  - `subscription_expired`
  - `subscription_paused`
  - `subscription_unpaused`
  - `subscription_payment_success`
  - `subscription_payment_failed`
  - `subscription_payment_recovered`
  - `order_created` (opcional)

## 5. Custom data

El checkout envía `custom.user_id` = UUID de Supabase.  
El webhook lo usa para activar el plan correcto.

## 6. Variables en Vercel

| Name | Ejemplo |
|------|---------|
| `LEMON_SQUEEZY_API_KEY` | `eyJ...` o key de LS |
| `LEMON_SQUEEZY_STORE_ID` | `12345` |
| `LEMON_SQUEEZY_VARIANT_PRO` | `67890` |
| `LEMON_SQUEEZY_VARIANT_AGENCY` | `67891` |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | tu secret del webhook |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (Supabase) |

También ejecuta `billing.sql` si aún no lo hiciste.

## 7. Redeploy

Tras guardar variables → Redeploy en Vercel.

## 8. Probar

1. Entra a `/app/planes`  
2. Mejorar a Pro  
3. Paga con tarjeta de test de Lemon  
4. Vuelve a APEX → plan debe ser Pro  

## Test mode

Lemon tiene modo test en el dashboard. Úsalo hasta validar el flujo.
