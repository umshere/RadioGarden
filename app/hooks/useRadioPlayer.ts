import { usePlayerStore } from "~/state/playerStore";

export function useRadioPlayer() {
  return usePlayerStore((state) => ({
    nowPlaying: state.nowPlaying,
    isPlaying: state.isPlaying,
    audioLevel: state.audioLevel,
    shuffleMode: state.shuffleMode,
    currentStationIndex: state.currentStationIndex,
    queue: state.queue,
    setShuffleMode: state.setShuffleMode,
    setCurrentStationIndex: state.setCurrentStationIndex,
    setNowPlaying: state.setNowPlaying,
    startStation: state.startStation,
    playPause: state.playPause,
    stop: state.stop,
  }));
}
