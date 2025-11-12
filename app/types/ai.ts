import type { SceneDescriptor } from "~/scenes/types";

export type DescriptorStatus = "idle" | "loading" | "success" | "error";

export type AiDescriptorState = {
  status: DescriptorStatus;
  mood: string | null;
  transcript: string | null;
  descriptorSummary: string | null;
  sceneDescriptor: SceneDescriptor | null;
  error: string | null;
  updatedAt: number | null;
};

export type VoiceCommandPayload = {
  mood: string;
  transcript: string;
  visual?: string;
  country?: string | null;
  language?: string | null;
  preferredCountries?: string[];
  preferredLanguages?: string[];
  preferredTags?: string[];
  favoriteStationIds?: string[];
  recentStationIds?: string[];
  dislikedStationIds?: string[];
  currentStationId?: string | null;
  sceneId?: string | null;
};

export type AiRecommendationResponse = {
  descriptor: SceneDescriptor;
};

export type RecommendRequestBody = {
  prompt?: string;
  mood?: string;
  visual?: string;
  scene?: string;
  sceneId?: string;
  country?: string | null;
  language?: string | null;
  preferredCountries?: string[];
  preferredLanguages?: string[];
  preferredTags?: string[];
  favoriteStationIds?: string[];
  recentStationIds?: string[];
  dislikedStationIds?: string[];
  currentStationId?: string | null;
};
