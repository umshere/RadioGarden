import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Badge,
  Text,
  ActionIcon,
  Input,
  Avatar,
  Title,
  ThemeIcon,
  Tooltip,
  Button,
  Select,
} from "@mantine/core";
import { useSwipeable } from "react-swipeable";
import type { ReactCountryFlagProps } from "react-country-flag";
import * as ReactCountryFlagModule from "react-country-flag";

const fallbackReactCountryFlag: ComponentType<ReactCountryFlagProps> = ({
  countryCode,
  style,
  ...rest
}) => {
  if (typeof countryCode !== "string") return null;
  const emoji = countryCode.toUpperCase().replace(/./g, (char) =>
    String.fromCodePoint(char.charCodeAt(0) + 127397)
  );
  const { svg: _svg, ...restProps } = rest as Record<string, unknown>;
  return (
    <span
      role="img"
      {...restProps}
      style={{
        display: "inline-block",
        fontSize: "1em",
        lineHeight: "1em",
        verticalAlign: "middle",
        ...(style ?? {}),
      }}
    >
      {emoji}
    </span>
  );
};

function resolveReactCountryFlagExport(
  candidate: unknown,
  visited = new Set<unknown>()
): ComponentType<ReactCountryFlagProps> | null {
  if (candidate == null || visited.has(candidate)) {
    return null;
  }

  if (typeof candidate === "function") {
    return candidate as ComponentType<ReactCountryFlagProps>;
  }

  if (typeof candidate !== "object") {
    return null;
  }

  visited.add(candidate);

  const record = candidate as {
    default?: unknown;
    ReactCountryFlag?: unknown;
  };

  return (
    resolveReactCountryFlagExport(record.default, visited) ??
    resolveReactCountryFlagExport(record.ReactCountryFlag, visited)
  );
}

const ReactCountryFlagComponent =
  resolveReactCountryFlagExport(ReactCountryFlagModule) ?? fallbackReactCountryFlag;
import {
  IconSearch,
  IconArrowLeft,
  IconBroadcast,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerTrackNext,
  IconX,
  IconArrowsShuffle,
  IconWorld,
  IconDisc,
  IconLanguage,
  IconWaveSine,
  IconMusic,
  IconExternalLink,
  IconCompass,
  IconHeadphones,
  IconMapPin,
  IconGlobe,
} from "@tabler/icons-react";

const BRAND = Object.freeze({
  ocean: "#013A63",
  beige: "#F4EDE0",
  stamp: "#D1495B",
  teal: "#5C9EAD",
});

const HERO_TAGLINES = [
  "Every country, one click away — your global radio passport.",
  "Stamp your way through the world’s soundscapes.",
  "Where every station is a new destination.",
] as const;

const HERO_PREVIEW_FALLBACKS: Array<Pick<Station, "name" | "country" | "language" | "tags">> = [
  {
    name: "Lisbon Atlantic FM",
    country: "Portugal",
    language: "Portuguese",
    tags: "Sunrise grooves & maritime jazz",
  },
  {
    name: "Kyoto Night Signals",
    country: "Japan",
    language: "Japanese",
    tags: "Ambient downtempo for evening trains",
  },
  {
    name: "Brooklyn Skyline Radio",
    country: "United States",
    language: "English",
    tags: "Lo-fi beats & borough stories",
  },
];

function PassportStampIcon({
  size = 72,
  animated = true,
}: {
  size?: number;
  animated?: boolean;
}) {
  const gradientId = useMemo(
    () => `passport-glow-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const motionProps = animated
    ? {
        animate: { rotate: [-3, 3, -3], scale: [0.97, 1, 0.97] },
        transition: {
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror" as const,
          ease: [0.42, 0, 0.58, 1] as const,
        },
      }
    : {};

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 18px 32px rgba(1,26,55,0.36))" }}
      {...motionProps}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="48%">
          <stop offset="0%" stopColor={BRAND.teal} stopOpacity="0.92" />
          <stop offset="55%" stopColor={BRAND.ocean} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#031A33" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="50"
        fill={`url(#${gradientId})`}
        stroke={BRAND.beige}
        strokeWidth="3.2"
        strokeDasharray="7 5"
      />
      <circle
        cx="60"
        cy="60"
        r="38"
        fill="none"
        stroke={BRAND.stamp}
        strokeWidth="2.4"
        strokeDasharray="4 6"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M28 60c8.1-11.6 17.7-17.4 32-17.4 14.3 0 23.9 5.8 32 17.4-8.1 11.6-17.7 17.4-32 17.4-14.3 0-24-5.8-32-17.4z"
        stroke={BRAND.beige}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M34 46.3c7.2 4.6 15.5 7 26 7s18.8-2.4 26-7M34 73.7c7.2-4.6 15.5-7 26-7s18.8 2.4 26 7"
        stroke={BRAND.teal}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx="60" cy="60" r="8" fill={BRAND.stamp} />
    </motion.svg>
  );
}

/**
 * Radio Browser base. Use a specific mirror for speed; you can rotate later.
 * Docs: https://api.radio-browser.info / https://docs.radio-browser.info/
 */
const RB = "https://de2.api.radio-browser.info";

type Country = { name: string; iso_3166_1: string; stationcount: number };
type Station = {
  uuid: string;
  name: string;
  url: string;
  favicon: string;
  country: string;
  state: string | null;
  language: string | null;
  tags: string | null;
  bitrate: number;
  codec: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country");

  try {
    const countriesRes = await fetch(`${RB}/json/countries`, {
      headers: { "User-Agent": "radio-passport/1.0 (+cozy dev)" },
    });
    
    if (!countriesRes.ok) {
      console.error(`Failed to fetch countries: ${countriesRes.status} ${countriesRes.statusText}`);
      return json({ countries: [], stations: [], selectedCountry: country });
    }
    
    const countries: Country[] = await countriesRes.json();

    let stations: Station[] = [];
    if (country) {
      const sRes = await fetch(
        `${RB}/json/stations/bycountry/${encodeURIComponent(
          country
        )}?limit=100&hidebroken=true&order=clickcount&reverse=true`,
        { headers: { "User-Agent": "radio-passport/1.0 (+cozy dev)" } }
      );
      
      if (!sRes.ok) {
        console.error(`Failed to fetch stations: ${sRes.status} ${sRes.statusText}`);
      } else {
        const contentType = sRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          stations = await sRes.json();
        } else {
          console.error(`Unexpected content type: ${contentType}`);
          const text = await sRes.text();
          console.error(`Response body: ${text.substring(0, 200)}`);
        }
      }
    }

    return json({ countries, stations, selectedCountry: country });
  } catch (error) {
    console.error("Error loading radio data:", error);
    return json({ countries: [], stations: [], selectedCountry: country });
  }
}

function getContinent(iso2?: string): string {
  if (!iso2) return "Other";
  
  const continentMap: Record<string, string> = {
    AT: "Europe", BE: "Europe", BG: "Europe", HR: "Europe", CY: "Europe",
    CZ: "Europe", DK: "Europe", EE: "Europe", FI: "Europe", FR: "Europe",
    DE: "Europe", GR: "Europe", HU: "Europe", IS: "Europe", IE: "Europe",
    IT: "Europe", LV: "Europe", LT: "Europe", LU: "Europe", MT: "Europe",
    NL: "Europe", NO: "Europe", PL: "Europe", PT: "Europe", RO: "Europe",
    SK: "Europe", SI: "Europe", ES: "Europe", SE: "Europe", CH: "Europe",
    GB: "Europe", UA: "Europe", RU: "Europe", BY: "Europe", MD: "Europe",
    RS: "Europe", AL: "Europe", BA: "Europe", MK: "Europe", ME: "Europe",
    US: "North America", CA: "North America", MX: "North America",
    GT: "North America", HN: "North America", SV: "North America",
    AR: "South America", BO: "South America", BR: "South America",
    CL: "South America", CO: "South America", EC: "South America",
    CN: "Asia", IN: "Asia", ID: "Asia", JP: "Asia", KR: "Asia",
    MY: "Asia", PH: "Asia", SG: "Asia", TH: "Asia", VN: "Asia",
    ZA: "Africa", EG: "Africa", NG: "Africa", KE: "Africa", GH: "Africa",
    AU: "Oceania", NZ: "Oceania", PG: "Oceania", FJ: "Oceania",
  };
  
  return continentMap[iso2.toUpperCase()] || "Other";
}

function CountryFlag({
  iso,
  size = 48,
  title,
}: {
  iso?: string;
  size?: number;
  title: string;
}) {
  if (iso && iso.length === 2) {
    return (
  <ReactCountryFlagComponent
        svg
        countryCode={iso}
        title={title}
        style={{
          width: size,
          height: size,
          borderRadius: size / 6,
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        }}
      />
    );
  }

  return (
    <ThemeIcon
      size={size}
      radius="md"
      variant="gradient"
      gradient={{ from: "cyan", to: "violet", deg: 135 }}
      aria-label="Global"
    >
      <IconBroadcast size={size * 0.6} stroke={1.5} />
    </ThemeIcon>
  );
}

export default function Index() {
  const {
    countries,
    stations: loaderStations,
    selectedCountry: loaderSelectedCountry,
  } = useLoaderData<typeof loader>();
  const [sp] = useSearchParams();
  const countryParam = sp.get("country");
  const loaderMatchesSearch =
    (countryParam ?? null) === (loaderSelectedCountry ?? null);
  const selectedCountry: string | null = loaderMatchesSearch
    ? loaderSelectedCountry
    : null;
  const stations: Station[] = loaderMatchesSearch ? loaderStations : [];
  const isCountryRoute = Boolean(countryParam);
  const isCountryViewPending = isCountryRoute && !loaderMatchesSearch;
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [nowPlaying, setNowPlaying] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const stationRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const autoPlayRef = useRef(false);
  const [hasDismissedPlayer, setHasDismissedPlayer] = useState(false);
  const [showNavigationIndicator, setShowNavigationIndicator] = useState(false);
  const [heroHovered, setHeroHovered] = useState(false);
  const [heroTaglineIndex, setHeroTaglineIndex] = useState(0);
  const [heroTickerIndex, setHeroTickerIndex] = useState(0);
  const hoverAudioContextRef = useRef<AudioContext | null>(null);
  const hoverNoiseRef = useRef<(() => void) | null>(null);

  const topCountries = useMemo(
    () => [...countries].sort((a, b) => b.stationcount - a.stationcount).slice(0, 80),
    [countries]
  );

  const totalStations = countries.reduce((sum, c) => sum + c.stationcount, 0);
  const countryMap = new Map(countries.map((country) => [country.name, country] as const));

  const searchQueryRaw = sp.get("q") ?? "";
  const searchQuery = searchQueryRaw.trim().toLowerCase();

  const continentData = topCountries.reduce((acc, country) => {
    const continent = getContinent(country.iso_3166_1);
    if (!acc[continent]) {
      acc[continent] = [];
    }
    acc[continent].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const continents = Object.keys(continentData).sort();

  const floatingStamps = useMemo<
    Array<{ id: string; style: CSSProperties; delay: number }>
  >(
    () => [
      {
        id: "stamp-top-left",
        style: { top: "-3.5rem", left: "-3rem" },
        delay: 0,
      },
      {
        id: "stamp-bottom-right",
        style: { bottom: "-3.25rem", right: "8%" },
        delay: 2.6,
      },
      {
        id: "stamp-mid-right",
        style: { top: "32%", right: "-3.75rem" },
        delay: 4.2,
      },
    ],
    []
  );

  const heroTickerItems = useMemo(() => {
    const headlineCountry = topCountries[0]?.name ?? "Global";
    const base = [
      `${totalStations.toLocaleString()} verified stations ready to tune`,
      `${continents.length} continents on the dial`,
      `Spotlight • ${headlineCountry}`,
    ];

    if (nowPlaying) {
      base.unshift(`Now playing • ${nowPlaying.name} — ${nowPlaying.country}`);
    }

    return base;
  }, [continents.length, nowPlaying, topCountries, totalStations]);

  const currentHeroTicker = heroTickerItems.length
    ? heroTickerItems[heroTickerIndex % heroTickerItems.length]
    : "Global radio passport updates";

  const heroPreviewStation = useMemo<
    Station | Pick<Station, "name" | "country" | "language" | "tags">
  >(() => {
    if (nowPlaying) {
      return nowPlaying;
    }

    const fallbackIndex = heroTickerIndex % HERO_PREVIEW_FALLBACKS.length;
    const fallback =
      HERO_PREVIEW_FALLBACKS[fallbackIndex] ?? HERO_PREVIEW_FALLBACKS[0];

    return fallback as Pick<Station, "name" | "country" | "language" | "tags">;
  }, [heroTickerIndex, nowPlaying]);

  const heroPreviewCountryMeta = heroPreviewStation
    ? countryMap.get(heroPreviewStation.country) ?? null
    : null;

  const heroPreviewFavicon =
    typeof heroPreviewStation === "object" && "favicon" in heroPreviewStation
      ? (heroPreviewStation.favicon as string | undefined)
      : undefined;

  const currentContinent = selectedCountry
    ? getContinent(countryMap.get(selectedCountry)?.iso_3166_1)
    : nowPlaying
    ? getContinent(countryMap.get(nowPlaying.country)?.iso_3166_1)
    : null;

  const [selectedContinent, setSelectedContinent] = useState<string | null>(
    currentContinent ?? null
  );

  useEffect(() => {
    if (currentContinent && selectedContinent !== currentContinent) {
      setSelectedContinent(currentContinent);
    }
  }, [currentContinent, selectedContinent]);

  const countriesInContinent = selectedContinent
    ? continentData[selectedContinent] ?? []
    : [];

  const isRouteTransitioning = navigation.state !== "idle";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 6400);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroTickerItems.length === 0) return;

    const interval = window.setInterval(() => {
      setHeroTickerIndex((prev) => (prev + 1) % heroTickerItems.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [heroTickerItems.length]);

  useEffect(() => {
    setHeroTickerIndex(0);
  }, [heroTickerItems.length]);

  const triggerHoverStatic = useCallback(async () => {
    if (typeof window === "undefined") return;

    const AudioContextConstructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    if (!hoverAudioContextRef.current) {
      hoverAudioContextRef.current = new AudioContextConstructor();
    }

    const context = hoverAudioContextRef.current;
    if (!context) return;

    if (!hoverNoiseRef.current) {
      hoverNoiseRef.current = () => {
        const duration = 0.32;
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < channel.length; i += 1) {
          const decay = 1 - i / channel.length;
          channel[i] = (Math.random() * 2 - 1) * Math.pow(decay, 1.6) * 0.4;
        }

        const source = context.createBufferSource();
        source.buffer = buffer;

        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1150;
        filter.Q.value = 1.8;

        const gain = context.createGain();
        gain.gain.value = 0.12;

        source.connect(filter).connect(gain).connect(context.destination);
        source.start();
        source.stop(context.currentTime + duration);
      };
    }

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    hoverNoiseRef.current?.();
  }, []);

  useEffect(() => {
    return () => {
      const context = hoverAudioContextRef.current;
      if (context) {
        context.close().catch(() => undefined);
        hoverAudioContextRef.current = null;
      }
    };
  }, []);

  const handleStartListening = useCallback(() => {
    if (typeof document === "undefined") return;

    setActiveContinent(null);
    setSelectedContinent(null);

    const atlasSection = document.getElementById("atlas");
    atlasSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleExploreRegions = useCallback(() => {
    if (typeof document === "undefined") return;

    setShowRegionPicker(true);
    setActiveContinent(null);
    setSelectedContinent(null);
    const filterRow = document.getElementById("atlas-filters");
    filterRow?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleBackToWorldView = useCallback(() => {
    autoPlayRef.current = false;
    setNowPlaying(null);
    setIsPlaying(false);
    setHasDismissedPlayer(true);
    setShowRegionPicker(false);
    setActiveContinent(null);
    setSelectedContinent(null);
    navigate("/", { preventScrollReset: true });
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, [navigate]);

  useEffect(() => {
    let timeoutId: number | undefined;
    if (isRouteTransitioning) {
      timeoutId = window.setTimeout(() => setShowNavigationIndicator(true), 160);
      return () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    if (!isRouteTransitioning) {
      timeoutId = window.setTimeout(() => setShowNavigationIndicator(false), 120);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isRouteTransitioning]);

  useEffect(() => {
    if (selectedCountry || nowPlaying || topCountries.length === 0 || hasDismissedPlayer) {
      return;
    }

    let cancelled = false;

    const loadStation = async () => {
      try {
        const response = await fetch(
          `${RB}/json/stations/byname/ISHQ FM 104.8?limit=1&hidebroken=true`
        );

        if (!response.ok) return;

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;

        const [station] = (await response.json()) as Station[];
        if (!station || cancelled) return;

        const stationCountry = countryMap.get(station.country);
        const continent = stationCountry ? getContinent(stationCountry.iso_3166_1) : "Asia";

        autoPlayRef.current = false;
        setCurrentStationIndex(0);
        setSelectedContinent((prev) => prev ?? continent);
        setActiveContinent(continent);
        setHasDismissedPlayer(false);
        setNowPlaying(station);
      } catch (error) {
        console.error("Failed to seed station", error);
      }
    };

    loadStation();

    return () => {
      cancelled = true;
    };
  }, [selectedCountry, nowPlaying, topCountries, hasDismissedPlayer]);

  useEffect(() => {
    if (!selectedCountry) return;
    if (nowPlaying && stationRefs.current[nowPlaying.uuid]) {
      stationRefs.current[nowPlaying.uuid]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [nowPlaying, selectedCountry]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!nowPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (audio.src !== nowPlaying.url) {
      audio.src = nowPlaying.url;
    }

    if (autoPlayRef.current) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }

    autoPlayRef.current = false;
  }, [nowPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    let animationFrame: number;
    const animate = () => {
      setAudioLevel(isPlaying ? Math.random() * 0.6 + 0.2 : 0);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  const playPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        /* ignore */
      });
    }
  };

  const playNext = () => {
    if (stations.length === 0) return;

    const nextIndex = shuffleMode
      ? Math.floor(Math.random() * stations.length)
      : (currentStationIndex + 1) % stations.length;

    setCurrentStationIndex(nextIndex);
    const nextStation = stations[nextIndex];
    if (nextStation) {
      autoPlayRef.current = true;
      setHasDismissedPlayer(false);
      setNowPlaying(nextStation);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (stations.length > 0) playNext();
    },
    onSwipedRight: () => {
      if (nowPlaying) {
        setNowPlaying(null);
        setIsPlaying(false);
        setHasDismissedPlayer(true);
      }
    },
    trackMouse: true,
  });

  const filteredCountries = searchQuery
    ? topCountries.filter((country) => country.name.toLowerCase().includes(searchQuery))
    : topCountries;

  const countriesByContinent = filteredCountries.reduce((acc, country) => {
    const continent = getContinent(country.iso_3166_1);
    if (!acc[continent]) acc[continent] = [];
    acc[continent].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const continentSections = Object.entries(countriesByContinent).sort(
    ([, a], [, b]) => {
      const totalA = a.reduce((sum, country) => sum + country.stationcount, 0);
      const totalB = b.reduce((sum, country) => sum + country.stationcount, 0);
      return totalB - totalA;
    }
  );

  const displaySections = activeContinent
    ? continentSections.filter(([continent]) => continent === activeContinent)
    : continentSections;

  const selectedCountryMeta = selectedCountry
    ? countryMap.get(selectedCountry) ?? null
    : null;

  const continentIcons: Record<string, JSX.Element> = {
    "North America": <IconGlobe size={18} />,
    "South America": <IconGlobe size={18} />,
    Europe: <IconCompass size={18} />,
    Asia: <IconMapPin size={18} />,
    Africa: <IconGlobe size={18} />,
    Oceania: <IconHeadphones size={18} />,
    Other: <IconWorld size={18} />,
  };

  return (
    <div 
      className="app-bg relative min-h-screen text-slate-100"
      style={{
        backgroundImage: 'url(/texture.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
      }}
    >
      <header className="nav-shell">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-slate-100">
            <PassportStampIcon size={48} animated={false} />
            <div className="hidden md:flex md:flex-col">
              <span className="hero-wordmark text-lg leading-tight">Radio Passport</span>
              <span className="logo-subtitle">Sound atlas</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="nav-link"
              prefetch="intent"
              preventScrollReset
            >
              Home
            </Link>
            <a href="#explore" className="nav-link" aria-current="page">
              Explore
            </a>
            <span className="nav-link opacity-40" aria-disabled="true">
              Favorites
            </span>
            <span className="nav-link opacity-40" aria-disabled="true">
              About
            </span>
          </nav>
          <Badge
            radius="xl"
            size="md"
            style={{
              background: "rgba(209, 73, 91, 0.18)",
              color: BRAND.beige,
              border: "1px solid rgba(209, 73, 91, 0.4)",
              fontWeight: 600,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            Live beta
          </Badge>
        </div>
      </header>

      <main
        className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-12 md:px-8"
        {...swipeHandlers}
      >
        {isCountryViewPending ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hero-surface flex flex-col items-center gap-6 px-6 py-12 text-center md:px-10"
          >
            <motion.div
              className="flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            >
              <PassportStampIcon size={82} />
            </motion.div>
            <div className="space-y-2">
              <Title order={2} style={{ color: BRAND.beige }}>
                Retuning the atlas
              </Title>
              <Text size="sm" c="rgba(244,237,224,0.65)">
                Hold tight while we load that region’s soundscapes.
              </Text>
            </div>
          </motion.section>
        ) : !selectedCountry ? (
          <>
            <motion.section
              id="explore"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hero-surface brand-hero px-6 py-10 md:px-10 md:py-14"
              onPointerEnter={() => setHeroHovered(true)}
              onPointerLeave={() => setHeroHovered(false)}
              style={{
                backgroundImage: 'linear-gradient(rgba(1, 26, 55, 0.85), rgba(1, 26, 55, 0.75)), url(/RG-HERO.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'normal',
              }}
            >
              <div className="brand-hero__globe">
                <span className="brand-hero__globe-ring" />
              </div>
              {floatingStamps.map((stamp) => (
                <motion.div
                  key={stamp.id}
                  className="hero-floating-stamp"
                  style={stamp.style}
                  animate={
                    heroHovered
                      ? { opacity: 0.72, x: 8, y: -6 }
                      : { opacity: 0.38, x: 0, y: 0 }
                  }
                  transition={{
                    duration: 6.2,
                    delay: stamp.delay,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <PassportStampIcon size={64} animated={false} />
                </motion.div>
              ))}
              <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl space-y-8">
                  <motion.span
                    className="brand-hero__ticker"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  >
                    <span className="brand-hero__ticker-icon">
                      <IconCompass size={16} />
                    </span>
                    <AnimatePresence initial={false} mode="wait">
                      <motion.span
                        key={currentHeroTicker}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.32, ease: [0.42, 0, 0.58, 1] }}
                      >
                        {currentHeroTicker}
                      </motion.span>
                    </AnimatePresence>
                  </motion.span>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <PassportStampIcon size={92} />
                      <div>
                        <motion.span
                          className="hero-wordmark text-4xl md:text-5xl"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
                        >
                          Radio Passport
                        </motion.span>
                        <span className="logo-subtitle mt-2 inline-block">
                          Global sound atlas
                        </span>
                      </div>
                    </div>
                    <AnimatePresence initial={false} mode="wait">
                      <motion.h1
                        key={HERO_TAGLINES[heroTaglineIndex]}
                        className="text-2xl font-semibold text-slate-100 md:text-[2.45rem] md:leading-tight"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
                      >
                        {HERO_TAGLINES[heroTaglineIndex]}
                      </motion.h1>
                    </AnimatePresence>
                    <motion.p
                      className="text-base leading-relaxed text-slate-100/80 md:text-lg"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, ease: [0.42, 0, 0.58, 1], delay: 0.28 }}
                    >
                      Chart a calm, exploratory ride through world radio with layered textures,
                      analog warmth, and a sense of journey tuned into every interaction.
                    </motion.p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="cta-primary"
                      onClick={handleStartListening}
                      onMouseEnter={triggerHoverStatic}
                      onFocus={triggerHoverStatic}
                    >
                      <IconHeadphones size={18} />
                      Start Listening
                    </button>
                    <button
                      type="button"
                      className="cta-secondary"
                      onClick={handleExploreRegions}
                    >
                      <IconCompass size={18} />
                      Explore Regions
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3">
                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        background: "rgba(2, 27, 47, 0.65)",
                        borderColor: "rgba(92, 158, 173, 0.28)",
                        backdropFilter: "blur(14px)",
                      }}
                    >
                      <Text size="xs" c="rgba(244,237,224,0.7)" fw={600}>
                        Countries featured
                      </Text>
                      <Text size="xl" fw={700} c={BRAND.beige}>
                        {topCountries.length.toLocaleString()}
                      </Text>
                    </div>
                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        background: "rgba(2, 27, 47, 0.65)",
                        borderColor: "rgba(92, 158, 173, 0.28)",
                        backdropFilter: "blur(14px)",
                      }}
                    >
                      <Text size="xs" c="rgba(244,237,224,0.7)" fw={600}>
                        Stations tracked
                      </Text>
                      <Text size="xl" fw={700} c={BRAND.beige}>
                        {totalStations.toLocaleString()}
                      </Text>
                    </div>
                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        background: "rgba(2, 27, 47, 0.65)",
                        borderColor: "rgba(92, 158, 173, 0.28)",
                        backdropFilter: "blur(14px)",
                      }}
                    >
                      <Text size="xs" c="rgba(244,237,224,0.7)" fw={600}>
                        Continents covered
                      </Text>
                      <Text size="xl" fw={700} c={BRAND.beige}>
                        {continents.length}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex w-full max-w-sm flex-col gap-5">
                  <div className="hero-mini-player">
                    <span className="hero-mini-player__badge">Passport preview</span>
                    <div className="mt-4 flex items-start gap-4">
                      {heroPreviewFavicon ? (
                        <Avatar
                          src={heroPreviewFavicon}
                          alt={`${heroPreviewStation.name} artwork`}
                          size={60}
                          radius="xl"
                          style={{ border: "1px solid rgba(244,237,224,0.22)" }}
                        />
                      ) : (
                        <ThemeIcon
                          size={60}
                          radius="xl"
                          style={{
                            background: "rgba(3, 25, 45, 0.85)",
                            border: "1px solid rgba(244,237,224,0.18)",
                          }}
                        >
                          <IconBroadcast size={26} />
                        </ThemeIcon>
                      )}
                      <div className="min-w-0 space-y-2">
                        <Text fw={600} size="lg" c={BRAND.beige} lineClamp={1}>
                          {heroPreviewStation.name}
                        </Text>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200/70">
                          <CountryFlag
                            iso={heroPreviewCountryMeta?.iso_3166_1}
                            title={`${heroPreviewStation.country} flag`}
                            size={28}
                          />
                          <span>{heroPreviewStation.country}</span>
                          {heroPreviewStation.language && (
                            <>
                              <span aria-hidden="true">•</span>
                              <span>{heroPreviewStation.language}</span>
                            </>
                          )}
                        </div>
                        {heroPreviewStation.tags && (
                          <Text size="xs" c="rgba(244,237,224,0.7)" lineClamp={2}>
                            {heroPreviewStation.tags}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 flex items-end gap-[3px]">
                      {Array.from({ length: 14 }).map((_, index) => (
                        <motion.span
                          key={index}
                          className="equalizer-bar"
                          style={{ width: 4 }}
                          animate={{
                            height: [10, 28, 12],
                            opacity: [0.24, 0.6, 0.24],
                          }}
                          transition={{
                            duration: 1.6 + index * 0.05,
                            repeat: Infinity,
                            ease: [0.42, 0, 0.58, 1],
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="hero-search-card space-y-4">
                    <Text size="sm" c="rgba(244,237,224,0.72)" fw={500}>
                      Search across the atlas
                    </Text>
                    <Form method="get" onChange={(event) => submit(event.currentTarget)}>
                      <Input
                        name="q"
                        placeholder="Search countries"
                        size="md"
                        radius="xl"
                        defaultValue={searchQueryRaw}
                        leftSection={<IconSearch size={18} stroke={1.6} />}
                        styles={{
                          input: {
                            background: "rgba(3, 24, 45, 0.65)",
                            borderColor: "rgba(92, 158, 173, 0.35)",
                            color: "#f4ede0",
                            fontWeight: 500,
                            "&:focus": {
                              borderColor: "rgba(92, 158, 173, 0.65)",
                              boxShadow: "0 0 0 3px rgba(92, 158, 173, 0.2)",
                            },
                            "&::placeholder": {
                              color: "rgba(244, 237, 224, 0.55)",
                            },
                          },
                        }}
                      />
                    </Form>
                  </div>
                </div>
              </div>
            </motion.section>

            <section id="atlas" className="mt-12 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Title
                    order={2}
                    style={{ fontSize: "1.85rem", fontWeight: 600, color: BRAND.beige }}
                  >
                    Chart your path by continent
                  </Title>
                  <Text size="sm" c="rgba(244,237,224,0.7)">
                    Filter the atlas to the regions that match your listening mood.
                  </Text>
                </div>
                <Text size="sm" c="rgba(244,237,224,0.55)">
                  Showing {filteredCountries.length.toLocaleString()} of {topCountries.length.toLocaleString()} spotlight countries
                </Text>
              </div>

              <div id="atlas-filters" className="scroll-track overflow-x-auto pb-2">
                <div className="flex min-w-max items-center gap-3">
                  <button
                    type="button"
                    className={`filter-chip ${activeContinent === null ? "filter-chip--active" : ""}`}
                    onClick={() => setActiveContinent(null)}
                  >
                    <IconGlobe size={16} />
                    All regions
                  </button>
                  {continents.map((continent) => (
                    <button
                      key={continent}
                      type="button"
                      className={`filter-chip ${activeContinent === continent ? "filter-chip--active" : ""}`}
                      onClick={() => setActiveContinent(continent)}
                    >
                      {continentIcons[continent] ?? <IconWorld size={16} />}
                      {continent}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-10 space-y-10">
              {displaySections.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
                  <Text size="md" c="rgba(244,237,224,0.65)">
                    No countries match that search. Try another name or reset the filters.
                  </Text>
                </div>
              ) : (
                displaySections.map(([continent, continentCountries]) => {
                  const total = continentCountries.reduce(
                    (sum, country) => sum + country.stationcount,
                    0
                  );

                  return (
                    <motion.section
                      key={continent}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                          <ThemeIcon
                            size={48}
                            radius="xl"
                            style={{
                              background: "linear-gradient(140deg, rgba(18,29,52,0.9) 0%, rgba(10,18,36,0.9) 100%)",
                              border: "1px solid rgba(199,158,73,0.35)",
                              color: "#fefae0",
                            }}
                          >
                            {continentIcons[continent] ?? <IconWorld size={20} />}
                          </ThemeIcon>
                          <div>
                            <Title order={3} style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                              {continent}
                            </Title>
                            <Text size="sm" c="rgba(226,232,240,0.6)">
                              {continentCountries.length} countries • {total.toLocaleString()} stations
                            </Text>
                          </div>
                        </div>
                        <Badge
                          radius="xl"
                          size="lg"
                          leftSection={<IconBroadcast size={16} />}
                          style={{
                            background: "rgba(199,158,73,0.2)",
                            border: "1px solid rgba(199,158,73,0.45)",
                            color: "#fefae0",
                          }}
                        >
                          {total.toLocaleString()} tuned-in listeners
                        </Badge>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {continentCountries.map((country, index) => (
                          <motion.div
                            key={country.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ y: -6 }}
                          >
                            <Link
                              to={`/?country=${encodeURIComponent(country.name)}`}
                              className="country-card"
                            >
                              <span className="country-card__stamp" />
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <CountryFlag
                                    iso={country.iso_3166_1}
                                    title={`${country.name} flag`}
                                    size={52}
                                  />
                                  <div>
                                    <Text fw={600} size="md" c="#f8fafc">
                                      {country.name}
                                    </Text>
                                    <Text size="xs" c="rgba(226,232,240,0.6)">
                                      Passport stamp ready
                                    </Text>
                                  </div>
                                </div>
                                <Badge
                                  radius="xl"
                                  size="sm"
                                  leftSection={<IconBroadcast size={12} />}
                                  style={{
                                    background: "rgba(199,158,73,0.14)",
                                    border: "1px solid rgba(199,158,73,0.45)",
                                    color: "#fefae0",
                                  }}
                                >
                                  {country.stationcount.toLocaleString()}
                                </Badge>
                              </div>
                              <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-wide text-slate-300/60">
                                <span className="inline-flex items-center gap-1">
                                  <IconMapPin size={14} /> Visit detail
                                </span>
                                <span>Open atlas</span>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  );
                })
              )}
            </section>
          </>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hero-surface px-6 py-8 md:px-10 md:py-10"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Button
                    variant="subtle"
                    radius="xl"
                    leftSection={<IconArrowLeft size={18} />}
                    onClick={handleBackToWorldView}
                    style={{
                      color: "#fefae0",
                    }}
                  >
                    Back to world view
                  </Button>
                  <Badge
                    radius="xl"
                    size="lg"
                    leftSection={<IconBroadcast size={16} />}
                    style={{
                      background: "rgba(199,158,73,0.2)",
                      border: "1px solid rgba(199,158,73,0.45)",
                      color: "#fefae0",
                    }}
                  >
                    {stations.length.toLocaleString()} stations catalogued
                  </Badge>
                </div>

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <CountryFlag
                      iso={selectedCountryMeta?.iso_3166_1}
                      title={`${selectedCountry} flag`}
                      size={64}
                    />
                    <div>
                      <Title order={1} style={{ fontSize: "2.25rem", fontWeight: 700 }}>
                        {selectedCountry}
                      </Title>
                      <Text size="sm" c="rgba(226,232,240,0.7)">
                        Explore this nation’s airwaves and discover local voices in real time.
                      </Text>
                    </div>
                  </div>

                  {selectedCountryMeta && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200/80">
                      <div className="flex items-center gap-2">
                        <IconMapPin size={16} />
                        Passport code: {selectedCountryMeta.iso_3166_1}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            <section className="mt-10">
              {stations.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
                  <Text size="md" c="rgba(226,232,240,0.6)">
                    No stations found for this country right now. Try another region.
                  </Text>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {stations.map((station, index) => {
                    const isCurrent = nowPlaying?.uuid === station.uuid;
                    return (
                      <motion.div
                        key={station.uuid}
                        ref={(element) => {
                          stationRefs.current[station.uuid] = element;
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <div
                          className={`station-card ${isCurrent ? "station-card--active" : ""}`}
                        >
                          <div className="flex items-start gap-4">
                            {station.favicon ? (
                              <Avatar
                                src={station.favicon}
                                size={64}
                                radius="lg"
                                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                              />
                            ) : (
                              <ThemeIcon
                                size={64}
                                radius="lg"
                                style={{
                                  background: "rgba(17,27,47,0.8)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <IconBroadcast size={28} />
                              </ThemeIcon>
                            )}
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <Text fw={600} size="sm" c="#f8fafc" lineClamp={1}>
                                  {station.name}
                                </Text>
                                {station.codec && (
                                  <Badge
                                    radius="xl"
                                    size="xs"
                                    leftSection={<IconWaveSine size={11} />}
                                    style={{
                                      background: "rgba(148,163,184,0.15)",
                                      border: "1px solid rgba(148,163,184,0.3)",
                                      color: "rgba(226,232,240,0.8)",
                                    }}
                                  >
                                    {station.codec}
                                  </Badge>
                                )}
                              </div>
                              {station.tags && (
                                <Text size="xs" c="rgba(226,232,240,0.55)" lineClamp={2}>
                                  {station.tags}
                                </Text>
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                {station.language && (
                                  <Badge
                                    radius="xl"
                                    size="xs"
                                    leftSection={<IconLanguage size={11} />}
                                    style={{
                                      background: "rgba(37,99,235,0.12)",
                                      border: "1px solid rgba(37,99,235,0.25)",
                                      color: "rgba(191,219,254,0.85)",
                                    }}
                                  >
                                    {station.language}
                                  </Badge>
                                )}
                                {station.bitrate > 0 && (
                                  <Badge
                                    radius="xl"
                                    size="xs"
                                    leftSection={<IconMusic size={11} />}
                                    style={{
                                      background: "rgba(199,158,73,0.18)",
                                      border: "1px solid rgba(199,158,73,0.32)",
                                      color: "#fefae0",
                                    }}
                                  >
                                    {station.bitrate} kbps
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="divider-soft" />

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <Tooltip label="Open stream" withArrow color="gray">
                              <ActionIcon
                                component="a"
                                href={station.url}
                                target="_blank"
                                rel="noreferrer"
                                size="lg"
                                radius="xl"
                                style={{
                                  background: "rgba(17,27,47,0.9)",
                                  border: "1px solid rgba(148,163,184,0.25)",
                                  color: "rgba(226,232,240,0.75)",
                                }}
                              >
                                <IconExternalLink size={18} />
                              </ActionIcon>
                            </Tooltip>

                            <Button
                              radius="xl"
                              size="sm"
                              leftSection={<IconPlayerPlayFilled size={16} />}
                              onClick={() => {
                                setCurrentStationIndex(index);
                                autoPlayRef.current = true;
                                setHasDismissedPlayer(false);
                                setNowPlaying(station);
                              }}
                              style={{
                                background: "linear-gradient(120deg, rgba(199,158,73,0.9) 0%, rgba(148,113,51,0.9) 100%)",
                                color: "#0f172a",
                                fontWeight: 600,
                              }}
                            >
                              Play station
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <AnimatePresence>
        {showNavigationIndicator && (
          <motion.div
            key="navigation-indicator"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-none fixed top-6 right-6 z-40"
          >
            <motion.div
              layout
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(12,20,36,0.82)] px-5 py-3 shadow-xl backdrop-blur"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-100/70">
                Tuning
              </span>
              <div className="flex h-6 items-end gap-[3px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.span
                    key={index}
                    className="w-[6px] rounded-full bg-[rgba(199,158,73,0.7)]"
                    animate={{ height: [8, 22, 10] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: index * 0.08,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nowPlaying && (
          <motion.footer
            initial={{ y: 160, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 160, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 180 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
          >
            <div className="mx-auto w-full max-w-5xl">
              <div className="glass-veil relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                <div className="flex flex-col gap-6 md:grid md:grid-cols-[auto,minmax(0,1fr),auto] md:items-center md:gap-8">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative">
                      <motion.span
                        className="absolute inset-0 -z-10 rounded-2xl"
                        style={{
                          background: "radial-gradient(circle at 50% 50%, rgba(199,158,73,0.3) 0%, transparent 70%)",
                        }}
                        animate={{ opacity: isPlaying ? [0.2, 0.5, 0.2] : 0.15 }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <Avatar
                        src={nowPlaying.favicon || "https://placehold.co/120x120/0f172a/ffffff?text=📻"}
                        size={86}
                        radius="xl"
                        style={{
                          border: "2px solid rgba(199,158,73,0.6)",
                          boxShadow: "0 14px 35px rgba(5,11,25,0.6)",
                        }}
                      />
                    </div>
                    <div className="min-w-0 space-y-3">
                      <Badge
                        radius="xl"
                        size="xs"
                        leftSection={<IconDisc size={12} />}
                        style={{
                          background: "rgba(199,158,73,0.2)",
                          border: "1px solid rgba(199,158,73,0.45)",
                          color: "#fefae0",
                        }}
                      >
                        Now playing
                      </Badge>
                      <Text fw={600} size="lg" c="#f8fafc" lineClamp={1}>
                        {nowPlaying.name}
                      </Text>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200/80">
                        <CountryFlag
                          iso={countryMap.get(nowPlaying.country)?.iso_3166_1}
                          title={`${nowPlaying.country} flag`}
                          size={28}
                        />
                        <span>
                          {nowPlaying.country} • {nowPlaying.language || "Unknown language"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full items-end justify-start md:self-end">
                    <AnimatePresence initial={false}>
                      {showRegionPicker ? (
                        <motion.div
                          key="picker"
                          layout
                          initial={{ opacity: 0, scale: 0.94, y: 12 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, y: 12 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="flex w-full max-w-md flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
                        >
                          <div className="flex w-full items-center justify-between">
                            <Text size="xs" c="rgba(226,232,240,0.6)" fw={600}>
                              Quick retune
                            </Text>
                            <ActionIcon
                              variant="subtle"
                              radius="xl"
                              size="sm"
                              onClick={() => setShowRegionPicker(false)}
                              style={{ color: "rgba(226,232,240,0.6)" }}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </div>
                          <Select
                            placeholder="Continent"
                            value={selectedContinent}
                            onChange={(value) => {
                              setSelectedContinent(value);
                              if (value && continentData[value] && continentData[value].length > 0) {
                                const firstCountry = continentData[value][0];
                                if (firstCountry) {
                                  navigate(`/?country=${encodeURIComponent(firstCountry.name)}`, {
                                    preventScrollReset: true,
                                  });
                                }
                              }
                            }}
                            data={continents.map((continent) => ({
                              value: continent,
                              label: continent,
                            }))}
                            size="sm"
                            radius="xl"
                            w="100%"
                            styles={{
                              input: {
                                background: "rgba(15,23,42,0.7)",
                                borderColor: "rgba(148,163,184,0.35)",
                                color: "#f8fafc",
                                fontSize: "0.85rem",
                                minHeight: "2.5rem",
                              },
                              option: { fontSize: "0.85rem" },
                            }}
                            comboboxProps={{ shadow: "xl" }}
                          />
                          {selectedContinent && (
                            <Select
                              placeholder="Country"
                              value={nowPlaying.country}
                              onChange={(value) => {
                                if (value) {
                                  navigate(`/?country=${encodeURIComponent(value)}`, {
                                    preventScrollReset: true,
                                  });
                                }
                              }}
                              data={countriesInContinent.map((country) => ({
                                value: country.name,
                                label: country.name,
                              }))}
                              size="sm"
                              radius="xl"
                              searchable
                              w="100%"
                              styles={{
                                input: {
                                  background: "rgba(15,23,42,0.7)",
                                  borderColor: "rgba(148,163,184,0.35)",
                                  color: "#f8fafc",
                                  fontSize: "0.85rem",
                                  minHeight: "2.5rem",
                                },
                                option: { fontSize: "0.85rem" },
                              }}
                              comboboxProps={{ shadow: "xl" }}
                            />
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="toggle"
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="flex items-center justify-center"
                        >
                          <Button
                            radius="xl"
                            variant="subtle"
                            leftSection={<IconMapPin size={18} />}
                            onClick={() => setShowRegionPicker(true)}
                            style={{
                              color: "#fefae0",
                              background: "rgba(15,23,42,0.45)",
                              border: "1px solid rgba(148,163,184,0.25)",
                            }}
                          >
                            Change region
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-start gap-3 md:justify-end md:pr-2">
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        onClick={() => setShuffleMode((prev) => !prev)}
                        style={{
                          background: shuffleMode
                            ? "linear-gradient(120deg, rgba(199,158,73,0.85) 0%, rgba(148,113,51,0.85) 100%)"
                            : "rgba(15,23,42,0.7)",
                          border: shuffleMode
                            ? "1px solid rgba(254,250,226,0.6)"
                            : "1px solid rgba(148,163,184,0.25)",
                          color: shuffleMode ? "#0f172a" : "#f8fafc",
                        }}
                      >
                        <IconArrowsShuffle size={18} />
                      </ActionIcon>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="xl"
                        radius="xl"
                        onClick={playPause}
                        style={{
                          background: "linear-gradient(120deg, rgba(199,158,73,0.92) 0%, rgba(148,113,51,0.92) 100%)",
                          border: "1px solid rgba(254,250,226,0.6)",
                          color: "#0f172a",
                          boxShadow: "0 18px 35px rgba(5,11,25,0.6)",
                        }}
                      >
                        {isPlaying ? (
                          <IconPlayerPauseFilled size={22} />
                        ) : (
                          <IconPlayerPlayFilled size={22} />
                        )}
                      </ActionIcon>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        onClick={playNext}
                        disabled={stations.length === 0}
                        style={{
                          background: "rgba(15,23,42,0.7)",
                          border: "1px solid rgba(148,163,184,0.25)",
                          color: "#f8fafc",
                          opacity: stations.length === 0 ? 0.4 : 1,
                        }}
                      >
                        <IconPlayerTrackNext size={20} />
                      </ActionIcon>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        onClick={() => {
                          setNowPlaying(null);
                          setIsPlaying(false);
                          setHasDismissedPlayer(true);
                        }}
                        style={{
                          background: "rgba(127,29,29,0.28)",
                          border: "1px solid rgba(239,68,68,0.4)",
                          color: "#fecaca",
                        }}
                      >
                        <IconX size={18} />
                      </ActionIcon>
                    </motion.div>
                  </div>
                </div>

                {nowPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex h-12 items-end justify-center gap-[3px]"
                  >
                    {Array.from({ length: 40 }).map((_, index) => {
                      const idleHeight = 18 + Math.random() * 8;
                      const idleHeights = [`${idleHeight}%`, `${idleHeight + 6}%`, `${idleHeight}%`];
                      const activeHeights = [
                        `${18 + Math.random() * 40}%`,
                        `${30 + Math.random() * 50}%`,
                        `${18 + Math.random() * 40}%`,
                      ];
                      return (
                        <motion.span
                          key={index}
                          className="equalizer-bar"
                          animate={{
                            height: isPlaying ? activeHeights : idleHeights,
                            opacity: isPlaying
                              ? [0.4 + audioLevel * 0.4, 0.7, 0.4 + audioLevel * 0.4]
                              : [0.18, 0.32, 0.18],
                          }}
                          transition={{
                            duration: isPlaying ? 0.4 + Math.random() * 0.5 : 1.4 + Math.random() * 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      );
                    })}
                  </motion.div>
                )}

                <audio ref={audioRef} className="hidden" />
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
