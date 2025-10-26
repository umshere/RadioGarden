import { useCallback, useState } from "react";
import type { Station } from "~/types/radio";

/**
 * Extracts UI state management for player cards
 */
export function usePlayerCardState() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardDirection, setCardDirection] = useState<1 | -1>(1);

  const changeCard = useCallback((direction: 1 | -1, totalCards: number) => {
    if (totalCards <= 1) return;
    setCardDirection(direction);
    setActiveCardIndex((prev) => (prev + direction + totalCards) % totalCards);
  }, []);

  const jumpToCard = useCallback((index: number, totalCards: number) => {
    if (index < 0 || index >= totalCards) return;
    setCardDirection((prev) => (index > prev ? 1 : -1));
    setActiveCardIndex(index);
  }, []);

  const syncCardWithStation = useCallback(
    (station: Station | null, playerCards: any[], currentIndex: number) => {
      if (!station) return;
      const stationIndex = playerCards.findIndex(
        (card) => card.type === "station" && card.station.uuid === station.uuid
      );
      if (stationIndex > 0 && stationIndex !== currentIndex) {
        setCardDirection(stationIndex > currentIndex ? 1 : -1);
        setActiveCardIndex(stationIndex);
      }
    },
    []
  );

  return {
    activeCardIndex,
    setActiveCardIndex,
    cardDirection,
    changeCard,
    jumpToCard,
    syncCardWithStation,
  };
}
