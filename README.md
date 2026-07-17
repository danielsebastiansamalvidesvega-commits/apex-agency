# APEX — Agency OS

**Director Ejecutivo de Marketing Digital + CTO + Lead Full-Stack** en un solo sistema web.

APEX actúa como una agencia completa y equipo técnico senior (15+ años de experiencia operativa), superior a herramientas tipo COPA IA / Coopa / Kopa: no solo creativos o copy — estrategia, media, arquitectura y código alineados.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **SpaceXAI / xAI** vía Vercel AI SDK (`ai` + `@ai-sdk/xai`)
- Modelo por defecto: **grok-4.5**
- Proyectos y deliverables en **localStorage** (MVP sin auth)

## Módulos

| Módulo | Rol | Qué hace |
|--------|-----|----------|
| Command Center | Agencia | HQ y acceso rápido |
| Consejo Senior | CMO+CTO+Lead | Decisiones holísticas |
| Estrategia & GTM | CMO | Posicionamiento, ICP, planes |
| Copy & Creativos | CMO | Scripts, emails, landing copy |
| Media & Ads | CMO | Campañas, testing, scaling |
| Arquitectura & CTO | CTO | Stack, data, roadmap |
| Code Lab | Lead Dev | Código production-ready |
| Proyectos | Agencia | Contexto de marca + deliverables |

## Setup

```bash
cd apex-agency
npm install
cp .env.example .env.local
# Edita .env.local y pega tu XAI_API_KEY de https://console.x.ai
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Uso rápido

1. Entra a **Proyectos** y crea tu marca/cliente (oferta, ICP, stack, presupuesto).
2. Activa el proyecto.
3. Abre **Consejo Senior** o cualquier módulo especializado.
4. Guarda respuestas clave con **Guardar deliverable**.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `XAI_API_KEY` | API key de xAI (solo servidor, nunca en el cliente) |

## Roadmap sugerido

- Auth + multi-tenant (Supabase/Clerk)
- Persistencia de chat y proyectos en DB
- Generación de imágenes (Grok Imagine) para creativos
- Integraciones Meta/Google Ads y Shopify
- Export PDF de deliverables y media plans

## Licencia

Privado / uso del equipo. Ajusta según tu necesidad.
