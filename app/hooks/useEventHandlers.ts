import { useCallback } from "react";
import type { NavigateFunction } from "@remix-run/react";
import type { Country, Station } from "~/types/radio";
import { rbFetchJson } from "~/utils/radioBrowser";
import { vibrate } from "~/utils/haptics";
import {
  scrollToId,
  scrollToTop,
  scrollToSelector,
  scrollIfOffscreen,
} from "~/utils/scrollHelpers";
import { normalizeStations } from "~/utils/stations";
import { pickTopStation } from "~/utils/stationMeta";
import { loadWorldDescriptor } from "~/services/aiOrchestrator";

interface UseEventHandlersProps {
  player: any;
  mode: any;
  atlas: any;
  navigate: NavigateFunction;
  selectedCountry: string | null;
  stations: Station[];
  setHasDismissedPlayer: (dismissed: boolean) => void;
  setIsQuickRetuneOpen: (open: boolean) => void;
  setActiveCardIndex: (index: number) => void;
  handleStartStation: (
    station: Station,
    options?: { autoPlay?: boolean; preserveQueue?: boolean }
  ) => void;
  topCountries: Country[];
  countries: Country[];
  atlasNavigation: {
    selectContinentForCountry: (countryName: string) => string | null;
    resetContinent: () => void;
    selectContinent: (continent: string | null) => void;
  };
}

/**
 * Consolidates all event handlers for the index route
 */
export function useEventHandlers({
  player,
  mode,
  atlas,
  navigate,
  selectedCountry,
  stations,
  setHasDismissedPlayer,
  setIsQuickRetuneOpen,
  setActiveCardIndex,
  handleStartStation,
  topCountries,
  countries,
  atlasNavigation,
}: UseEventHandlersProps) {
  const setIsFetchingExplore = mode.setIsFetchingExplore;
  const setExploreStations = mode.setExploreStations;
  const currentStationId = player?.nowPlaying?.uuid ?? null;

  const handlePreviewCountryPlay = useCallback(
    async (countryName: string) => {
      try {
        const payload = await rbFetchJson<unknown>(
          `/json/stations/bycountry/${encodeURIComponent(
            countryName
          )}?limit=1&hidebroken=true&order=clickcount&reverse=true`
        );
        const stations = normalizeStations(Array.isArray(payload) ? payload : []);
        const first = pickTopStation(stations);
        if (first) {
          vibrate(12);
          handleStartStation(first);
        }
      } catch (error) {
        console.error("Failed to preview country station", error);
      }
    },
    [handleStartStation]
  );

  const handleStartListening = useCallback(() => {
    atlasNavigation.resetContinent();
    scrollToId("atlas");
  }, [atlasNavigation]);

  const handleQuickRetune = useCallback(() => {
    setIsQuickRetuneOpen(true);
    atlasNavigation.resetContinent();
    scrollToId("atlas-filters");
  }, [atlasNavigation, setIsQuickRetuneOpen]);

  const handleBackToWorldView = useCallback(() => {
    player.stop();
    setHasDismissedPlayer(true);
    setIsQuickRetuneOpen(false);
    atlasNavigation.resetContinent();
    navigate("/world", { preventScrollReset: true });
    scrollToTop();
  }, [
    navigate,
    player,
    atlasNavigation,
    setHasDismissedPlayer,
    setIsQuickRetuneOpen,
  ]);

  const handleContinentSelect = useCallback(
    (continent: string | null) => {
      atlasNavigation.selectContinent(continent);
      scrollToId("atlas");
    },
    [atlasNavigation]
  );

  const handleQuickRetuneCountrySelect = useCallback(
    async (countryName: string) => {
      atlasNavigation.selectContinentForCountry(countryName);
      mode.setListeningMode("local");
      navigate(`/?country=${encodeURIComponent(countryName)}`, {
        preventScrollReset: true,
      });

      // Fetch and auto-play the top station from the selected country
      try {
        const payload = await rbFetchJson<unknown>(
          `/json/stations/bycountry/${encodeURIComponent(
            countryName
          )}?limit=1&hidebroken=true&order=clickcount&reverse=true`
        );
        const stations = normalizeStations(Array.isArray(payload) ? payload : []);
        const topStation = pickTopStation(stations);
        if (topStation) {
          vibrate(12);
          handleStartStation(topStation, { autoPlay: true });
        }
      } catch (error) {
        console.error("Failed to load station from country", error);
      }

      setTimeout(() => scrollToId("station-grid"), 300);
    },
    [atlasNavigation, mode, navigate, handleStartStation]
  );

  const handleSurpriseRetune = useCallback(async () => {
    const pool = topCountries.length > 0 ? topCountries : countries;
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (!random) return;

    atlasNavigation.selectContinentForCountry(random.name);
    mode.setListeningMode("local");
    navigate(`/?country=${encodeURIComponent(random.name)}`, {
      preventScrollReset: true,
    });

    // Fetch and auto-play a random station from the selected country
    try {
      const payload = await rbFetchJson<unknown>(
        `/json/stations/bycountry/${encodeURIComponent(
          random.name
        )}?limit=1&hidebroken=true&order=clickcount&reverse=true`
      );
      const stations = normalizeStations(Array.isArray(payload) ? payload : []);
      const topStation = pickTopStation(stations);
      if (topStation) {
        vibrate(12);
        handleStartStation(topStation, { autoPlay: true });
      }
    } catch (error) {
      console.error("Failed to load surprise station", error);
    }

    setTimeout(() => scrollToId("station-grid"), 300);
  }, [
    topCountries,
    countries,
    atlasNavigation,
    mode,
    navigate,
    handleStartStation,
  ]);

  const requestWorldDescriptor = useCallback(
    async (stationId: string | null, mood?: string) => {
      if (mode.isFetchingExplore) return false;

      setIsFetchingExplore(true);
      try {
        await loadWorldDescriptor({
          currentStationId: stationId,
          mood,
          onStationsResolved: (stations) => {
            setExploreStations(stations);
          },
          onStartStation: (station, { autoPlay }) => {
            setActiveCardIndex(1);
            handleStartStation(station, { autoPlay, preserveQueue: true });
          },
        });
        return true;
      } catch (error) {
        console.error("Failed to load world descriptor", error);
        return false;
      } finally {
        setIsFetchingExplore(false);
      }
    },
    [
      mode.isFetchingExplore,
      setIsFetchingExplore,
      setExploreStations,
      setActiveCardIndex,
      handleStartStation,
    ]
  );

  const handleMissionExploreWorld = useCallback(() => {
    mode.setListeningMode("world");
    atlasNavigation.resetContinent();
    scrollIfOffscreen("player", "center");

    requestWorldDescriptor(currentStationId).then((success) => {
      if (success) return;
      const fallback = mode.exploreStations[0];
      if (fallback) {
        setActiveCardIndex(1);
        handleStartStation(fallback);
      }
    });
  }, [
    mode,
    atlasNavigation,
    requestWorldDescriptor,
    currentStationId,
    handleStartStation,
    setActiveCardIndex,
  ]);

  const handleWorldMoodRefresh = useCallback(
    async (options?: { mood?: string }) => {
      if (mode.isFetchingExplore) return false;
      return requestWorldDescriptor(currentStationId, options?.mood);
    },
    [mode.isFetchingExplore, requestWorldDescriptor, currentStationId]
  );

  const handleMissionStayLocal = useCallback(() => {
    mode.setListeningMode("local");
    setIsQuickRetuneOpen(false);
    scrollIfOffscreen("player", "center");

    if (selectedCountry && stations.length > 0) {
      setActiveCardIndex(1);
      scrollToSelector(".station-card");
    } else {
      scrollToId("atlas");
    }
  }, [
    mode,
    selectedCountry,
    stations.length,
    setIsQuickRetuneOpen,
    setActiveCardIndex,
  ]);

  const handleToggleListeningMode = useCallback(() => {
    mode.listeningMode === "world"
      ? handleMissionStayLocal()
      : handleMissionExploreWorld();
  }, [mode.listeningMode, handleMissionStayLocal, handleMissionExploreWorld]);

  return {
    handlePreviewCountryPlay,
    handleStartListening,
    handleQuickRetune,
    handleBackToWorldView,
    handleContinentSelect,
    handleQuickRetuneCountrySelect,
    handleSurpriseRetune,
    handleMissionExploreWorld,
    handleWorldMoodRefresh,
    handleMissionStayLocal,
    handleToggleListeningMode,
  };
}
