# Configurar Continuar con Google (Supabase)

## 1. Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Crea o elige un proyecto.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `APEX`
   - Support email: el tuyo
   - Guarda (scopes básicos: email, profile, openid)
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `APEX Web`
   - **Authorized JavaScript origins:**
     - `https://ojdfopabpcshiiphuvml.supabase.co`
     - `https://apex-agency-nine.vercel.app`
     - `http://localhost:3000` (opcional, desarrollo)
   - **Authorized redirect URIs:**
     - `https://ojdfopabpcshiiphuvml.supabase.co/auth/v1/callback`
   - Crea y copia **Client ID** y **Client Secret**

> El redirect de Google debe ser el de **Supabase**, no el de Vercel.
> Vercel recibe al usuario después, vía `/auth/callback`.

## 2. Supabase

1. **Authentication → Providers → Google** → Enable
2. Pega **Client ID** y **Client Secret**
3. Guarda
4. **Authentication → URL Configuration**
   - Site URL: `https://apex-agency-nine.vercel.app`
   - Redirect URLs:
     - `https://apex-agency-nine.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

## 3. Probar

1. https://apex-agency-nine.vercel.app/login
2. **Continuar con Google**
3. Debe volver a `/app` con sesión activa

## Errores comunes

| Error | Causa |
|-------|--------|
| `redirect_uri_mismatch` | Falta el callback de Supabase en Google Cloud |
| Provider not enabled | Google OFF en Supabase |
| Vuelve a login con error | Redirect URL de Vercel no está en Supabase allow list |
