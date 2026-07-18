import { xai } from "@ai-sdk/xai";
import type { ModuleId } from "./modules";

/** Módulos donde la IA debe indagar tendencias en vivo */
export function moduleUsesLiveResearch(moduleId: ModuleId): boolean {
  return (
    moduleId === "copy" ||
    moduleId === "ads" ||
    moduleId === "estrategia" ||
    moduleId === "consejo"
  );
}

/**
 * Herramientas server-side de xAI (Responses API):
 * - web_search: tendencias, Creative Center / insights públicos, hashtags, reportes
 * - x_search: conversación y formatos en X (señales culturales de tendencia)
 *
 * No tenemos OAuth a Meta Creator Insights ni TikTok Analytics del usuario;
 * se investiga lo público y reportes actuales vía web + X.
 */
export function liveResearchTools() {
  return {
    web_search: xai.tools.webSearch(),
    x_search: xai.tools.xSearch(),
  };
}

export const LIVE_RESEARCH_SYSTEM = `
INVESTIGACIÓN EN VIVO (herramientas web_search y x_search — úsalas):

Cuando el usuario pida posts, packs de redes, reels, hashtags, ángulos creativos, calendarios de contenido o campañas:
1. ANTES de redactar el copy final, llama a web_search (y x_search si aporta) con el nicho/oferta/avatar del proyecto.
2. Indaga por red:
   - TikTok: tendencias de formato, sonidos/formatos virales genéricos, hashtags o temas en alza del nicho, hooks típicos recientes (Creative Center / reportes / blogs de marketing actualizados).
   - Instagram: formatos en auge (carrusel, reels estéticos, collabs), hashtags relevantes del nicho, estética "producto terminado" que esté funcionando.
   - Facebook: temas de conversación, posts de texto largo / grupos / pruebas sociales que resuenen ahora en el nicho.
   - Otras señales: estacionalidad, noticias del sector, objeciones de moda, keywords de búsqueda del avatar.
3. Incluye al inicio una sección breve:
   ## SEÑALES DE TENDENCIA (investigación)
   - TikTok: …
   - Instagram: …
   - Facebook: …
   - Hashtags / temas en crecimiento (si los encontraste; si no, dilo y usa proxies del nicho)
   - Fuentes: resume de dónde salió (sin inventar URLs rotas).
4. Cada post debe enganchar al menos 1 señal de tendencia o formato actual (menciónalo en "Por qué engancha").
5. Si la búsqueda falla o no hay datos frescos: marca SUPUESTOS y usa best practices actuales del algoritmo — no inventes "insights oficiales" falsos de Creator Tools.
6. No digas que entraste a la cuenta del usuario en Meta/TikTok Analytics; sí di que usaste investigación web/tendencias públicas.
`.trim();
