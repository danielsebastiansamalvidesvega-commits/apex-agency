/**
 * Acciones rápidas de Copy & textos.
 * Cada pieza se etiqueta y escribe para UNA red, con su "ADN" nativo:
 * - Facebook → post de texto largo / comunidad
 * - TikTok → reels (a veces carrusel deslizable)
 * - Instagram → producto terminado, estético, mensaje directo
 */

export type CopyAction = {
  id: string;
  label: string;
  shortLabel: string;
  /** Prompt completo que se envía al chat */
  prompt: string;
};

/** ADN de cada red — la IA debe respetarlo al 100% */
export const PLATFORM_DNA = `
ADN POR RED (OBLIGATORIO — no mezcles estilos entre redes):

### FACEBOOK
- Es un sitio de POSTS CON TEXTO LARGO: narrativa, valor, historia, opinión, prueba social.
- Longitud típica: 150–350 palabras (puede ir más si engancha).
- Párrafos cortos, saltos de línea, a veces pregunta al final para comentarios.
- Creativo: 1 imagen de apoyo o ninguna (el texto manda). Rara vez "reel primero".
- Tono: conversacional, de comunidad / grupo; menos "estética de catálogo".
- CTA: comentar, compartir, link en primer comentario o "escríbeme".
- NO copies un caption corto de IG y lo pongas en FB.

### TIKTOK
- Prioridad: REELS / video vertical (15–45s ideal). A veces carrusel de imágenes deslizables (photo mode).
- Caption: corto o medio (1–5 líneas + CTA). El peso está en el GUION visual y audio.
- Hook brutal 0–3s (visual + texto en pantalla). Ritmo rápido, cortes, nativo "UGC", no comercial rígido.
- Si carrusel TikTok: 5–8 slides con texto grande legible, swipe bait al final.
- Tono: directo, tendencia, "te lo digo claro", a veces humor o polarización sana.
- NO escribas un monólogo de 300 palabras de Facebook para TikTok.

### INSTAGRAM
- Prioridad: "producto terminado" — estética cuidada, feed coherente, mensaje DIRECTO y claro.
- Feed: caption medio (40–120 palabras), primera línea potente (preview del feed).
- Carrusel IG: 6–10 slides muy diseñados (como piezas de marca), tipografía limpia, visual premium.
- Reels IG: más pulidos que TikTok (lighting, composición, branding sutil), igual de enganche en 0–3s.
- Mensaje: beneficio/resultado en una frase clara; menos wall-of-text, más deseo + prueba + CTA.
- Creativo: se ve "listo para publicar" (Canva pro, foto de producto, lifestyle editado).
- NO uses el tono crudo de TikTok ni el ensayo largo de Facebook en el feed de IG.
`.trim();

const POST_FORMAT_RULES = `
${PLATFORM_DNA}

FORMATO OBLIGATORIO por cada pieza (no listas de ideas sueltas):

### [RED] · PIEZA [n] — [ángulo / pilar del mix]
**Red objetivo:** Facebook | Instagram | TikTok  ← UNA sola, sin ambigüedad
**Formato nativo de esa red:**
- Si Facebook → Post texto largo (+ imagen de apoyo opcional)
- Si TikTok → Reel (o Carrusel deslizable si justifica mejor el mensaje)
- Si Instagram → Feed estético | Carrusel premium | Reel pulido
**Por qué este formato en ESTA red:** 1 frase (encaja con el ADN de arriba)
**Objetivo de algoritmo en esa red:** [comentarios · shares · guardados · watch time · perfil · link]
**Gancho:** primera línea (FB/IG) o 0–3s en pantalla (TikTok/Reel)

#### TEXTO / CAPTION LISTO PARA COPIAR
\`\`\`
[Copy FINAL adaptado 100% a la red elegida.
- Facebook: texto largo completo, listo para pegar en el post.
- Instagram: caption nativo IG (línea 1 = preview).
- TikTok: caption corto + (si es reel) NO sustituye el guion visual.
]
\`\`\`

**CTA nativo de la red:** [comentar / compartir / guardar / seguir / link / DM]
**Hashtags:** solo si la red lo premia en el nicho (IG/TikTok: 3–8; FB: a menudo 0–3)

#### CREATIVO (ajustado a la red)
**Facebook**
- 1 imagen de apoyo o gráfica simple (qué debe verse). El post vive del texto.

**TikTok**
- Si REEL: guion por segundos (0–3 / 3–8 / 8–20 / cierre), texto en pantalla, cortes, si lo filmas tú (UGC) o editas plantilla, mood de audio genérico.
- Si CARRUSEL deslizable: texto exacto de cada slide + “swipe” final.

**Instagram**
- Moodboard breve (colores, estilo, “producto terminado”).
- Feed: descripción de la foto/diseño final.
- Carrusel: texto EXACTO de cada slide (diseño premium).
- Reel: guion más estético/branded que TikTok, igual de hook.

**Por qué engancha en ESA red:** 2–3 bullets (según su algoritmo y cultura).
**Cuándo publicar:** franja sugerida (LatAm si no hay datos).

REGLAS DE CALIDAD:
- Cada pieza declara UNA red y se escribe SOLO para esa red (longitud, tono, creativo).
- Prohibido un único copy genérico "para todas las redes".
- NUNCA solo ideas: siempre texto/caption listo para copiar + creativo.
- Si hay mix de estrategia, respétalo al repartir piezas.
- Senior marketing digital + e-commerce. Español LatAm. Sin relleno.
`.trim();

export const COPY_ACTIONS: CopyAction[] = [
  {
    id: "mix-redes",
    label: "Pack 3 redes",
    shortLabel: "3 redes",
    prompt: `Genera un PACK multi-red: exactamente 3 piezas COMPLETAS (no ideas), una por red, mismo ángulo de negocio pero ADAPTADAS al ADN de cada plataforma:

1) FACEBOOK — post de texto largo (protagonista el copy escrito)
2) INSTAGRAM — pieza estética "producto terminado" + mensaje directo (feed o carrusel premium)
3) TIKTOK — reel (o carrusel deslizable si es mejor) con guion visual

${POST_FORMAT_RULES}

Alineado a estrategia/mix/avatar/oferta activos. Misma promesa de fondo, ejecución nativa por red.`,
  },
  {
    id: "facebook",
    label: "Post Facebook",
    shortLabel: "Facebook",
    prompt: `Genera 2 POSTS COMPLETOS solo para FACEBOOK (texto largo, estilo comunidad).

${POST_FORMAT_RULES}

Obligatorio: Red objetivo = Facebook en ambas. Texto largo listo para copiar; creativo = imagen de apoyo (no conviertas esto en reel de TikTok).`,
  },
  {
    id: "instagram",
    label: "Post Instagram",
    shortLabel: "Instagram",
    prompt: `Genera 2 PIEZAS COMPLETAS solo para INSTAGRAM: estética de "producto terminado", mensaje directo y claro.

${POST_FORMAT_RULES}

Obligatorio: Red objetivo = Instagram. Puede ser 1 feed + 1 carrusel premium, o 1 feed + 1 reel pulido. Captions nativos IG + brief de diseño/foto final. Nada de muro de texto tipo Facebook ni crudo tipo TikTok.`,
  },
  {
    id: "tiktok",
    label: "TikTok / Reel",
    shortLabel: "TikTok",
    prompt: `Genera 2 PIEZAS COMPLETAS solo para TIKTOK: prioridad reels; si una funciona mejor como carrusel deslizable, indícalo.

${POST_FORMAT_RULES}

Obligatorio: Red objetivo = TikTok. Caption corto + guion visual por segundos (o slides). Estilo nativo UGC/ritmo rápido. No uses copy largo de Facebook ni estética de catálogo IG sin adaptación.`,
  },
  {
    id: "oferta",
    label: "Oferta 3 redes",
    shortLabel: "Oferta",
    prompt: `Genera 1 OFERTA / e-commerce en 3 versiones nativas (misma oferta, distinta ejecución):

1) Facebook — post texto largo de conversión + prueba social
2) Instagram — feed o carrusel "producto terminado" con mensaje directo y CTA
3) TikTok — reel demo/unboxing/resultado (guion + caption corto)

${POST_FORMAT_RULES}

Dolor → promesa → prueba → oferta → CTA. Si hay precio en memoria/proyecto, úsalo; si no, SUPUESTOS marcados.`,
  },
];

/** Convierte una respuesta previa (ideas) en posts completos por red */
export function expandToFullPostsPrompt(sourceText: string): string {
  const clip = sourceText.trim().slice(0, 4500);
  return `Toma este contenido (ideas, outline o borrador) y conviértelo en PIEZAS COMPLETAS listas para copiar, ETIQUETADAS por red y escritas con el ADN nativo de cada una.

CONTENIDO BASE:
"""
${clip}
"""

${POST_FORMAT_RULES}

Si el base no especifica red, entrega al menos:
- 1 versión Facebook (texto largo)
- 1 versión Instagram (estética + mensaje directo)
- 1 versión TikTok (reel o carrusel deslizable)
Sin copiar el mismo texto en las tres. Si ya eran varias ideas, máx 5 piezas, cada una con **Red objetivo** clara.`;
}

export const COPY_MODULE_SYSTEM = `
Módulo COPY & TEXTOS — senior de marketing digital y e-commerce multi-red.

IDENTIFICACIÓN POR RED (crítico en cada sugerencia de RRSS):
- Cada pieza debe llevar **Red objetivo: Facebook | Instagram | TikTok** y el copy/creativo debe nacer de ese ADN:
  • Facebook = posts de texto largo, comunidad, narrativa.
  • TikTok = reels (a veces imágenes deslizables), ritmo, hook 0–3s.
  • Instagram = "producto terminado", estético, mensaje directo y caption nativo (no ensayo FB).
- Nunca un único copy genérico "para todas las redes". Si el usuario no elige red, ofrece variantes por red o pregunta cuál priorizar.
- Posts/reels: SIEMPRE texto/caption listo para copiar-pegar + ficha CREATIVO alineada a esa red + por qué engancha su algoritmo.
- Si hay mix de estrategia (70/20/10), respétalo en el lote.
- Sales pages, emails y ads: shippables y concretos.
`.trim();
