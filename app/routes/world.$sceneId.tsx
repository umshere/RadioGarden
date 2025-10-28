import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Loader, Text, TextInput, Badge } from "@mantine/core";
import { IconSparkles, IconArrowNarrowRight } from "@tabler/icons-react";

import { SceneManager } from "~/components/SceneManager";
import PassportStampIcon from "~/components/PassportStampIcon";
import WhyTheseChip from "~/components/WhyTheseChip";
import VoiceInput from "~/voice/VoiceInput";
import { loadWorldDescriptor } from "~/services/aiOrchestrator";
import type { SceneDescriptor } from "~/scenes/types";

const SCENES = [
  {
    id: "atlas",
    label: "Atlas",
    visual: "atlas",
    description: "Browse world missions while your player keeps singing.",
  },
  {
    id: "globe",
    label: "3D Globe",
    visual: "3d_globe",
    description: "Spin the Earth and drop into live stations.",
  },
  {
    id: "cards",
    label: "Card Stack",
    visual: "card_stack",
    description: "Swipe through curated station stacks from around the world.",
  },
] as const;

type SceneMeta = (typeof SCENES)[number];

type LoaderData = {
  scene: SceneMeta;
  scenes: SceneMeta[];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const sceneId = params.sceneId ?? SCENES[0]!.id;
  const scene = SCENES.find((candidate) => candidate.id === sceneId);

  if (!scene) {
    throw new Response("Scene not found", { status: 404 });
  }

  return json<LoaderData>({ scene, scenes: SCENES });
}

type RequestStatus = "idle" | "loading" | "success" | "error";

export default function WorldSceneRoute() {
  const { scene, scenes } = useLoaderData<typeof loader>();
  const [descriptor, setDescriptor] = useState<SceneDescriptor | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [lastRequestLabel, setLastRequestLabel] = useState<string | null>(null);
  const [stampKey, setStampKey] = useState<number>(() => Date.now());
  const abortRef = useRef<AbortController | null>(null);

  const runDescriptorRequest = useCallback(
    async (payload: { prompt?: string; mood?: string } = {}) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setError(null);
      setVoiceMessage(null);

      try {
        const nextDescriptor = await loadWorldDescriptor({
          signal: controller.signal,
          prompt: payload.prompt,
          mood: payload.mood,
          visual: scene.visual,
        });

        if (controller.signal.aborted) {
          return;
        }

        setDescriptor(nextDescriptor);
        setStatus("success");
        setStampKey(Date.now());
        setLastRequestLabel(payload.prompt ?? payload.mood ?? scene.label);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        const message = err instanceof Error ? err.message : "We couldn't load a descriptor.";
        setError(message);
        setStatus("error");
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [scene.visual, scene.label]
  );

  useEffect(() => {
    void runDescriptorRequest();
    return () => {
      abortRef.current?.abort();
    };
  }, [runDescriptorRequest]);

  const handlePromptSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const prompt = inputPrompt.trim();
      if (!prompt) return;
      setInputPrompt(prompt);
      await runDescriptorRequest({ prompt });
    },
    [inputPrompt, runDescriptorRequest]
  );

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      setInputPrompt(transcript);
      void runDescriptorRequest({ prompt: transcript });
    },
    [runDescriptorRequest]
  );

  const subtitle = useMemo(() => {
    if (status === "loading") {
      return lastRequestLabel ? `Curating ${lastRequestLabel}…` : "Curating a fresh world scene…";
    }
    if (status === "error" && error) {
      return error;
    }
    if (descriptor && lastRequestLabel) {
      return `Curated for ${lastRequestLabel}`;
    }
    return scene.description;
  }, [status, lastRequestLabel, descriptor, scene.description, error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-sm font-semibold text-slate-200" prefetch="intent">
            ← Back to Local
          </Link>
          <nav className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-300">
            {scenes.map((candidate) =>
              candidate.id === scene.id ? (
                <span key={candidate.id} className="rounded-full bg-white/10 px-3 py-1 text-slate-100" aria-current="page">
                  {candidate.label}
                </span>
              ) : (
                <Link
                  key={candidate.id}
                  to={`/world/${candidate.id}`}
                  className="rounded-full px-3 py-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                  prefetch="intent"
                >
                  {candidate.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col gap-8 px-6 py-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Text fw={600} fz="lg" className="text-slate-100">
                World Mode · {scene.label}
              </Text>
              <Text fz="sm" c="rgba(226,239,245,0.72)">
                {subtitle}
              </Text>
            </div>
            {descriptor && status === "success" && (
              <div className="flex items-center gap-3">
                <WhyTheseChip descriptor={descriptor} />
                <PassportStampIcon key={stampKey} size={64} />
              </div>
            )}
          </div>

          <form onSubmit={handlePromptSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TextInput
              value={inputPrompt}
              onChange={(event) => setInputPrompt(event.currentTarget.value)}
              placeholder="Try “psychedelic jazz from Brazil”"
              className="flex-1"
              size="md"
              disabled={status === "loading"}
              data-autofocus
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="md"
                radius="xl"
                leftSection={<IconSparkles size={16} />}
                loading={status === "loading"}
              >
                Curate
              </Button>
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onStatusChange={(_, message) => setVoiceMessage(message ?? null)}
                disabled={status === "loading"}
              />
            </div>
          </form>

          {voiceMessage && (
            <Text fz="xs" c="rgba(239, 246, 255, 0.65)">
              {voiceMessage}
            </Text>
          )}

          {status === "error" && error && (
            <Badge color="red" variant="light" radius="xl">
              {error}
            </Badge>
          )}

          <div className="relative min-h-[28rem] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <SceneManager
              descriptor={descriptor}
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader color="ocean.4" size="lg" />
                </div>
              }
              empty={
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-200/80">
                  <IconArrowNarrowRight size={32} />
                  <p>Ask the Passport for a mood to load a world scene.</p>
                </div>
              }
              className="h-full"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
