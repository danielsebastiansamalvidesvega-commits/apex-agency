/**
 * Acciones rápidas de Copy & textos: posts listos para copiar/pegar,
 * orientados a engagement y algoritmo (Meta / IG / TikTok / FB).
 */

export type CopyAction = {
  id: string;
  label: string;
  shortLabel: string;
  /** Prompt completo que se envía al chat */
  prompt: string;
};

const POST_FORMAT_RULES = `
FORMATO OBLIGATORIO por cada pieza (no listas de ideas sueltas):

### POST [n] — [ángulo / pilar del mix si aplica]
**Red / formato:** Feed IG · Facebook · Reel · TikTok · Carrusel (elige el mejor)
**Objetivo de algoritmo:** [retención 3s · comentarios · guardados · shares · clics]
**Gancho (primera línea / 3 primeros segundos):** una línea que detenga el scroll

#### TEXTO LISTO PARA COPIAR (copy-paste)
\`\`\`
[Escribe aquí el post COMPLETO, con saltos de línea naturales, emojis solo si suman, CTA claro. Mínimo 80–220 palabras en feed; en reel/caption 40–120. NO resumas: es el copy final.]
\`\`\`

**CTA:** [qué debe hacer el usuario]
**Hashtags:** 3–8 relevantes (o "ninguno" si el algoritmo del nicho no los premia)

#### CREATIVO (qué publicar visualmente)
- **Tipo:** imagen estática | carrusel (N slides) | Reel/video 15–30s | Reel 45–60s
- **Si es IMAGEN:** descripción shot-by-shot de la foto/diseño (sujeto, encuadre, texto en imagen, colores, mood). Di si puede ser stock, UGC o diseño Canva.
- **Si es REEL/VIDEO:** guion por segundos (0–3 / 3–8 / 8–15 / cierre), texto en pantalla, hook visual, B-roll, si debe filmarse (UGC/tú) o editarse con plantilla. Audio/tendencia sugerida (genérica, sin inventar canciones con copyright exacto).
- **Por qué engancha:** 2–3 bullets (patrón interrupt, curiosidad, prueba social, contraste, promesa de resultado).
- **Cuándo publicar:** franja horaria sugerida + día ideal (genérico LatAm si no hay datos).

REGLAS DE CALIDAD (senior marketing digital + e-commerce):
- NUNCA entregues solo "ideas de post" o bullets de tema: siempre el TEXTO LISTO PARA COPIAR.
- Copy nativo de redes (no suena a brochure ni a IA genérica). Habla al avatar con dolor/deseo concretos.
- Primeras 1–2 líneas = stop scroll. Luego valor, historia o prueba, y CTA.
- Si hay estrategia/mix activo, respétalo (proporción de pilares).
- E-commerce: cuando aplique, incluye beneficio, prueba, objeción o urgencia sin ser spam.
- Variedad de ganchos (pregunta, dato, error común, antes/después, "deja de…", resultado en X días).
- Español natural (LatAm). Sin relleno teórico.
`.trim();

export const COPY_ACTIONS: CopyAction[] = [
  {
    id: "posts-5",
    label: "5 posts completos",
    shortLabel: "5 posts",
    prompt: `Genera 5 POSTS COMPLETOS listos para copiar y pegar en redes (no ideas sueltas).

${POST_FORMAT_RULES}

Entrega exactamente 5 piezas distintas, alineadas a la estrategia/mix/avatar/oferta activos (si existen). Prioriza engagement real (comentarios y guardados), no vanity genérica.`,
  },
  {
    id: "reel",
    label: "1 Reel + guion",
    shortLabel: "Reel",
    prompt: `Genera 1 REEL completo listo para producir y publicar (caption copy-paste + guion visual).

${POST_FORMAT_RULES}

Enfócate en formato video corto optimizado para algoritmo (hook 0–3s, retención, loop o CTA final). Un solo reel de alto potencial; calidad senior, no plantilla genérica.`,
  },
  {
    id: "carrusel",
    label: "Carrusel listo",
    shortLabel: "Carrusel",
    prompt: `Genera 1 CARRUSEL completo listo para diseñar y publicar (caption copy-paste + texto de cada slide).

${POST_FORMAT_RULES}

Incluye 6–8 slides con el texto EXACTO de cada slide (título + cuerpo corto). Caption del post en bloque copy-paste. Objetivo: guardados + shares.`,
  },
  {
    id: "oferta",
    label: "Post de oferta",
    shortLabel: "Oferta",
    prompt: `Genera 1 POST DE OFERTA / e-commerce listo para copiar y pegar (feed + opción reel corto).

${POST_FORMAT_RULES}

Enfocado en conversión: dolor → promesa → prueba → oferta → CTA + urgencia creíble. Incluye creativo (imagen producto vs UGC vs reel unboxing/demo). Si hay precio/oferta en memoria o proyecto, úsalos; si no, marca SUPUESTOS.`,
  },
];

/** Convierte una respuesta previa (ideas) en posts completos */
export function expandToFullPostsPrompt(sourceText: string): string {
  const clip = sourceText.trim().slice(0, 4500);
  return `Toma este contenido (ideas, outline o borrador) y conviértelo en POSTS COMPLETOS listos para copiar y pegar. No dejes ideas sueltas.

CONTENIDO BASE:
"""
${clip}
"""

${POST_FORMAT_RULES}

Si el base ya era un solo post, entrega 1 versión pulida + 1 variante A/B del gancho.
Si eran varias ideas, una pieza completa por idea (máx 5).
Calidad senior de marketing digital y e-commerce; maximiza probabilidad de engagement según algoritmo (hook, retención, comentarios, guardados).`;
}

export const COPY_MODULE_SYSTEM = `
Módulo COPY & TEXTOS — actuás como senior de marketing digital y e-commerce (Meta/IG/TikTok/FB), no como generador de "ideas genéricas".

Cuando el usuario pida posts, ideas de contenido, reels, carruseles o copy para redes:
1. Entrega SIEMPRE el texto COMPLETO listo para copy-paste (bloque de código o delimitado), nunca solo temas o bullets.
2. Incluye SIEMPRE la ficha CREATIVO: imagen vs video/reel, qué filmar o diseñar, texto en pantalla, por qué engancha el algoritmo.
3. Optimiza para el algoritmo actual: retención primeros 3s, comentarios (pregunta o polarización sana), guardados (valor listable), shares, CTA claro.
4. Si hay mix de estrategia (70/20/10 etc.), respeta la proporción en el lote.
5. Tono nativo de redes, específico al avatar/oferta; evita frases vacías tipo "¡No te lo pierdas!".
6. Páginas de venta, emails y ads: igual de shippables y concretas.

Formato preferido de cada post de redes: ver estructura POST con TEXTO LISTO PARA COPIAR + CREATIVO.
`.trim();
