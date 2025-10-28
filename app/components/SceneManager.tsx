import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";

export type SceneDescriptor = {
  id: string;
  component: string;
  props?: Record<string, unknown>;
};

type SceneManagerProps = {
  descriptor: SceneDescriptor | null;
  fallback?: ReactNode;
  empty?: ReactNode;
};

type LoadedScene = ComponentType<any>;

export function SceneManager({ descriptor, fallback = null, empty = null }: SceneManagerProps) {
  const [SceneComponent, setSceneComponent] = useState<LoadedScene | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const key = descriptor?.component ?? "__none__";

  useEffect(() => {
    let cancelled = false;

    if (!descriptor) {
      setSceneComponent(null);
      setError(null);
      return;
    }

    setError(null);
    setSceneComponent(null);

    import(
      /* @vite-ignore */ `~/scenes/${descriptor.component}`
    )
      .then((module) => {
        if (cancelled) return;
        const resolved = (module as { default?: LoadedScene }).default;
        if (!resolved) {
          setError(
            new Error(
              `Scene "${descriptor.component}" does not export a default React component.`
            )
          );
          return;
        }
        setSceneComponent(() => resolved);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`Failed to load scene "${descriptor.component}"`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, [key, descriptor]);

  const sceneProps = useMemo(() => descriptor?.props ?? {}, [descriptor?.props]);

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
