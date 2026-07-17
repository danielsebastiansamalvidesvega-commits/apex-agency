import { xai } from "@ai-sdk/xai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { buildSystemPrompt } from "@/lib/prompts";
import type { ModuleId, RoleMode } from "@/lib/modules";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.XAI_API_KEY) {
    return Response.json(
      {
        error:
          "Falta XAI_API_KEY. Crea un archivo .env.local con XAI_API_KEY=tu_clave (console.x.ai).",
      },
      { status: 500 },
    );
  }

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

  return result.toUIMessageStreamResponse();
}
