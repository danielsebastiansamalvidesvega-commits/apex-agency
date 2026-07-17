import { xai } from "@ai-sdk/xai";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "@/lib/prompts";
import type { ModuleId, RoleMode } from "@/lib/modules";

export const maxDuration = 60;

function publicErrorMessage(error: unknown): string {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Error desconocido al llamar al modelo.";

  const lower = msg.toLowerCase();

  if (
    lower.includes("bad credentials") ||
    lower.includes("unauthenticated") ||
    lower.includes("incorrect api key") ||
    lower.includes("invalid api key") ||
    lower.includes("401")
  ) {
    return "API key de xAI inválida o vacía. Revisa XAI_API_KEY en Vercel (Settings → Environment Variables) y vuelve a redesplegar.";
  }

  if (lower.includes("insufficient") || lower.includes("credit") || lower.includes("billing")) {
    return "La cuenta de xAI no tiene créditos suficientes. Carga saldo en console.x.ai.";
  }

  if (lower.includes("rate") || lower.includes("429")) {
    return "Límite de uso de la API alcanzado. Espera un momento e intenta de nuevo.";
  }

  // Don't leak internal stack traces to the client
  if (msg.length > 280) return msg.slice(0, 280) + "…";
  return msg;
}

export async function POST(req: Request) {
  const apiKey = process.env.XAI_API_KEY?.trim();

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Falta XAI_API_KEY en el servidor. Configúrala en Vercel → Project → Settings → Environment Variables (Production) y haz Redeploy.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const messages = body.messages as UIMessage[];
    const role = (body.role as RoleMode) || "agencia";
    const moduleId = (body.moduleId as ModuleId) || "consejo";
    const projectContext = (body.projectContext as string) || "";

    const system = buildSystemPrompt({ role, moduleId, projectContext });

    const result = streamText({
      model: xai.responses("grok-4.5"),
      system,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      onError: publicErrorMessage,
    });
  } catch (error) {
    console.error("[api/chat]", error);
    return Response.json(
      { error: publicErrorMessage(error) },
      { status: 500 },
    );
  }
}
