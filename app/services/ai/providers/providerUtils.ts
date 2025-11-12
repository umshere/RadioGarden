import type { Station } from "~/types/radio";

export function normalizePreferenceList(values?: string[]): string[] {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}

export function filterStationCandidates(
  stations: Station[],
  options?: { minBitrate?: number }
): Station[] {
  const minBitrate = options?.minBitrate ?? 64;
  return stations.filter((station) => {
    const hasStream = Boolean(station.streamUrl);
    const bitrateOk = typeof station.bitrate === "number" ? station.bitrate >= minBitrate : true;
    const healthy = station.isStreamHealthy !== false;
    return hasStream && bitrateOk && healthy;
  });
}

export function dedupeStations(stations: Station[]): Station[] {
  const seen = new Set<string>();
  const result: Station[] = [];
  for (const station of stations) {
    if (!station?.uuid) continue;
    if (seen.has(station.uuid)) continue;
    seen.add(station.uuid);
    result.push(station);
  }
  return result;
}
