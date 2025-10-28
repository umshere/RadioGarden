import { create } from "zustand";
import type { DescriptorStation, PlaybackStrategy } from "~/types/ai";

export type PlayerStoreState = {
  queue: DescriptorStation[];
  playbackStrategy: PlaybackStrategy;
  crossfadeSeconds: number;
  setQueue: (stations: DescriptorStation[]) => void;
  enqueueStations: (stations: DescriptorStation[]) => void;
  clearQueue: () => void;
  setPlaybackStrategy: (strategy: PlaybackStrategy) => void;
  setCrossfadeSeconds: (seconds: number) => void;
};

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  queue: [],
  playbackStrategy: "autoplay-first",
  crossfadeSeconds: 6,
  setQueue: (stations) => set({ queue: [...stations] }),
  enqueueStations: (stations) => set({ queue: [...get().queue, ...stations] }),
  clearQueue: () => set({ queue: [] }),
  setPlaybackStrategy: (strategy) => set({ playbackStrategy: strategy }),
  setCrossfadeSeconds: (seconds) => set({ crossfadeSeconds: Math.max(0, Math.round(seconds)) }),
}));
