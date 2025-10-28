import type { WorldMoodDescriptor } from "~/types/ai";

type SceneListener = (descriptor: WorldMoodDescriptor | null) => void;

class SceneManager {
  private descriptor: WorldMoodDescriptor | null = null;
  private listeners = new Set<SceneListener>();

  get currentDescriptor() {
    return this.descriptor;
  }

  getDescriptor() {
    return this.descriptor;
  }

  setDescriptor(descriptor: WorldMoodDescriptor | null) {
    this.descriptor = descriptor;
    for (const listener of this.listeners) {
      try {
        listener(this.descriptor);
      } catch (error) {
        console.error("SceneManager listener error", error);
      }
    }
  }

  subscribe(listener: SceneListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const sceneManager = new SceneManager();
export type { SceneListener };
