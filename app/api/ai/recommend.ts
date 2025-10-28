import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import type { PlaybackStrategy, SceneDescriptor } from "~/scenes/types";
import type { Station } from "~/types/radio";
import { getProvider } from "~/services/ai/providers";
import { rankStations } from "~/server/stations/ranking";
import { annotateHealth } from "~/server/stations/health";

const USE_MOCK = (process.env.USE_MOCK ?? "true").toLowerCase() === "true";

const BASE_STATIONS: Record<string, Station[]> = {
  "aurora-trails": [
    {
      uuid: "aurora-horizon-1",
      name: "Reykjavik Aurora FM",
      url: "https://streams.radio-passport.com/aurora",
      streamUrl: "https://streams.radio-passport.com/aurora",
      favicon: "/radio-passport-icon.png",
      country: "Iceland",
      countryCode: "IS",
      state: null,
      language: "Icelandic",
      languageCodes: ["is"],
      tags: "ambient,chill,northern lights",
      tagList: ["ambient", "chill", "northern lights"],
      bitrate: 192,
      codec: "mp3",
      homepage: "https://aurorafm.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Glacial pads and aurora-inspired textures drifting above Reykjavik.",
    },
    {
      uuid: "aurora-horizon-2",
      name: "Oslo Fjord Echoes",
      url: "https://streams.radio-passport.com/fjord",
      streamUrl: "https://streams.radio-passport.com/fjord",
      favicon: "/radio-passport-icon.png",
      country: "Norway",
      countryCode: "NO",
      state: null,
      language: "Norwegian",
      languageCodes: ["no"],
      tags: "downtempo,scandinavian",
      tagList: ["downtempo", "scandinavian"],
      bitrate: 160,
      codec: "aac",
      homepage: "https://fjordechoes.example.com",
      hls: true,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Nordic downtempo with soft shoreline field recordings.",
    },
    {
      uuid: "aurora-horizon-3",
      name: "Svalbard Signal",
      url: "https://streams.radio-passport.com/svalbard",
      streamUrl: "https://streams.radio-passport.com/svalbard",
      favicon: "/radio-passport-icon.png",
      country: "Norway",
      countryCode: "NO",
      state: "Svalbard",
      language: "English",
      languageCodes: ["en"],
      tags: "arctic,ambient",
      tagList: ["arctic", "ambient"],
      bitrate: 128,
      codec: "mp3",
      homepage: "https://svalbard-signal.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Slow-blooming drones captured beneath polar twilight.",
    },
    {
      uuid: "aurora-horizon-4",
      name: "Helsinki Polar Jazz",
      url: "https://streams.radio-passport.com/polarjazz",
      streamUrl: "https://streams.radio-passport.com/polarjazz",
      favicon: "/radio-passport-icon.png",
      country: "Finland",
      countryCode: "FI",
      state: null,
      language: "Finnish",
      languageCodes: ["fi"],
      tags: "jazz,night",
      tagList: ["jazz", "night"],
      bitrate: 192,
      codec: "mp3",
      homepage: "https://polarnightjazz.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Late-night Nordic jazz with frosted brass and vinyl crackle.",
    },
  ],
  "desert-nocturne": [
    {
      uuid: "desert-night-1",
      name: "Marrakesh Midnight Market",
      url: "https://streams.radio-passport.com/marrakesh",
      streamUrl: "https://streams.radio-passport.com/marrakesh",
      favicon: "/radio-passport-icon.png",
      country: "Morocco",
      countryCode: "MA",
      state: null,
      language: "Arabic",
      languageCodes: ["ar"],
      tags: "gnawa,desert",
      tagList: ["gnawa", "desert"],
      bitrate: 160,
      codec: "aac",
      homepage: "https://midnightmarket.example.com",
      hls: true,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Gnawa rhythms weaving through the echo of lantern-lit souks.",
    },
    {
      uuid: "desert-night-2",
      name: "Cairo Rooftop Breeze",
      url: "https://streams.radio-passport.com/cairo",
      streamUrl: "https://streams.radio-passport.com/cairo",
      favicon: "/radio-passport-icon.png",
      country: "Egypt",
      countryCode: "EG",
      state: null,
      language: "Arabic",
      languageCodes: ["ar"],
      tags: "lounge,oriental",
      tagList: ["lounge", "oriental"],
      bitrate: 128,
      codec: "mp3",
      homepage: "https://cairorooftop.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Midnight oud sessions drifting over warm city air.",
    },
    {
      uuid: "desert-night-3",
      name: "Doha Mirage Lounge",
      url: "https://streams.radio-passport.com/doha",
      streamUrl: "https://streams.radio-passport.com/doha",
      favicon: "/radio-passport-icon.png",
      country: "Qatar",
      countryCode: "QA",
      state: null,
      language: "Arabic",
      languageCodes: ["ar"],
      tags: "chillout,night",
      tagList: ["chillout", "night"],
      bitrate: 192,
      codec: "mp3",
      homepage: "https://dohamirage.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Desert breeze lounge with low-slung bass and oud flourishes.",
    },
    {
      uuid: "desert-night-4",
      name: "Riyadh Night Caravan",
      url: "https://streams.radio-passport.com/riyadh",
      streamUrl: "https://streams.radio-passport.com/riyadh",
      favicon: "/radio-passport-icon.png",
      country: "Saudi Arabia",
      countryCode: "SA",
      state: null,
      language: "Arabic",
      languageCodes: ["ar"],
      tags: "electronic,desert",
      tagList: ["electronic", "desert"],
      bitrate: 160,
      codec: "aac",
      homepage: "https://nightcaravan.example.com",
      hls: true,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Desert electronica with distant caravan percussion.",
    },
  ],
  "harbor-dawn": [
    {
      uuid: "harbor-dawn-1",
      name: "Lisbon Harbor Daybreak",
      url: "https://streams.radio-passport.com/lisbon",
      streamUrl: "https://streams.radio-passport.com/lisbon",
      favicon: "/radio-passport-icon.png",
      country: "Portugal",
      countryCode: "PT",
      state: null,
      language: "Portuguese",
      languageCodes: ["pt"],
      tags: "bossa nova,sunrise",
      tagList: ["bossa nova", "sunrise"],
      bitrate: 160,
      codec: "aac",
      homepage: "https://harbordaybreak.example.com",
      hls: true,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Sun-warmed bossa nova echoing from Alfama balconies.",
    },
    {
      uuid: "harbor-dawn-2",
      name: "Cape Town Morning Currents",
      url: "https://streams.radio-passport.com/capetown",
      streamUrl: "https://streams.radio-passport.com/capetown",
      favicon: "/radio-passport-icon.png",
      country: "South Africa",
      countryCode: "ZA",
      state: null,
      language: "English",
      languageCodes: ["en"],
      tags: "afro-jazz,sunrise",
      tagList: ["afro-jazz", "sunrise"],
      bitrate: 192,
      codec: "mp3",
      homepage: "https://morningcurrents.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Afro-jazz sunrise sets with gulls and harbor bells.",
    },
    {
      uuid: "harbor-dawn-3",
      name: "Hong Kong Harbor Haze",
      url: "https://streams.radio-passport.com/hongkong",
      streamUrl: "https://streams.radio-passport.com/hongkong",
      favicon: "/radio-passport-icon.png",
      country: "Hong Kong",
      countryCode: "HK",
      state: null,
      language: "Cantonese",
      languageCodes: ["yue"],
      tags: "city pop,morning",
      tagList: ["city pop", "morning"],
      bitrate: 160,
      codec: "aac",
      homepage: "https://harborhaze.example.com",
      hls: true,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Soft city pop with ferry horn interludes at dawn.",
    },
    {
      uuid: "harbor-dawn-4",
      name: "Seattle Mist Radio",
      url: "https://streams.radio-passport.com/seattle",
      streamUrl: "https://streams.radio-passport.com/seattle",
      favicon: "/radio-passport-icon.png",
      country: "United States",
      countryCode: "US",
      state: "Washington",
      language: "English",
      languageCodes: ["en"],
      tags: "indie,coffeehouse",
      tagList: ["indie", "coffeehouse"],
      bitrate: 192,
      codec: "mp3",
      homepage: "https://seattlemist.example.com",
      hls: false,
      lastCheckOk: true,
      lastCheckOkTime: null,
      lastCheckTime: null,
      lastLocalCheckTime: null,
      sslError: false,
      votes: 0,
      clickCount: 0,
      clickTrend: 0,
      highlight: "Coffeehouse indie with rain-soaked vinyl textures.",
    },
  ],
};

type MockSceneDefinition = {
  id: string;
  slug: string;
  label: string;
  mood: string;
  summary: string;
  narrative: string;
  keywords: string[];
  visual: string;
  animation?: string;
  playback: {
    strategy: string;
    crossfadeSeconds: number;
  };
  stations: Station[];
  reason: string;
};

type RecommendRequest = {
  prompt?: string | null;
  mood?: string | null;
  visual?: string | null;
  scene?: string | null;
};

type AiRecommendationResponse = {
  descriptor: SceneDescriptor;
};

const DESCRIPTORS: MockSceneDefinition[] = [
  {
    id: "descriptor-aurora-trails",
    slug: "aurora-trails",
    label: "Aurora Trails",
    mood: "Luminous & Serene",
    summary: "Arctic calm washed in shimmering synths and radio snow.",
    narrative:
      "Follow the aurora from Reykjavik to Helsinki with stations that glow like polar dawn, blending ambient pads, jazz, and midnight field recordings.",
    keywords: [
      "aurora",
      "arctic",
      "nordic",
      "ambient",
      "iceland",
      "snow",
      "jazz",
    ],
    visual: "3d_globe",
    animation: "slow-orbit",
    playback: {
      strategy: "autoplay-first",
      crossfadeSeconds: 12,
    },
    stations: BASE_STATIONS["aurora-trails"]!,
    reason: "Polar ambient, Nordic jazz, and hi-bitrate aurora stations",
  },
  {
    id: "descriptor-desert-nocturne",
    slug: "desert-nocturne",
    label: "Desert Nocturne",
    mood: "Velvet Twilight",
    summary: "Warm desert winds with hypnotic midnight grooves.",
    narrative:
      "Glide between Marrakesh rooftops and Doha lounges as oud, electronic pulses, and lantern-lit percussion guide you through the hush of desert midnight.",
    keywords: ["desert", "midnight", "oud", "north africa", "gulf", "twilight"],
    visual: "card_stack",
    animation: "slow-pan",
    playback: {
      strategy: "respect-current",
      crossfadeSeconds: 8,
    },
    stations: BASE_STATIONS["desert-nocturne"]!,
    reason: "Desert nocturne moods with oud, downtempo, and Gulf lounge cuts",
  },
  {
    id: "descriptor-harbor-dawn",
    slug: "harbor-dawn",
    label: "Harbor Dawn",
    mood: "Optimistic & Breezy",
    summary: "Coastal mornings steeped in jazz, city pop, and salt air.",
    narrative:
      "From Lisbon's tiled hills to Hong Kong's ferries, greet the sunrise with breezy rhythms, gulls in the distance, and coffeehouse warmth.",
    keywords: ["harbor", "sunrise", "bossa", "city pop", "coastal"],
    visual: "3d_globe",
    animation: "sunrise-spin",
    playback: {
      strategy: "autoplay-first",
      crossfadeSeconds: 6,
    },
    stations: BASE_STATIONS["harbor-dawn"]!,
    reason: "Sunrise jazz, coastal city pop, and warm atlantic breezes",
  },
];

function mapPlaybackStrategy(value: string): PlaybackStrategy {
  switch (value) {
    case "autoplay-first":
      return "autoplay_first";
    case "queue-only":
      return "queue_only";
    case "preview-on-hover":
      return "preview_on_hover";
    case "respect-current":
      return "queue_only";
    default:
      return "autoplay_first";
  }
}

function toSceneDescriptor(definition: MockSceneDefinition): SceneDescriptor {
  const strategy = mapPlaybackStrategy(definition.playback.strategy);
  const crossfadeMs = Math.max(0, Math.round(definition.playback.crossfadeSeconds * 1000));

  return {
    visual: definition.visual,
    mood: definition.mood,
    animation: definition.animation,
    play: {
      strategy,
      ...(crossfadeMs > 0 ? { crossfadeMs } : {}),
    },
    stations: definition.stations.map((station) => ({ ...station })),
    reason: definition.reason || definition.summary,
  };
}

function selectMockScene(request: RecommendRequest): MockSceneDefinition {
  const normalizedScene = request.scene?.toLowerCase().trim() ?? null;
  if (normalizedScene) {
    const match = DESCRIPTORS.find(
      (descriptor) => descriptor.slug === normalizedScene || descriptor.visual === normalizedScene
    );
    if (match) {
      return match;
    }
  }

  const normalizedVisual = request.visual?.toLowerCase().trim() ?? null;
  if (normalizedVisual) {
    const match = DESCRIPTORS.find((descriptor) => descriptor.visual === normalizedVisual);
    if (match) {
      return match;
    }
  }

  const prompt = `${request.prompt ?? ""} ${request.mood ?? ""}`.toLowerCase();
  if (prompt.trim().length > 0) {
    const scored = DESCRIPTORS.map((descriptor) => {
      const score = descriptor.keywords.reduce((acc, keyword) => {
        return prompt.includes(keyword.toLowerCase()) ? acc + 1 : acc;
      }, 0);
      return { descriptor, score } as const;
    }).sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score > 0) {
      return scored[0].descriptor;
    }
  }

  return DESCRIPTORS[Math.floor(Math.random() * DESCRIPTORS.length)] ?? DESCRIPTORS[0]!;
}

async function resolveDescriptor(request: RecommendRequest): Promise<SceneDescriptor> {
  if (USE_MOCK) {
    return toSceneDescriptor(selectMockScene(request));
  }

  const provider = getProvider();
  const prompt =
    request.prompt ??
    request.mood ??
    request.scene ??
    request.visual ??
    "Curate a transportive radio journey with mood, animation, and stations.";
  const descriptor = await provider.getSceneDescriptor(prompt);

  return {
    ...descriptor,
    play: descriptor.play ?? { strategy: "autoplay_first" },
  };
}

function applyPostProcessing(descriptor: SceneDescriptor, request: RecommendRequest): SceneDescriptor {
  const ranked = rankStations(descriptor.stations, {
    prompt: request.prompt ?? null,
    mood: request.mood ?? null,
  });
  const withHealth = annotateHealth(ranked);

  return {
    ...descriptor,
    stations: withHealth,
  };
}

async function getRecommendation(request: RecommendRequest): Promise<SceneDescriptor> {
  const descriptor = await resolveDescriptor(request);
  return applyPostProcessing(descriptor, request);
}

function buildResponse(descriptor: SceneDescriptor) {
  const payload: AiRecommendationResponse = { descriptor };
  return json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const descriptor = await getRecommendation({
    prompt: url.searchParams.get("prompt"),
    mood: url.searchParams.get("mood"),
    visual: url.searchParams.get("visual"),
    scene: url.searchParams.get("scene"),
  });

  return buildResponse(descriptor);
}

export async function action({ request }: ActionFunctionArgs) {
  let body: RecommendRequest = {};
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const parsed = (await request.json()) as Partial<RecommendRequest>;
      body = parsed ?? {};
    } catch (error) {
      console.error("Failed to parse recommendation body", error);
      body = {};
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    body = {
      prompt: formData.get("prompt")?.toString() ?? null,
      mood: formData.get("mood")?.toString() ?? null,
      visual: formData.get("visual")?.toString() ?? null,
      scene: formData.get("scene")?.toString() ?? null,
    };
  }

  const descriptor = await getRecommendation(body);
  return buildResponse(descriptor);
}
