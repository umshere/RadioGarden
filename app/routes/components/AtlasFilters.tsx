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
    <div id="atlas-filters" className="scroll-track overflow-x-auto pb-1 pt-2 pl-1">
      <div className="flex min-w-max items-center gap-2">
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${activeContinent === null
            ? "bg-[#e0e5ec] text-slate-800 shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
            : "bg-[#e0e5ec] text-slate-600 border-0 hover:text-slate-900 shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
            }`}
          onClick={() => onContinentSelect(null)}
        >
          <IconGlobe size={16} />
          All regions
        </button>
        {continents.map((continent) => (
          <button
            key={continent}
            type="button"
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${activeContinent === continent
              ? "bg-[#e0e5ec] text-slate-800 shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
              : "bg-[#e0e5ec] text-slate-600 border-0 hover:text-slate-900 shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
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
