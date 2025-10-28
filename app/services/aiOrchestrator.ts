import { sceneManager } from "~/services/sceneManager";
import type { AiRecommendationResponse, DescriptorStation, PlaybackStrategy, WorldMoodDescriptor } from "~/types/ai";
import type { Station } from "~/types/radio";
import { usePlayerStore } from "~/stores/playerStore";

function isDescriptorStation(value: unknown): value is DescriptorStation {
  if (!value || typeof value !== "object") return false;
  const station = value as Record<string, unknown>;
  return (
    typeof station.uuid === "string" &&
    typeof station.name === "string" &&
    typeof station.country === "string" &&
    typeof station.url === "string" &&
    typeof station.bitrate === "number" &&
    typeof station.codec === "string" &&
    typeof station.highlight === "string"
  );
}

function isPlaybackStrategy(value: unknown): value is PlaybackStrategy {
  return value === "autoplay-first" || value === "respect-current" || value === "queue-only";
}

function validateDescriptor(payload: unknown): WorldMoodDescriptor {
  if (!payload || typeof payload !== "object" || !("descriptor" in payload)) {
    throw new Error("AI payload missing descriptor field");
  }

  const raw = (payload as AiRecommendationResponse).descriptor;
  if (!raw || typeof raw !== "object") {
    throw new Error("Descriptor must be an object");
  }

  const descriptor = raw as Record<string, unknown>;

  if (typeof descriptor.id !== "string" || descriptor.id.length === 0) {
    throw new Error("Descriptor id missing");
  }

  if (typeof descriptor.slug !== "string" || descriptor.slug.length === 0) {
    throw new Error("Descriptor slug missing");
  }

  if (typeof descriptor.label !== "string") {
    throw new Error("Descriptor label missing");
  }

  if (!Array.isArray(descriptor.stations) || descriptor.stations.length === 0) {
    throw new Error("Descriptor stations missing");
  }

  const stations = descriptor.stations.filter(isDescriptorStation) as DescriptorStation[];
  if (stations.length === 0) {
    throw new Error("Descriptor stations invalid");
  }

  const playback = descriptor.playback as Record<string, unknown> | undefined;
  if (!playback) {
    throw new Error("Descriptor playback missing");
  }

  const strategy = isPlaybackStrategy(playback.strategy) ? playback.strategy : "autoplay-first";
  const crossfadeSeconds = typeof playback.crossfadeSeconds === "number" && playback.crossfadeSeconds >= 0
    ? playback.crossfadeSeconds
    : 6;

  const theme = descriptor.theme as Record<string, unknown> | undefined;
  const palette = theme?.palette as Record<string, unknown> | undefined;
  const camera = theme?.camera as Record<string, unknown> | undefined;

  if (!theme || !palette || !camera) {
    throw new Error("Descriptor theme missing");
  }

  const safeDescriptor: WorldMoodDescriptor = {
    id: descriptor.id,
    slug: descriptor.slug,
    label: typeof descriptor.label === "string" ? descriptor.label : "World Mood",
    mood: typeof descriptor.mood === "string" ? descriptor.mood : descriptor.label,
    summary: typeof descriptor.summary === "string" ? descriptor.summary : "",
    narrative: typeof descriptor.narrative === "string" ? descriptor.narrative : "",
    theme: {
      palette: {
        background: typeof palette.background === "string" ? palette.background : "#010b1a",
        accent: typeof palette.accent === "string" ? palette.accent : "#facc15",
        glow: typeof palette.glow === "string" ? palette.glow : "#fde68a",
      },
      camera: {
        latitude: typeof camera.latitude === "number" ? camera.latitude : 0,
        longitude: typeof camera.longitude === "number" ? camera.longitude : 0,
        altitude: typeof camera.altitude === "number" ? camera.altitude : 1.4,
      },
    },
    playback: {
      strategy,
      crossfadeSeconds,
    },
    stations,
    generatedAt: typeof descriptor.generatedAt === "string" ? descriptor.generatedAt : new Date().toISOString(),
  };

  return safeDescriptor;
}

export type LoadWorldDescriptorOptions = {
  signal?: AbortSignal;
  currentStationId?: string | null;
  onStationsResolved?: (stations: Station[]) => void;
  onStartStation?: (station: Station, options: { autoPlay: boolean }) => void;
};

const ENDPOINT = "/api/ai/recommend";

export async function loadWorldDescriptor(options: LoadWorldDescriptorOptions = {}) {
  const { signal, currentStationId, onStationsResolved, onStartStation } = options;

  const response = await fetch(ENDPOINT, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load AI descriptor (${response.status})`);
  }

  const payload: unknown = await response.json();
  const descriptor = validateDescriptor(payload);

  sceneManager.setDescriptor(descriptor);

  const playerState = usePlayerStore.getState();
  playerState.setPlaybackStrategy(descriptor.playback.strategy);
  playerState.setCrossfadeSeconds(descriptor.playback.crossfadeSeconds);
  playerState.setQueue(descriptor.stations);

  onStationsResolved?.(descriptor.stations);

  const firstStation = descriptor.stations[0];
  if (!firstStation) {
    return descriptor;
  }

  const shouldAutoplay =
    descriptor.playback.strategy === "autoplay-first" ||
    (descriptor.playback.strategy === "respect-current" && !currentStationId);

  if (shouldAutoplay) {
    onStartStation?.(firstStation, { autoPlay: true });
  }

  return descriptor;
}
