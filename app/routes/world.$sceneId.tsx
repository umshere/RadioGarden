import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, type MetaFunction } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader, Text, Badge } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

import { SceneManager } from "~/components/SceneManager";
import PassportStampIcon from "~/components/PassportStampIcon";
import WhyTheseChip from "~/components/WhyTheseChip";
import VoiceInput from "~/voice/VoiceInput";
import type { SceneDescriptor } from "~/scenes/types";
import { usePlayerStore } from "~/state/playerStore";
import { useFavorites } from "~/hooks/useFavorites";
import { useRecentStations } from "~/hooks/useRecentStations";
import JourneyComposer from "~/components/JourneyComposer";

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
  const { favoriteStationIds } = useFavorites();
  const { recentStations } = useRecentStations();

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
      formData.append("scene", scene.id);
      formData.append("sceneId", scene.id);

      const includeListeningContext = !payload.prompt && !payload.mood;

      if (includeListeningContext && nowPlaying?.uuid) {
        formData.append("currentStationId", nowPlaying.uuid);
      }

      if (includeListeningContext) {
        const countryContext = nowPlaying?.country ?? undefined;
        const languageContext = nowPlaying?.language ?? undefined;
        if (countryContext) {
          formData.append("country", countryContext);
          formData.append("preferredCountries", countryContext);
        }
        if (languageContext) {
          formData.append("language", languageContext);
          formData.append("preferredLanguages", languageContext);
        }
      }

      Array.from(favoriteStationIds).forEach((id) =>
        formData.append("favoriteStationIds", id)
      );
      recentStations.forEach((station) =>
        formData.append("recentStationIds", station.uuid)
      );

      fetcher.submit(formData, { method: "post", action: "/api/ai/recommend" });
      setLastRequestLabel(payload.prompt ?? payload.mood ?? scene.label);
    },
    [
      fetcher,
      scene.visual,
      scene.label,
      scene.id,
      nowPlaying?.uuid,
      nowPlaying?.country,
      nowPlaying?.language,
      favoriteStationIds,
      recentStations,
    ]
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

  const hasDescriptor = !!descriptor;
  const isOracleState = !hasDescriptor && (status === "idle" || status === "error");

  return (
    <div
      className="min-h-screen text-slate-900 relative overflow-hidden"
      style={{
        background: "#f8fafc",
      }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url('/texture.png')", mixBlendMode: "multiply" }}
        />
        <div className="absolute -top-40 left-[-10%] w-[60%] h-[60%] bg-sky-200/40 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-30%] right-[-5%] w-[50%] h-[50%] bg-rose-200/30 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
      </div>

      <div
        className="relative mx-auto flex h-full min-h-screen flex-col px-4 pt-6 md:px-6"
        style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Header - Scene Navigation */}
        <header className={`flex items-center justify-center transition-all duration-500 ${isOracleState ? "py-10" : "py-6"}`}>
          {/* Scene Pills - Only show in Journey state */}
          {!isOracleState && (
            <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 px-2 py-1 shadow-sm backdrop-blur-lg">
              {scenes.map(({ id, label }) => {
                const active = id === scene.id;
                return (
                  <Link
                    key={id}
                    to={`/world/${id}`}
                    className={`px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.35em] rounded-full transition-all ${active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative">

          {/* ORACLE STATE: Centered Prompt */}
          {isOracleState && (
            <div className="flex-1 flex flex-col items-center justify-center -mt-20 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">
              <div className="mb-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[0.65rem] font-semibold uppercase tracking-[0.35em] shadow-sm">
                  <IconSparkles size={12} />
                  <span>Vibe Engine</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                  Where to next?
                </h1>
                <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                  Describe a mood, a memory, or a place. The AI will curate a journey just for you.
                </p>
              </div>

              <JourneyComposer
                hero
                tone="light"
                value={inputPrompt}
                onChange={setInputPrompt}
                onSubmit={({ prompt }) => {
                  const nextPrompt = (prompt ?? "").trim();
                  if (!nextPrompt) return;
                  setInputPrompt(nextPrompt);
                  runDescriptorRequest({ prompt: nextPrompt });
                }}
                loading={false}
                placeholder="e.g. 'Cyberpunk Tokyo rain' or '70s road trip'"
                ctaLabel="Curate Journey"
                secondarySlot={
                  <div className="flex justify-center">
                    <VoiceInput
                      onTranscript={handleVoiceTranscript}
                      onStatusChange={(_, message) => setVoiceMessage(message ?? null)}
                      disabled={false}
                    />
                  </div>
                }
              />

              {/* Quick Suggestions */}
              <div className="mt-12 flex flex-wrap justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                {["Midnight Jazz in Paris", "Lofi Study Beats", "High Energy Gym", "Sunday Morning Coffee"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInputPrompt(suggestion);
                      runDescriptorRequest({ prompt: suggestion });
                    }}
                    className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-900 transition-all shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* JOURNEY STATE: Results & Floating Controls */}
          {!isOracleState && (
            <div className="flex-1 relative flex flex-col h-full">
              {/* The Scene (Card Stack) */}
              <div className="flex-1 relative rounded-[32px] overflow-hidden border border-slate-200 bg-white/40 shadow-xl backdrop-blur-2xl">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 via-transparent to-slate-100/20" aria-hidden />
                {descriptor ? (
                  <SceneManager
                    descriptor={descriptor}
                    activeStationId={nowPlaying?.uuid}
                    onStationSelect={handleStationSelect}
                    className="h-full absolute inset-0 z-10"
                    fallback={<SceneLoadingFallback />}
                    sceneStatus={sceneStatus}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CuratingOverlay title={loadingTitle} hint={loadingHint} steps={LOADING_STEPS} />
                  </div>
                )}
              </div>

              {/* Floating Control Bar (Compact Composer) */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-10 md:hidden">
                <div className="pointer-events-auto shadow-xl">
                  <JourneyComposer
                    compact
                    tone="light"
                    value={inputPrompt}
                    onChange={setInputPrompt}
                    onSubmit={({ prompt }) => {
                      const nextPrompt = (prompt ?? "").trim();
                      if (!nextPrompt) return;
                      setInputPrompt(nextPrompt);
                      runDescriptorRequest({ prompt: nextPrompt });
                    }}
                    loading={status === "loading"}
                    placeholder="Refine your vibe..."
                    ctaLabel="Update"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/80 px-6 text-center text-slate-900 backdrop-blur-xl border border-slate-200">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.65em] text-slate-500">
        <span className="h-2 w-2 rounded-full bg-emerald-500">
          <span className="block h-2 w-2 animate-ping rounded-full bg-emerald-400" aria-hidden="true" />
        </span>
        Curating your musical journey
      </div>
      <div className="max-w-xl space-y-3">
        <p className="text-2xl font-bold leading-snug text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">
          <span className="inline-block animate-pulse text-base text-slate-700">{hint}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.35em] text-slate-400">
        {steps.map((step) => (
          <span key={step} className="flex items-center gap-1 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyPromptState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-slate-500">
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-4 text-indigo-500">
        <IconSparkles size={32} />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">Ask the Passport for a vibe</p>
        <p className="text-sm text-slate-500">Try prompts like “psychedelic fusion jazz” or “slow morning in Paris”.</p>
      </div>
    </div>
  );
}

function SceneLoadingFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
      <Loader color="ocean.6" size="lg" />
      <p>Preparing the card stack…</p>
    </div>
  );
}
