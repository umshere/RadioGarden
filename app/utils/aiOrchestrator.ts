import type { AiOrchestratorResponse, VoiceCommandPayload } from "~/types/ai";

export async function callAiOrchestrator(
  payload: VoiceCommandPayload,
  options?: { signal?: AbortSignal }
): Promise<AiOrchestratorResponse> {
  try {
    const response = await fetch("/api/ai/orchestrator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`AI orchestrator request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Partial<AiOrchestratorResponse>;
    if (!data || typeof data.descriptor !== "string" || !data.descriptor.trim()) {
      throw new Error("AI orchestrator returned an empty descriptor");
    }

    return {
      descriptor: data.descriptor.trim(),
      mood: data.mood?.trim() || undefined,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unknown AI orchestrator error";

    throw new Error(message);
  }
}
