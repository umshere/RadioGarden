import { Text } from "@mantine/core";
import { StationCard } from "./StationCard";
import { SkeletonGrid } from "./SkeletonCard";
import type { Station } from "~/types/radio";

type StationGridProps = {
  stations: Station[];
  nowPlaying: Station | null;
  stationRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onPlayStation: (station: Station) => void;
  isFetchingExplore?: boolean;
  favoriteStationIds?: Set<string>;
  onToggleFavorite?: (station: Station) => void;
};

export function StationGrid({
  stations,
  nowPlaying,
  stationRefs,
  onPlayStation,
  isFetchingExplore = false,
  favoriteStationIds,
  onToggleFavorite,
}: StationGridProps) {
  if (isFetchingExplore) {
    return <SkeletonGrid count={6} />;
  }

  if (stations.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <Text size="md" c="rgba(226,232,240,0.6)">
          No stations broadcasting from this country right now. Try exploring a neighboring region or use Quick Retune to discover something new.
        </Text>
      </div>
    );
  }

  return (
    <div id="station-grid" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {stations.map((station, index) => {
        const isCurrent = nowPlaying?.uuid === station.uuid;
        const isFavorite = favoriteStationIds?.has(station.uuid) ?? false;
        return (
          <StationCard
            key={station.uuid}
            station={station}
            index={index}
            isCurrent={isCurrent}
            onPlay={onPlayStation}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            stationRef={(element) => {
              stationRefs.current[station.uuid] = element;
            }}
          />
        );
      })}
    </div>
  );
}
