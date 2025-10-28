import type { SceneDescriptor } from "~/scenes/types";
import type { Station } from "~/types/radio";

function ensureStation(value: any): Station {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid station in descriptor");
  }

  const uuid = String(value.uuid ?? value.id ?? value.slug ?? value.name ?? "");

  return {
    uuid,
    name: String(value.name ?? "Unknown Station"),
    url: value.url ?? value.streamUrl ?? "",
    streamUrl: value.streamUrl ?? value.url ?? null,
    favicon: value.favicon ?? "",
    country: value.country ?? value.countryCode ?? "",
    countryCode: value.countryCode ?? value.country ?? null,
    state: value.state ?? null,
    language: value.language ?? value.languageCodes?.[0] ?? null,
    languageCodes: Array.isArray(value.languageCodes)
      ? value.languageCodes.map(String)
      : value.language
      ? [String(value.language)]
      : [],
    tags: value.tags ?? null,
    tagList: Array.isArray(value.tagList)
      ? value.tagList.map(String)
      : typeof value.tags === "string"
      ? String(value.tags)
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : [],
    bitrate: typeof value.bitrate === "number" ? value.bitrate : 0,
    highlight: value.highlight ?? value.explain ?? null,
    codec: value.codec ?? null,
    votes: typeof value.votes === "number" ? value.votes : 0,
    clickCount: typeof value.clickCount === "number" ? value.clickCount : 0,
    clickTrend: typeof value.clickTrend === "number" ? value.clickTrend : 0,
    lastCheckOk: value.lastCheckOk ?? null,
    lastCheckOkTime: value.lastCheckOkTime ?? null,
    lastCheckTime: value.lastCheckTime ?? null,
    lastLocalCheckTime: value.lastLocalCheckTime ?? null,
    sslError: value.sslError ?? null,
    homepage: value.homepage ?? null,
    hls: value.hls ?? null,
  };
}

export function parseSceneDescriptor(raw: unknown): SceneDescriptor {
  if (!raw) {
    throw new Error("Empty descriptor payload");
  }

  const descriptor = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!descriptor || typeof descriptor !== "object") {
    throw new Error("Descriptor must be an object");
  }

  const visual = "visual" in descriptor ? (descriptor as any).visual : null;
  if (!visual || typeof visual !== "string") {
    throw new Error("Descriptor must include a visual scene id");
  }

  const stationsInput = (descriptor as any).stations;
  if (!Array.isArray(stationsInput) || stationsInput.length === 0) {
    throw new Error("Descriptor must provide at least one station");
  }

  return {
    visual,
    mood: (descriptor as any).mood ?? undefined,
    animation: (descriptor as any).animation ?? undefined,
    play: (descriptor as any).play,
    stations: stationsInput.map(ensureStation),
    reason: (descriptor as any).reason ?? undefined,
  };
}
