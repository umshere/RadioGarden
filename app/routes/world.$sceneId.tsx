import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, type MetaFunction } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Loader, Text, TextInput, Badge } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

import { SceneManager } from "~/components/SceneManager";
import PassportStampIcon from "~/components/PassportStampIcon";
import WhyTheseChip from "~/components/WhyTheseChip";
import VoiceInput from "~/voice/VoiceInput";
import type { SceneDescriptor } from "~/scenes/types";
import { usePlayerStore } from "~/state/playerStore";

const SCENES = [
  {
    id: "cards",
    label: "Card Stack",
    visual: "card_stack",
    description: "AI-crafted story cards that highlight every curated station.",
  },
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
] as const;

const LOADING_HINTS = [
  "Discovering stations…",
  "Analyzing vibes…",
  "Sequencing your journey…",
  "Scoring stream health…",
] as const;

const LOADING_STEPS = [
  "Discovering stations",
  "Analyzing vibes",
  "Sequencing story",
] as const;

type SceneMeta = (typeof SCENES)[number];

type LoaderData = {
  scene: SceneMeta;
  scenes: readonly SceneMeta[];
};

type FetcherData = {
  descriptor?: SceneDescriptor;
  error?: string;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Radio Passport | ${data?.scene.label}` }];
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
  const fetcher = useFetcher<FetcherData>();
  const [descriptor, setDescriptor] = useState<SceneDescriptor | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [lastRequestLabel, setLastRequestLabel] = useState<string | null>(null);
  const [stampKey, setStampKey] = useState<number>(() => Date.now());
  const [loadingHintIndex, setLoadingHintIndex] = useState(0);
  const startStation = usePlayerStore((state) => state.startStation);
  const nowPlaying = usePlayerStore((state) => state.nowPlaying);

  const status: RequestStatus =
    fetcher.state === "submitting" || fetcher.state === "loading"
      ? "loading"
      : fetcher.data?.error
      ? "error"
      : fetcher.data?.descriptor
      ? "success"
      : "idle";
  const error = fetcher.data?.error;

  useEffect(() => {
    if (fetcher.data?.descriptor) {
      setDescriptor(fetcher.data.descriptor);
      setStampKey(Date.now());
    }
  }, [fetcher.data]);

  const handleStationSelect = useCallback(
    (station: SceneDescriptor["stations"][number]) => {
      startStation(station, { autoPlay: true });
    },
    [startStation]
  );

  const runDescriptorRequest = useCallback(
    (payload: { prompt?: string; mood?: string } = {}) => {
      const formData = new FormData();
      if (payload.prompt) formData.append("prompt", payload.prompt);
      if (payload.mood) formData.append("mood", payload.mood);
      formData.append("visual", scene.visual);
      fetcher.submit(formData, { method: "post", action: "/api/ai/recommend" });
      setLastRequestLabel(payload.prompt ?? payload.mood ?? scene.label);
    },
    [fetcher, scene.visual, scene.label]
  );

  useEffect(() => {
    runDescriptorRequest();
  }, []);

  useEffect(() => {
    if (status !== "loading") {
      setLoadingHintIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingHintIndex((index) => (index + 1) % LOADING_HINTS.length);
    }, 2400);

    return () => {
      window.clearInterval(timer);
    };
  }, [status]);

  const handlePromptSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const prompt = inputPrompt.trim();
      if (!prompt) return;
      setInputPrompt(prompt);
      runDescriptorRequest({ prompt });
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

  const loadingHint = LOADING_HINTS[loadingHintIndex] ?? LOADING_HINTS[0]!;
  const loadingTitle = descriptor?.mood ?? lastRequestLabel ?? "Curating your musical journey";
  const sceneStatus = useMemo(
    () => ({
      isLoading: status === "loading",
      title: loadingTitle,
      hint: loadingHint,
      steps: LOADING_STEPS,
    }),
    [status, loadingTitle, loadingHint]
  );

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
          <form onSubmit={handlePromptSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TextInput
              value={inputPrompt}
              onChange={(event) => setInputPrompt(event.currentTarget.value)}
              placeholder="Filter stations..."
              className="flex-1"
              size="md"
              disabled={status === "loading"}
              type="search"
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
                Refine Mix
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

          <div className="relative min-h-[48rem] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            {descriptor ? (
              <SceneManager
                descriptor={descriptor}
                activeStationId={nowPlaying?.uuid}
                onStationSelect={handleStationSelect}
                className="h-full min-h-[48rem]"
                fallback={<SceneLoadingFallback />}
                sceneStatus={sceneStatus}
              />
            ) : status !== "loading" ? (
              <EmptyPromptState />
            ) : null}

            {status === "loading" && !descriptor && (
              <CuratingOverlay title={loadingTitle} hint={loadingHint} steps={LOADING_STEPS} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

type CuratingOverlayProps = {
  title: string;
  hint: string;
  steps: readonly string[];
};

function CuratingOverlay({ title, hint, steps }: CuratingOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-950/85 px-6 text-center text-slate-100 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.65em] text-slate-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400">
          <span className="block h-2 w-2 animate-ping rounded-full bg-emerald-300" aria-hidden="true" />
        </span>
        Curating your musical journey
      </div>
      <div className="max-w-xl space-y-3">
        <p className="text-2xl font-semibold leading-snug text-white">{title}</p>
        <p className="text-sm text-slate-300">
          <span className="inline-block animate-pulse text-base text-slate-100/90">{hint}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-400">
        {steps.map((step) => (
          <span key={step} className="flex items-center gap-1 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" aria-hidden="true" />
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyPromptState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-slate-200/85">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-indigo-100">
        <IconSparkles size={32} />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-50">Ask the Passport for a vibe</p>
        <p className="text-sm text-slate-300">Try prompts like “psychedelic fusion jazz” or “slow morning in Paris”.</p>
      </div>
    </div>
  );
}

function SceneLoadingFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-200/80">
      <Loader color="ocean.4" size="lg" />
      <p>Preparing the card stack…</p>
    </div>
  );
}
