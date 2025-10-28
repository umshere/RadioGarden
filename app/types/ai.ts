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
};

export type AiRecommendationResponse = {
  descriptor: SceneDescriptor;
};

export type RecommendRequestBody = {
  prompt?: string;
  mood?: string;
  visual?: string;
};
