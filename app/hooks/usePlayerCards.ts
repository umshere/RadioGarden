import { useMemo } from "react";
import type { Station, ListeningMode, PlayerCard } from "~/types/radio";
import { dedupeStations } from "~/utils/geography";
import { rankStations } from "~/utils/stationMeta";

export function usePlayerCards(
  recentStations: Station[],
  stations: Station[],
  exploreStations: Station[],
  listeningMode: ListeningMode
) {
  const resolveActiveStations = (): Station[] => {
    if (listeningMode === "world") {
      if (exploreStations.length > 0) return exploreStations;
      if (stations.length > 0) return stations;
      return recentStations;
    }

    if (stations.length > 0) return stations;
    if (exploreStations.length > 0) return exploreStations;
    return recentStations;
  };

  const recentOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    recentStations.forEach((station, index) => {
      map.set(station.uuid, index);
    });
    return map;
  }, [recentStations]);

  const deckStations = useMemo(() => {
    const pool = resolveActiveStations();
    const combined = dedupeStations([...recentStations, ...pool]);
    return rankStations(combined, { recentOrder: recentOrderMap }).slice(0, 12);
  }, [recentStations, stations, exploreStations, listeningMode, recentOrderMap]);

  const playerCards = useMemo<PlayerCard[]>(() => {
    return deckStations.map((station) => ({ type: "station", station }));
  }, [deckStations]);

  const activeStationsSnapshot = resolveActiveStations();
  const hasStationsToCycle = activeStationsSnapshot.length > 0;
  const canSeekStations = activeStationsSnapshot.length > 1;

  return {
    playerCards,
    deckStations,
    activeStationsSnapshot,
    hasStationsToCycle,
    canSeekStations,
    resolveActiveStations,
  };
}
