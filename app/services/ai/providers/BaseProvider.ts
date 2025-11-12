import type { SceneDescriptor } from "~/scenes/types";

export type ProviderSceneIntent = {
  preferredCountries?: string[];
  preferredLanguages?: string[];
  preferredTags?: string[];
  favoriteStationIds?: string[];
  recentStationIds?: string[];
};

export type ProviderSceneContext = {
  intent?: ProviderSceneIntent;
};

export interface AiProvider {
  getSceneDescriptor(
    prompt: string,
    context?: ProviderSceneContext
  ): Promise<SceneDescriptor>;
}

export type SceneDescriptorParser = (raw: unknown) => SceneDescriptor;
