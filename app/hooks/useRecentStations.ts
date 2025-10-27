import { useState, useEffect, useCallback } from "react";
import type { Station } from "~/types/radio";

export function useRecentStations() {
  const [recentStations, setRecentStations] = useState<Station[]>([]);

  const addToRecent = useCallback((station: Station) => {
    setRecentStations((prev) => {
      const filtered = prev.filter((s) => s.uuid !== station.uuid);
      return [station, ...filtered]; // Keep all stations, no limit
    });
  }, []);

  return {
    recentStations,
    addToRecent,
  };
}
