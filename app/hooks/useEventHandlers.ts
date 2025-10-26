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

interface UseEventHandlersProps {
  player: any;
  mode: any;
  atlas: any;
  cards: any;
  navigate: NavigateFunction;
  selectedCountry: string | null;
  stations: Station[];
  setShowQueue: (show: boolean | ((prev: boolean) => boolean)) => void;
  setHasDismissedPlayer: (dismissed: boolean) => void;
  setIsQuickRetuneOpen: (open: boolean) => void;
  setActiveCardIndex: (index: number) => void;
  handleStartStation: (
    station: Station,
    options?: { autoPlay?: boolean }
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
  setShowQueue,
  setHasDismissedPlayer,
  setIsQuickRetuneOpen,
  setActiveCardIndex,
  handleStartStation,
  topCountries,
  countries,
  atlasNavigation,
}: UseEventHandlersProps) {
  const handlePreviewCountryPlay = useCallback(
    async (countryName: string) => {
      try {
        const result = await rbFetchJson<Station[]>(
          `/json/stations/bycountry/${encodeURIComponent(
            countryName
          )}?limit=1&hidebroken=true&order=clickcount&reverse=true`
        );
        const [first] = result;
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
    navigate("/", { preventScrollReset: true });
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
    (countryName: string) => {
      atlasNavigation.selectContinentForCountry(countryName);
      mode.setListeningMode("local");
      setIsQuickRetuneOpen(false);
      navigate(`/?country=${encodeURIComponent(countryName)}`, {
        preventScrollReset: true,
      });
      setTimeout(() => scrollToId("station-grid"), 300);
    },
    [atlasNavigation, mode, navigate, setIsQuickRetuneOpen]
  );

  const handleSurpriseRetune = useCallback(() => {
    const pool = topCountries.length > 0 ? topCountries : countries;
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (!random) return;

    atlasNavigation.selectContinentForCountry(random.name);
    mode.setListeningMode("local");
    setIsQuickRetuneOpen(false);
    navigate(`/?country=${encodeURIComponent(random.name)}`, {
      preventScrollReset: true,
    });
    setTimeout(() => scrollToId("station-grid"), 300);
  }, [
    topCountries,
    countries,
    atlasNavigation,
    mode,
    navigate,
    setIsQuickRetuneOpen,
  ]);

  const handleMissionExploreWorld = useCallback(() => {
    mode.setListeningMode("world");
    atlasNavigation.resetContinent();
    scrollIfOffscreen("player", "center");

    const first = mode.exploreStations[0];
    if (first) {
      setActiveCardIndex(1);
      handleStartStation(first);
    }
  }, [mode, atlasNavigation, handleStartStation, setActiveCardIndex]);

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
    handleMissionStayLocal,
    handleToggleListeningMode,
  };
}
