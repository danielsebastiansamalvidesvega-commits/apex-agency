/**
 * Acciones Copy — prompts cortos (el ADN de red vive en el system prompt).
 * Evitar pegar reglas largas en cada mensaje: multiplica el costo de input.
 */

export type CopyAction = {
  id: string;
  label: string;
  shortLabel: string;
  prompt: string;
  /** Solo true en botones que valen el gasto de web/x search */
  liveResearch?: boolean;
};

/** Formato mínimo en system — no repetir en cada user message */
export const COPY_MODULE_SYSTEM = `COPY multi-red: piezas listo-para-pegar, 1 red por pieza (nunca copy genérico).
- FB: texto LARGO retención (~280–400 palabras; historias ~350–500). Prohibido 4–10 líneas. Hook→historia→valor→prueba→CTA+pregunta. Micro-párrafos. Creativo=imagen apoyo.
- IG: estético "producto terminado", mensaje directo, caption 40–120p o carrusel/reel pulido + brief visual.
- TikTok: reel (o carrusel), caption corto + guion 0–3s; no muro FB.
Cada pieza: Red objetivo | texto en bloque copy-paste | creativo 2–4 bullets | CTA. Respeta mix de estrategia si hay. Sin relleno.`;

export const COPY_ACTIONS: CopyAction[] = [
  {
    id: "mix-redes",
    label: "Pack 3 de cada red",
    shortLabel: "3×3",
    prompt: `Pack 9 piezas (listas para pegar), orden FB×3 → IG×3 → TikTok×3. Ángulos distintos. FB largos con estructura de retención. IG estéticos. TikTok reels/guion. Creativo breve por pieza. Alinea a estrategia/mix si existe. Sin investigación web.`,
  },
  {
    id: "mix-tendencias",
    label: "Pack + tendencias",
    shortLabel: "3×3+web",
    liveResearch: true,
    prompt: `Pack 9 piezas FB×3 IG×3 TikTok×3 listo-pegar. PRIMERO 1 sola web_search del nicho (no x_search salvo imprescindible). Sección breve SEÑALES (máx 6 bullets) y luego las 9 piezas nativas. FB largos retención. Sin relleno.`,
  },
  {
    id: "facebook",
    label: "Post Facebook",
    shortLabel: "Facebook",
    prompt: `1 post Facebook EXTENSO listo-pegar (~280–400 palabras; si historia ~350–500). Hook→desarrollo→ejemplo→valor→CTA+pregunta. Creativo imagen 1 línea. No caption corto.`,
  },
  {
    id: "instagram",
    label: "Post Instagram",
    shortLabel: "Instagram",
    prompt: `2 piezas Instagram listo-pegar (feed y/o carrusel/reel pulido). Estética producto terminado + mensaje directo. Caption nativo + creativo breve.`,
  },
  {
    id: "tiktok",
    label: "TikTok / Reel",
    shortLabel: "TikTok",
    prompt: `2 reels TikTok listo-pegar: caption corto + guion por segundos + creativo. Hooks distintos. Estilo UGC.`,
  },
  {
    id: "oferta",
    label: "Oferta 3 redes",
    shortLabel: "Oferta",
    prompt: `Misma oferta en 3 versiones: 1 FB largo conversión, 1 IG estético, 1 TikTok reel. Listo-pegar + creativo breve cada una.`,
  },
];

export function expandToFullPostsPrompt(sourceText: string): string {
  const clip = sourceText.trim().slice(0, 1200);
  return `Convierte esto en máx 3 piezas listo-pegar (1 FB largo, 1 IG, 1 TikTok). Sin ideas sueltas.

BASE:
"""
${clip}
"""`;
}
