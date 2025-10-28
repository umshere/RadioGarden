import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Station } from "~/types/radio";

type StartStationOptions = {
  autoPlay?: boolean;
  preserveQueue?: boolean;
};

type PlayerState = {
  audioElement: HTMLAudioElement | null;
  nowPlaying: Station | null;
  queue: Station[];
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

  const next: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(persisted as Record<string, unknown>)) {
    if (typeof value === "function") continue;
    if (!(key in next)) continue;
    next[key] = value;
  }

  return next as PlayerState;
};

export const usePlayerStore = create<PlayerState>(
  persist(
    (set, get) => ({
      audioElement: null,
      nowPlaying: null,
      queue: [],
      isPlaying: false,
      audioLevel: 0,
      shuffleMode: false,
      currentStationIndex: 0,
      setAudioElement: (element: HTMLAudioElement | null) => {
        set({ audioElement: element });
      },
      setAudioLevel: (level: number) => set({ audioLevel: level }),
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
