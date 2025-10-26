import { useMemo } from "react";
import type { Station, ListeningMode, PlayerCard } from "~/types/radio";
import { dedupeStations } from "~/utils/geography";

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

  const deckStations = useMemo(() => {
    const pool = resolveActiveStations();
    return dedupeStations([...recentStations, ...pool]).slice(0, 12);
  }, [recentStations, stations, exploreStations, listeningMode]);

  const playerCards = useMemo<PlayerCard[]>(() => {
    const cards: PlayerCard[] = [{ type: "mission" }];
    for (const station of deckStations) {
      cards.push({ type: "station", station });
    }
    return cards;
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
