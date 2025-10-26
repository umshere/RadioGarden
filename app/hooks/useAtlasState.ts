import { useState, useMemo, useEffect } from "react";
import type { Country } from "~/types/radio";
import { getContinent } from "~/utils/geography";

export function useAtlasState(
  countries: Country[],
  nowPlaying: { country: string } | null,
  selectedCountry: string | null
) {
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(
    null
  );

  const countryMap = useMemo(
    () => new Map(countries.map((country) => [country.name, country] as const)),
    [countries]
  );

  const currentContinent = selectedCountry
    ? getContinent(countryMap.get(selectedCountry)?.iso_3166_1)
    : nowPlaying
    ? getContinent(countryMap.get(nowPlaying.country)?.iso_3166_1)
    : null;

  // Sync selected continent with current context
  useEffect(() => {
    if (currentContinent && selectedContinent !== currentContinent) {
      setSelectedContinent(currentContinent);
    }
  }, [currentContinent, selectedContinent]);

  return {
    activeContinent,
    selectedContinent,
    countryMap,
    setActiveContinent,
    setSelectedContinent,
  };
}
