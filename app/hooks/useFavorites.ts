import { useState, useEffect } from "react";

export function useFavorites() {
  const [favoriteStationIds, setFavoriteStationIds] = useState<Set<string>>(
    new Set()
  );

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("radio-passport-favorites");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setFavoriteStationIds(new Set(parsed));
        }
      } catch (error) {
        console.error("Failed to parse stored favorites", error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "radio-passport-favorites",
      JSON.stringify(Array.from(favoriteStationIds))
    );
  }, [favoriteStationIds]);

  const toggleFavorite = (stationId: string) => {
    setFavoriteStationIds((prev) => {
      const next = new Set(prev);
      if (next.has(stationId)) {
        next.delete(stationId);
      } else {
        next.add(stationId);
      }
      return next;
    });
  };

  return {
    favoriteStationIds,
    toggleFavorite,
  };
}
