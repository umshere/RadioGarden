import { usePlayerStore } from "~/state/playerStore";
import { useMemo } from "react";

export function useRadioPlayer() {
  // Select primitive values and functions separately to avoid unnecessary re-renders
  const nowPlaying = usePlayerStore((state) => state.nowPlaying);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const audioLevel = usePlayerStore((state) => state.audioLevel);
  const shuffleMode = usePlayerStore((state) => state.shuffleMode);
  const currentStationIndex = usePlayerStore((state) => state.currentStationIndex);
  const queue = usePlayerStore((state) => state.queue);
  const crossfadeMs = usePlayerStore((state) => state.crossfadeMs);
  const setShuffleMode = usePlayerStore((state) => state.setShuffleMode);
  const setCurrentStationIndex = usePlayerStore((state) => state.setCurrentStationIndex);
  const setNowPlaying = usePlayerStore((state) => state.setNowPlaying);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const enqueueStations = usePlayerStore((state) => state.enqueueStations);
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const setCrossfadeMs = usePlayerStore((state) => state.setCrossfadeMs);
  const applySceneDescriptor = usePlayerStore((state) => state.applySceneDescriptor);
  const startStation = usePlayerStore((state) => state.startStation);
  const playPause = usePlayerStore((state) => state.playPause);
  const stop = usePlayerStore((state) => state.stop);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      nowPlaying,
      isPlaying,
      audioLevel,
      shuffleMode,
      currentStationIndex,
      queue,
      crossfadeMs,
      setShuffleMode,
      setCurrentStationIndex,
      setNowPlaying,
      setQueue,
      enqueueStations,
      clearQueue,
      setCrossfadeMs,
      applySceneDescriptor,
      startStation,
      playPause,
      stop,
    }),
    [
      nowPlaying,
      isPlaying,
      audioLevel,
      shuffleMode,
      currentStationIndex,
      queue,
      crossfadeMs,
      setShuffleMode,
      setCurrentStationIndex,
      setNowPlaying,
      setQueue,
      enqueueStations,
      clearQueue,
      setCrossfadeMs,
      applySceneDescriptor,
      startStation,
      playPause,
      stop,
    ]
  );
}
