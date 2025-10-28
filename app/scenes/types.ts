import type { Station } from "~/types/radio";

export type PlaybackStrategy = "autoplay_first" | "queue_only" | "preview_on_hover";

export interface ScenePlayOptions {
  strategy: PlaybackStrategy;
  crossfadeMs?: number;
}

export interface SceneDescriptor {
  visual: string;
  mood?: string;
  animation?: string;
  play?: ScenePlayOptions;
  stations: Station[];
  reason?: string;
}

export type SceneComponentProps = {
  descriptor: SceneDescriptor;
  activeStationId?: string | null;
  onStationSelect?: (station: Station) => void;
  className?: string;
};

export type SceneComponent = (props: SceneComponentProps) => JSX.Element | null;
