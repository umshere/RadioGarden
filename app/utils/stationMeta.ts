import type { CSSProperties } from "react";
import type { Station } from "~/types/radio";

export type StationHealthStatus = "good" | "warning" | "error";

export type StationHealthMeta = {
  status: StationHealthStatus;
  label: string;
};

export function getHealthBadgeStyle(status: StationHealthStatus): CSSProperties {
  switch (status) {
    case "error":
      return {
        background: "rgba(209,73,91,0.15)",
        border: "1px solid rgba(209,73,91,0.35)",
        color: "rgba(255,205,214,0.9)",
      };
    case "warning":
      return {
        background: "rgba(248,180,0,0.12)",
        border: "1px solid rgba(248,180,0,0.4)",
        color: "rgba(255,224,138,0.9)",
      };
    default:
      return {
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.28)",
        color: "rgba(190,242,100,0.9)",
      };
  }
}

export function deriveStationHealth(station: Station): StationHealthMeta | null {
  const { healthStatus, sslError, lastCheckOk, lastCheckOkTime } = station;
  const relative = lastCheckOkTime ? formatRelativeTime(lastCheckOkTime) : null;

  if (healthStatus === "error") {
    return { status: "error", label: "Stream unavailable" };
  }

  if (healthStatus === "warning" || sslError || lastCheckOk === false) {
    return {
      status: "warning",
      label: relative ? `Last check failed · ${relative}` : "Stream check failed",
    };
  }

  if ((healthStatus === "good" || lastCheckOk) && relative) {
    return { status: "good", label: `Last checked OK · ${relative}` };
  }

  return null;
}

export function formatRelativeTime(iso: string, locale = "en"): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const absDiff = Math.abs(diffMs);

  const units: Array<{ limit: number; divisor: number; label: Intl.RelativeTimeFormatUnit }> = [
    { limit: 60_000, divisor: 1000, label: "second" },
    { limit: 3_600_000, divisor: 60_000, label: "minute" },
    { limit: 86_400_000, divisor: 3_600_000, label: "hour" },
    { limit: 604_800_000, divisor: 86_400_000, label: "day" },
    { limit: 2_592_000_000, divisor: 604_800_000, label: "week" },
    { limit: 31_536_000_000, divisor: 2_592_000_000, label: "month" },
  ];

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const unit of units) {
    if (absDiff < unit.limit) {
      const value = Math.round(diffMs / unit.divisor);
      return formatter.format(-value, unit.label);
    }
  }

  const years = Math.round(diffMs / 31_536_000_000);
  return formatter.format(-years, "year");
}

export function scoreStation(
  station: Station,
  options: { recentPosition?: number } = {}
): number {
  let score = 0;

  if (!station.streamUrl && !station.url) {
    score -= 120;
  }

  switch (station.healthStatus) {
    case "good":
      score += 40;
      break;
    case "warning":
      score -= 30;
      break;
    case "error":
      score -= 120;
      break;
    default:
      break;
  }

  if (station.isStreamHealthy) score += 10;

  if (typeof station.clickTrend === "number") {
    score += Math.max(Math.min(station.clickTrend, 60), -40);
  }

  if (typeof station.votes === "number") {
    score += Math.min(Math.floor(station.votes / 1000), 25);
  }

  if (typeof station.clickCount === "number") {
    score += Math.min(Math.floor(station.clickCount / 5000), 20);
  }

  if (options.recentPosition !== undefined) {
    score += Math.max(30 - options.recentPosition * 4, 0);
  }

  return score;
}

export function rankStations(
  stations: Station[],
  opts: { recentOrder?: Map<string, number> } = {}
): Station[] {
  return [...stations]
    .map((station, index) => ({
      station,
      score: scoreStation(station, {
        recentPosition: opts.recentOrder?.get(station.uuid),
      }),
      index,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map((entry) => entry.station);
}

export function pickTopStation(
  stations: Station[],
  opts: { recentOrder?: Map<string, number> } = {}
): Station | undefined {
  return rankStations(stations, opts)[0];
}
