import { useCallback } from "react";
import { getContinent } from "~/utils/geography";
import type { Country } from "~/types/radio";

/**
 * Hook to manage atlas continent/country navigation
 */
export function useAtlasNavigation(
  countryMap: Map<string, Country>,
  setSelectedContinent: (continent: string | null) => void,
  setActiveContinent: (continent: string | null) => void
) {
  const selectContinentForCountry = useCallback(
    (countryName: string) => {
      const country = countryMap.get(countryName);
      if (country) {
        const continent = getContinent(country.iso_3166_1);
        setSelectedContinent(continent);
        setActiveContinent(continent);
        return continent;
      }
      return null;
    },
    [countryMap, setSelectedContinent, setActiveContinent]
  );

  const resetContinent = useCallback(() => {
    setActiveContinent(null);
    setSelectedContinent(null);
  }, [setActiveContinent, setSelectedContinent]);

  const selectContinent = useCallback(
    (continent: string | null) => {
      setSelectedContinent(continent);
      setActiveContinent(continent);
    },
    [setSelectedContinent, setActiveContinent]
  );

  return {
    selectContinentForCountry,
    resetContinent,
    selectContinent,
  };
}
