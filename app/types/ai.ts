import type { Station } from "~/types/radio";

export type PlaybackStrategy = "autoplay-first" | "respect-current" | "queue-only";

export type DescriptorStation = Station & {
  highlight: string;
};

export type WorldMoodDescriptor = {
  id: string;
  slug: string;
  label: string;
  mood: string;
  summary: string;
  narrative: string;
  theme: {
    palette: {
      background: string;
      accent: string;
      glow: string;
    };
    camera: {
      latitude: number;
      longitude: number;
      altitude: number;
    };
  };
  playback: {
    strategy: PlaybackStrategy;
    crossfadeSeconds: number;
  };
  stations: DescriptorStation[];
  generatedAt: string;
};

export type AiRecommendationResponse = {
  descriptor: WorldMoodDescriptor;
};
