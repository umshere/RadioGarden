import { create, persist } from "~/utils/zustand-lite";
import type { SceneDescriptor } from "~/scenes/types";
import type { Station } from "~/types/radio";

type StartStationOptions = {
  autoPlay?: boolean;
  preserveQueue?: boolean;
};

type PlayerState = {
  audioElement: HTMLAudioElement | null;
  nowPlaying: Station | null;
  queue: Station[];
  crossfadeMs: number;
  isPlaying: boolean;
  audioLevel: number;
  shuffleMode: boolean;
  currentStationIndex: number;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  setAudioLevel: (level: number) => void;
  setShuffleMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  setCurrentStationIndex: (index: number) => void;
  setIsPlaying: (value: boolean) => void;
  setNowPlaying: (station: Station | null) => void;
  setQueue: (stations: Station[]) => void;
  enqueueStations: (stations: Station[]) => void;
  clearQueue: () => void;
  setCrossfadeMs: (value: number) => void;
  applySceneDescriptor: (descriptor: SceneDescriptor) => Station | null;
  startStation: (station: Station, options?: StartStationOptions) => void;
  playPause: () => void;
  stop: () => void;
};

const playerStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
} satisfies {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

const mergePersistedState = (persisted: unknown, current: PlayerState): PlayerState => {
  if (!persisted || typeof persisted !== "object") {
    return current;
  }

  const persistedObj = persisted as Record<string, unknown>;
  
  // Build the merged state only if there are actual differences
  const next: Record<string, unknown> = { ...current };
  let hasChanges = false;
  
  for (const [key, value] of Object.entries(persistedObj)) {
    // Skip functions and non-existent keys
    if (typeof value === "function" || !(key in next)) continue;
    
    // Only update if the value actually changed
    const currentValue = next[key];
    if (!Object.is(currentValue, value)) {
      // For objects, do a shallow comparison
      if (
        typeof currentValue === "object" && 
        currentValue !== null && 
        typeof value === "object" && 
        value !== null
      ) {
        const currentStr = JSON.stringify(currentValue);
        const valueStr = JSON.stringify(value);
        if (currentStr !== valueStr) {
          next[key] = value;
          hasChanges = true;
        }
      } else {
        next[key] = value;
        hasChanges = true;
      }
    }
  }

  // Return the same object reference if nothing changed
  return hasChanges ? (next as PlayerState) : current;
};

export const usePlayerStore = create<PlayerState>(
  persist(
    (set, get) => ({
      audioElement: null,
      nowPlaying: null,
      queue: [],
      crossfadeMs: 0,
      isPlaying: false,
      audioLevel: 0,
      shuffleMode: false,
      currentStationIndex: 0,
      setAudioElement: (element: HTMLAudioElement | null) => {
        set({ audioElement: element });
      },
      setAudioLevel: (level: number) => {
        if (get().audioLevel === level) return;
        set({ audioLevel: level });
      },
      setShuffleMode: (value: boolean | ((prev: boolean) => boolean)) =>
        set((state) => ({
          shuffleMode: typeof value === "function" ? value(state.shuffleMode) : value,
        })),
      setCurrentStationIndex: (index: number) => set({ currentStationIndex: index }),
      setIsPlaying: (value: boolean) => set({ isPlaying: value }),
      setNowPlaying: (station: Station | null) => {
        set({ nowPlaying: station });
        if (!station) {
          const audio = get().audioElement;
          if (audio) {
            audio.pause();
            audio.removeAttribute("src");
          }
          set({ isPlaying: false });
        }
      },
      setQueue: (stations: Station[]) => {
        set({ queue: [...stations], currentStationIndex: 0 });
      },
      enqueueStations: (stations: Station[]) => {
        set((state) => ({ queue: [...state.queue, ...stations] }));
      },
      clearQueue: () => {
        set({ queue: [], currentStationIndex: 0 });
      },
      setCrossfadeMs: (value: number) => {
        const normalized = Math.max(0, Math.round(value));
        set({ crossfadeMs: normalized });
      },
      applySceneDescriptor: (descriptor: SceneDescriptor) => {
        const stations = Array.isArray(descriptor.stations) ? descriptor.stations : [];
        const strategy = descriptor.play?.strategy ?? "autoplay_first";
        const crossfade = descriptor.play?.crossfadeMs ?? 0;

        set({
          queue: stations,
          currentStationIndex: 0,
          crossfadeMs: Math.max(0, Math.round(crossfade)),
        });

        if (strategy === "autoplay_first" && stations[0]) {
          return stations[0];
        }

        return null;
      },
      startStation: (station: Station, options?: StartStationOptions) => {
        const streamUrl = station.streamUrl ?? station.url ?? "";
        const preserveQueue = options?.preserveQueue ?? false;
        const currentQueue = get().queue;
        // When preserveQueue is false, move the station to the front of the queue,
        // removing any previous occurrence. This is a 'move to front' operation.
        const nextQueue = preserveQueue
          ? currentQueue
          : [station, ...currentQueue.filter((item) => item.uuid !== station.uuid)];

        set({
          nowPlaying: station,
          queue: nextQueue,
          currentStationIndex: preserveQueue ? get().currentStationIndex : 0,
        });

        const audio = get().audioElement;
        if (!audio || !streamUrl) {
          if (audio) {
            audio.pause();
            audio.removeAttribute("src");
          }
          set({ isPlaying: false });
          return;
        }

        if (audio.src !== streamUrl) {
          audio.src = streamUrl;
        }

        const shouldAutoplay = options?.autoPlay ?? true;
        if (shouldAutoplay) {
          void audio
            .play()
            .then(() => set({ isPlaying: true }))
            .catch(() => set({ isPlaying: false }));
        } else {
          audio.pause();
          set({ isPlaying: false });
        }
      },
      playPause: () => {
        const audio = get().audioElement;
        if (!audio) return;

        if (audio.paused) {
          void audio
            .play()
            .then(() => set({ isPlaying: true }))
            .catch(() => set({ isPlaying: false }));
        } else {
          audio.pause();
          set({ isPlaying: false });
        }
      },
      stop: () => {
        const audio = get().audioElement;
        if (audio) {
          audio.pause();
          audio.removeAttribute("src");
        }
        set({ nowPlaying: null, isPlaying: false });
      },
    }),
    {
      name: "player-store",
      storage: playerStorage,
      merge: mergePersistedState,
      partialize: (state) => ({
        nowPlaying: state.nowPlaying,
        queue: state.queue,
        shuffleMode: state.shuffleMode,
        currentStationIndex: state.currentStationIndex,
      }),
    }
  )
);
