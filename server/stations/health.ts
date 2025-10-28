import type { Station } from "~/types/radio";

export function annotateHealth(stations: Station[]): Station[] {
  if (!Array.isArray(stations)) {
    return [];
  }

  return stations.map((station) => {
    const lastCheckOk = station.lastCheckOk ?? true;
    const bitrateScore = typeof station.bitrate === "number" ? Math.min(station.bitrate / 256, 1) : 0.4;
    const voteScore = typeof station.votes === "number" ? Math.min(station.votes / 100, 1) : 0;
    const reliability = lastCheckOk ? 1 : 0.5;

    const composite = (bitrateScore * 0.5 + voteScore * 0.1 + reliability * 0.4) * 100;
    const healthScore = Math.round(composite);

    let healthStatus: Station["healthStatus"] = "warning";
    if (healthScore >= 70) healthStatus = "good";
    else if (healthScore <= 40) healthStatus = "error";

    return {
      ...station,
      isLikelyUp: lastCheckOk,
      healthScore,
      healthStatus,
    };
  });
}
