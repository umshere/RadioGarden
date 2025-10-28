import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Loader } from "@mantine/core";
import { SceneManager, type SceneDescriptor } from "~/components/SceneManager";

type LoaderData = {
  descriptor: SceneDescriptor;
  scenes: SceneDescriptor[];
};

const SCENES: SceneDescriptor[] = [
  {
    id: "atlas",
    component: "AtlasScene",
    props: {
      title: "World Listening Atlas",
      description: "Browse immersive listening scenes while your queue keeps playing.",
    },
  },
];

export async function loader({ params }: LoaderFunctionArgs) {
  const sceneId = params.sceneId ?? "atlas";
  const descriptor = SCENES.find((scene) => scene.id === sceneId);

  if (!descriptor) {
    throw new Response("Scene not found", { status: 404 });
  }

  return json<LoaderData>({ descriptor, scenes: SCENES });
}

export default function WorldSceneRoute() {
  const { descriptor, scenes } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-sm font-semibold text-slate-100" prefetch="intent">
            Local experience
          </Link>
          <nav className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-300">
            {scenes.map((scene) => (
              <Link
                key={scene.id}
                to={scene.id === descriptor.id ? `#${scene.id}` : `/world/${scene.id}`}
                className={
                  scene.id === descriptor.id
                    ? "rounded-full bg-white/10 px-3 py-1 text-slate-100"
                    : "rounded-full px-3 py-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                }
                prefetch="intent"
              >
                {scene.id === "atlas" ? "Atlas" : scene.id}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <SceneManager
        descriptor={descriptor}
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader color="ocean.4" size="lg" />
          </div>
        }
        empty={
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-slate-300">
            <p className="text-lg font-semibold">Choose a scene to begin exploring the world.</p>
            <Link to="/world/atlas" className="text-ocean-3 underline" prefetch="intent">
              Jump to the Atlas scene
            </Link>
          </div>
        }
      />
    </div>
  );
}
