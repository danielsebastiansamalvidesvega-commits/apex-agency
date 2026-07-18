import { xai } from "@ai-sdk/xai";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import {
  buildSystemPrompt,
  compactMemories,
  trimMessagesForModel,
} from "@/lib/prompts";
import type { ModuleId, RoleMode } from "@/lib/modules";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { projectToContext, type Project } from "@/lib/types";
import { assertCanChat, incrementMessageUsage } from "@/lib/billing";
import { formatHandoffsForPrompt, type Handoff } from "@/lib/handoffs";

export const maxDuration = 60;

/** Cap assistant verbosity (output tokens). */
const MAX_OUTPUT_TOKENS = 2500;
/** Only last N UI messages go to the model. */
const MAX_HISTORY_MESSAGES = 12;
/** Max memories loaded from DB. */
const MEMORY_FETCH_LIMIT = 20;

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
    return "API key de xAI inválida o vacía. Revisa XAI_API_KEY en Vercel.";
  }

  if (
    lower.includes("insufficient") ||
    lower.includes("credit") ||
    lower.includes("billing")
  ) {
    return "La cuenta de xAI no tiene créditos suficientes. Carga saldo en console.x.ai.";
  }

  if (lower.includes("rate") || lower.includes("429")) {
    return "Límite de uso de la API alcanzado. Espera un momento e intenta de nuevo.";
  }

  if (msg.length > 280) return msg.slice(0, 280) + "…";
  return msg;
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Falta XAI_API_KEY en el servidor. Configúrala en Vercel y haz Redeploy.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const messages = (body.messages as UIMessage[]) || [];
    const role = (body.role as RoleMode) || "agencia";
    const moduleId = (body.moduleId as ModuleId) || "consejo";
    let projectContext = (body.projectContext as string) || "";

    const supabase = await createClient();

    const gate = await assertCanChat(
      supabase,
      user.id,
      moduleId,
      user.email,
    );
    if (!gate.ok) {
      return Response.json(
        {
          error: gate.message,
          code: gate.code,
          plan: gate.plan.id,
          upgradeUrl: "/app/planes",
          used: gate.used,
          limit: gate.limit,
        },
        { status: 402 },
      );
    }

    // Count this request toward the daily quota
    try {
      await incrementMessageUsage(supabase, user.id);
    } catch {
      /* usage table may not exist yet */
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, active_project_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!projectContext && profile?.active_project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", profile.active_project_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (project) projectContext = projectToContext(project as Project);
    }

    // Prefer project-linked memories, then general — compact before inject
    const { data: memories } = await supabase
      .from("memories")
      .select("content, kind, project_id, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(MEMORY_FETCH_LIMIT);

    const activePid = profile?.active_project_id ?? null;
    const sorted = [...(memories || [])].sort((a, b) => {
      const aHit = activePid && a.project_id === activePid ? 0 : 1;
      const bHit = activePid && b.project_id === activePid ? 0 : 1;
      return aHit - bHit;
    });
    const memoryContext = compactMemories(sorted);

    // Handoffs: ideas transferidas desde otros módulos hacia este.
    // Prefer client handoffContext (localStorage + remoto mergeados en UI);
    // si no llega, cargar desde Supabase.
    let handoffContext = "";
    if (typeof body.handoffContext === "string" && body.handoffContext.trim()) {
      handoffContext = body.handoffContext.slice(0, 3500);
    } else {
      try {
        const { data: handoffs } = await supabase
          .from("handoffs")
          .select("*")
          .eq("user_id", user.id)
          .eq("active", true)
          .or(`to_module.eq.${moduleId},to_module.eq.all`)
          .order("created_at", { ascending: false })
          .limit(6);
        handoffContext = formatHandoffsForPrompt(
          (handoffs || []) as Handoff[],
          moduleId,
        );
      } catch {
        /* table may not exist */
      }
    }

    const system = buildSystemPrompt({
      role,
      moduleId,
      projectContext,
      memoryContext,
      handoffContext,
      userName: profile?.full_name || user.email || null,
    });

    // Full thread stays in the UI/DB; model only sees a recent window
    const modelMessages = trimMessagesForModel(messages, MAX_HISTORY_MESSAGES);

    // Cheapest text model by default (override with XAI_MODEL on Vercel)
    // Pricing (approx per 1M tokens): build-0.1 $1/$2 · 4.3 $1.25/$2.50 · 4.5 $2/$6
    const modelId =
      process.env.XAI_MODEL?.trim() || "grok-build-0.1";

    // Only some models accept reasoningEffort; grok-build-0.1 rejects it
    const supportsReasoningEffort =
      modelId.includes("grok-4.5") ||
      modelId.includes("grok-4.3") ||
      modelId.includes("grok-4.20");

    const result = streamText({
      model: xai(modelId),
      system,
      messages: await convertToModelMessages(modelMessages),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      ...(supportsReasoningEffort
        ? {
            providerOptions: {
              xai: { reasoningEffort: "none" as const },
            },
          }
        : {}),
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
