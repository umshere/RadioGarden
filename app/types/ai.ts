export type DescriptorStatus = "idle" | "loading" | "success" | "error";

export type AiDescriptorState = {
  status: DescriptorStatus;
  mood: string | null;
  transcript: string | null;
  descriptor: string | null;
  error: string | null;
  updatedAt: number | null;
};

export type VoiceCommandPayload = {
  mood: string;
  transcript: string;
};

export type AiOrchestratorResponse = {
  descriptor: string;
  mood?: string;
  tags?: string[];
};
