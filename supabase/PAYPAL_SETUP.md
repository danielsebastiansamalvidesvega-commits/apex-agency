# APEX + PayPal (recomendado desde Perú)

Lemon no te deja registrarte → usa **PayPal**. Funciona internacionalmente y se puede abrir desde Perú.

## Opción A — Más simple: links de suscripción

1. Entra a https://www.paypal.com (cuenta **Business**).
2. Crea **2 planes de suscripción**:
   - APEX Pro — $19 USD / mes  
   - APEX Agency — $49 USD / mes  
3. Copia el **link de suscripción** de cada uno.
4. En Vercel añade:

```
PAYPAL_CLIENT_ID=dummy
PAYPAL_CLIENT_SECRET=dummy
PAYPAL_LINK_PRO=https://www.paypal.com/...
PAYPAL_LINK_AGENCY=https://www.paypal.com/...
```

> Si solo usas links, igual pon CLIENT_ID/SECRET con valores de tu app PayPal  
> (o cualquier placeholder no vacío si solo usas links — el código requiere que existan;  
> mejor crea la app en developer.paypal.com).

**Limitación de links:** el plan se activa mejor con la **Opción B** (API + webhook).  
Con links puedes activar el plan a mano en Supabase tras el pago, o usar la API.

---

## Opción B — Profesional: API de suscripciones (recomendado)

### 1. App en PayPal Developer

1. https://developer.paypal.com → **Apps & Credentials**
2. Crea una app (Sandbox para pruebas)
3. Copia **Client ID** y **Secret**

### 2. Crear producto y planes (Sandbox)

En el dashboard de suscripciones / REST API, crea:

- Product: `APEX`
- Plan Pro: `$19/month` → copia `P-...` → `PAYPAL_PLAN_PRO`
- Plan Agency: `$49/month` → `PAYPAL_PLAN_AGENCY`

O usa la API de Billing Plans en el panel de desarrolladores.

### 3. Webhook

Developers → Webhooks → Add:

- URL: `https://apex-agency-nine.vercel.app/api/billing/webhook`
- Eventos:
  - `BILLING.SUBSCRIPTION.ACTIVATED`
  - `BILLING.SUBSCRIPTION.UPDATED`
  - `BILLING.SUBSCRIPTION.CANCELLED`
  - `BILLING.SUBSCRIPTION.EXPIRED`
  - `BILLING.SUBSCRIPTION.SUSPENDED`
  - `PAYMENT.SALE.COMPLETED`

Copia el **Webhook ID** → `PAYPAL_WEBHOOK_ID`

### 4. Variables en Vercel

| Variable | Ejemplo |
|----------|---------|
| `PAYPAL_CLIENT_ID` | `Ae...` |
| `PAYPAL_CLIENT_SECRET` | `EL...` |
| `PAYPAL_MODE` | `sandbox` o `live` |
| `PAYPAL_PLAN_PRO` | `P-xxx` |
| `PAYPAL_PLAN_AGENCY` | `P-yyy` |
| `PAYPAL_WEBHOOK_ID` | `WH-xxx` (recomendado) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role de Supabase |

### 5. SQL

Ejecuta `billing.sql` en Supabase si no lo hiciste.

### 6. Redeploy y prueba

1. `/app/planes` → Mejorar a Pro  
2. Login Sandbox de PayPal  
3. Vuelve a APEX → plan Pro  

Tarjetas de prueba: usa cuentas **Sandbox** de buyer en developer.paypal.com.

---

## Flujo en APEX

1. Checkout crea suscripción PayPal  
2. Usuario aprueba en PayPal  
3. Return URL `/api/billing/paypal/return` activa el plan  
4. Webhook mantiene el plan sincronizado (cancelaciones, etc.)
