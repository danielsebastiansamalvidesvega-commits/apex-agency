# APEX — Agency OS

**Director de Marketing Digital + CTO + Lead Full-Stack** con cuentas de usuario, memoria de proyectos e historial de chat.

## Qué incluye

- Login / registro profesional (Supabase Auth)
- Datos **privados por usuario** (RLS en Postgres)
- Proyectos, deliverables, conversaciones y **memoria a largo plazo**
- Módulos: Consejo, Estrategia, Copy, Ads, Tech, Code Lab
- IA con **Grok 4.5** (xAI / SpaceXAI)

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Supabase (Auth + Postgres + Row Level Security)
- Vercel AI SDK + `@ai-sdk/xai`

## Setup local

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta todo el archivo `supabase/schema.sql`.
3. En **Authentication → Providers**, deja Email habilitado.
   - Para desarrollo: desactiva “Confirm email” si quieres entrar al instante.
4. En **Authentication → URL configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. Copia las keys de **Project Settings → API**.

```bash
cd apex-agency
npm install
cp .env.example .env.local
```

Edita `.env.local`:

```env
XAI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) → **Crear cuenta**.

## Vercel

Añade las mismas variables en el proyecto:

| Variable | Entorno |
|----------|---------|
| `XAI_API_KEY` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview |

En Supabase, agrega redirect:

- `https://TU-DOMINIO.vercel.app/auth/callback`
- Site URL de producción

## Privacidad de datos

Cada fila lleva `user_id`. Las políticas RLS de Supabase impiden leer o escribir datos de otro usuario.

## Memoria

- Al crear/editar un **proyecto**, se generan hechos en `memories`.
- Al guardar un **deliverable**, se anota en memoria.
- En el chat, frases como “recuerda que…” o datos de presupuesto/marca se capturan.
- El módulo **Memoria** permite ver, añadir y borrar recuerdos manualmente.
- Cada request a `/api/chat` inyecta la memoria del usuario en el system prompt.

## Licencia

Privado / uso del equipo.
