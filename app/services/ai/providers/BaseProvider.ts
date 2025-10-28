import type { SceneDescriptor } from "~/scenes/types";

export interface AiProvider {
  getSceneDescriptor(prompt: string): Promise<SceneDescriptor>;
}

export type SceneDescriptorParser = (raw: unknown) => SceneDescriptor;
