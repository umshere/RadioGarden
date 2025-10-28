import { sceneManager } from "~/services/sceneManager";
import type { SceneDescriptor } from "~/scenes/types";
import type { Station } from "~/types/radio";
import { usePlayerStore } from "~/state/playerStore";

const ENDPOINT = "/api/ai/recommend";

type AiRecommendationResponse = {
  descriptor: SceneDescriptor;
};

type LoadWorldDescriptorOptions = {
  signal?: AbortSignal;
  prompt?: string;
  mood?: string;
  visual?: string;
  currentStationId?: string | null;
  onStationsResolved?: (stations: Station[]) => void;
  onStartStation?: (station: Station, options: { autoPlay: boolean }) => void;
};

function isSceneDescriptor(value: unknown): value is SceneDescriptor {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.visual === "string" && Array.isArray(candidate.stations);
}

function parseResponse(payload: unknown): SceneDescriptor {
  if (!payload || typeof payload !== "object" || !("descriptor" in payload)) {
    throw new Error("AI payload missing descriptor field");
  }

  const raw = (payload as AiRecommendationResponse).descriptor;
  if (!isSceneDescriptor(raw)) {
    throw new Error("AI payload descriptor is malformed");
  }

  return {
    visual: raw.visual,
    mood: raw.mood,
    animation: raw.animation,
    play: raw.play,
    stations: raw.stations,
    reason: raw.reason,
  };
}

export async function loadWorldDescriptor(options: LoadWorldDescriptorOptions = {}) {
  const { signal, prompt, mood, visual, onStationsResolved, onStartStation } = options;
  const usePost = typeof prompt === "string" && prompt.trim().length > 0;
  const query = new URLSearchParams();

  if (!usePost) {
    if (mood) query.set("mood", mood);
    if (visual) query.set("visual", visual);
  }

  const endpoint = usePost
    ? ENDPOINT
    : query.size > 0
    ? `${ENDPOINT}?${query.toString()}`
    : ENDPOINT;

  const response = await fetch(endpoint, {
    method: usePost ? "POST" : "GET",
    headers: usePost
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
    body: usePost
      ? JSON.stringify({
          prompt,
          mood,
          visual,
        })
      : undefined,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load AI descriptor (${response.status})`);
  }

  const payload: unknown = await response.json();
  const descriptor = parseResponse(payload);

  sceneManager.setDescriptor(descriptor);

  const player = usePlayerStore.getState();
  const autoStation = player.applySceneDescriptor(descriptor);

  onStationsResolved?.(descriptor.stations);

  if (autoStation) {
    onStartStation?.(autoStation, { autoPlay: true });
  }

  return descriptor;
}
