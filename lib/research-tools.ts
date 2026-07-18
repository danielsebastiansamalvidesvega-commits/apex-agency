import { xai } from "@ai-sdk/xai";

/**
 * Research es OPT-IN (caro: tool rounds + tokens).
 * Solo cuando el cliente manda liveResearch: true.
 */
export function liveResearchTools() {
  return {
    // Solo web_search por defecto en el set; x_search se omite para ahorrar
    web_search: xai.tools.webSearch(),
  };
}

export const LIVE_RESEARCH_SYSTEM = `Tienes web_search. Si el usuario pidió tendencias: 1 búsqueda del nicho, máx 6 bullets SEÑALES, luego el copy. Sin más tool calls. No inventes insights de cuentas privadas.`;
