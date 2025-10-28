import type { Station } from "~/types/radio";

export type SceneDescriptor = {
  stations: Station[];
  mood?: string | null;
  animation?: Record<string, unknown> | null;
};

export type SceneComponentProps = {
  descriptor: SceneDescriptor;
  activeStationId?: string | null;
  onStationSelect?: (station: Station) => void;
  className?: string;
};

export type SceneComponent = (props: SceneComponentProps) => JSX.Element | null;
