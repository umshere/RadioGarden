import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import type { SceneDescriptor } from "~/scenes/types";
import type { Station } from "~/types/radio";

const sceneLoaders: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  atlas: () => import("~/scenes/AtlasScene"),
  "3d_globe": () => import("~/scenes/3d_globe"),
  card_stack: () => import("~/scenes/card_stack"),
};

type SceneManagerProps = {
  descriptor: SceneDescriptor | null;
  activeStationId?: string | null;
  onStationSelect?: (station: Station) => void;
  className?: string;
  fallback?: ReactNode;
  empty?: ReactNode;
};

export function SceneManager({
  descriptor,
  activeStationId,
  onStationSelect,
  className,
  fallback = null,
  empty = null,
}: SceneManagerProps) {
  const [SceneComponent, setSceneComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const visual = descriptor?.visual;

  useEffect(() => {
    let cancelled = false;

    if (!visual) {
      setSceneComponent(null);
      setError(null);
      return;
    }

    const loader = sceneLoaders[visual];
    if (!loader) {
      console.error(`Scene "${visual}" not found in registry.`);
      setError(new Error(`Scene "${visual}" not registered.`));
      setSceneComponent(null);
      return;
    }

    setError(null);
    setSceneComponent(null);

    loader()
      .then((module) => {
        if (cancelled) return;
        const resolved = (module as { default?: ComponentType<any> }).default;
        if (!resolved) {
          setError(new Error(`Scene "${visual}" did not export a default component.`));
          return;
        }
        setSceneComponent(() => resolved);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`Failed to load scene "${visual}"`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, [visual]);

  const sceneProps = useMemo(
    () => ({
      descriptor,
      activeStationId,
      onStationSelect,
      className,
    }),
    [descriptor, activeStationId, onStationSelect, className]
  );

  if (!descriptor) {
    return <>{empty}</>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-sm text-red-300">
        <strong className="text-base font-semibold">We couldn't load this scene.</strong>
        <span>{error.message}</span>
      </div>
    );
  }

  if (!SceneComponent) {
    return <>{fallback}</>;
  }

  return <SceneComponent {...sceneProps} />;
}

export type { SceneDescriptor };
