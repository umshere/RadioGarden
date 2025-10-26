import { useState, useEffect } from "react";
import type { Station, ListeningMode } from "~/types/radio";
import { rbFetchJson } from "~/utils/radioBrowser";
import { dedupeStations } from "~/utils/geography";

export function useListeningMode() {
  const [listeningMode, setListeningMode] = useState<ListeningMode>("local");
  const [exploreStations, setExploreStations] = useState<Station[]>([]);
  const [isFetchingExplore, setIsFetchingExplore] = useState(false);

  // Persist listening mode to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("radio-passport-mode");
    if (stored === "world" || stored === "local") {
      setListeningMode(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("radio-passport-mode", listeningMode);
  }, [listeningMode]);

  // Fetch explore stations when switching to world mode
  useEffect(() => {
    if (listeningMode !== "world") return;
    if (exploreStations.length > 0 || isFetchingExplore) return;

    let cancelled = false;

    const fetchExploreStations = async () => {
      setIsFetchingExplore(true);
      try {
        const payload = await rbFetchJson<Station[]>(
          `/json/stations/topvote/120?hidebroken=true&order=clicktrend&reverse=true`
        );
        if (!cancelled && Array.isArray(payload)) {
          setExploreStations(dedupeStations(payload).slice(0, 120));
        }
      } catch (error) {
        console.error("Failed to fetch global stations", error);
      } finally {
        if (!cancelled) {
          setIsFetchingExplore(false);
        }
      }
    };

    fetchExploreStations();

    return () => {
      cancelled = true;
    };
  }, [exploreStations.length, isFetchingExplore, listeningMode]);

  return {
    listeningMode,
    exploreStations,
    isFetchingExplore,
    setListeningMode,
    setExploreStations,
    setIsFetchingExplore,
  };
}
