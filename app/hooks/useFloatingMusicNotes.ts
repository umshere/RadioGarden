import { useMemo } from "react";

export interface FloatingNote {
  id: number;
  delay: number;
  duration: number;
  startX: number;
  endX: number;
  startY: number;
  midY: number;
  endY: number;
  rotation: number;
  scale1: number;
  scale2: number;
  opacity: number;
  note: string;
  blur: number;
}

export function useFloatingMusicNotes(count: number = 8): FloatingNote[] {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        delay: Math.random() * 6,
        duration: 12 + Math.random() * 8,
        startX: Math.random() * 100,
        endX: Math.random() * 100,
        startY: 110,
        midY: 50 + Math.random() * 15,
        endY: -20 - Math.random() * 10,
        rotation: Math.random() * 360,
        scale1: 0.3 + Math.random() * 0.2,
        scale2: 0.6 + Math.random() * 0.3,
        opacity: 0.15 + Math.random() * 0.1,
        note: ["🎵", "🎶", "🎼", "🎹"][Math.floor(Math.random() * 4)],
        blur: Math.random() * 1,
      })),
    [count]
  );
}
