import { Text } from "@mantine/core";
import {
  IconGlobe,
  IconCompass,
  IconMapPin,
  IconHeadphones,
  IconWorld,
} from "@tabler/icons-react";

type AtlasFiltersProps = {
  continents: string[];
  activeContinent: string | null;
  onContinentSelect: (continent: string | null) => void;
};

const continentIcons: Record<string, JSX.Element> = {
  "North America": <IconGlobe size={16} />,
  "South America": <IconGlobe size={16} />,
  Europe: <IconCompass size={16} />,
  Asia: <IconMapPin size={16} />,
  Africa: <IconGlobe size={16} />,
  Oceania: <IconHeadphones size={16} />,
  Other: <IconWorld size={16} />,
};

export function AtlasFilters({
  continents,
  activeContinent,
  onContinentSelect,
}: AtlasFiltersProps) {
  return (
    <div id="atlas-filters" className="scroll-track overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-2">
        <button
          type="button"
          className={`filter-chip ${activeContinent === null ? "filter-chip--active" : ""}`}
          onClick={() => onContinentSelect(null)}
        >
          <IconGlobe size={16} />
          All regions
        </button>
        {continents.map((continent) => (
          <button
            key={continent}
            type="button"
            className={`filter-chip ${
              activeContinent === continent ? "filter-chip--active" : ""
            }`}
            onClick={() => onContinentSelect(continent)}
          >
            {continentIcons[continent] ?? <IconWorld size={16} />}
            {continent}
          </button>
        ))}
      </div>
    </div>
  );
}
