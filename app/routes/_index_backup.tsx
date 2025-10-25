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
import PassportStampIcon from "~/components/PassportStampIcon";

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
  IconPlayerTrackPrev,
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
  IconHeart,
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

type ListeningMode = "world" | "local";

type PlayerCard =
  | { type: "mission" }
  | { type: "station"; station: Station };

type QuickRetuneWidgetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  continents: string[];
  activeContinent: string | null;
  onContinentSelect: (continent: string | null) => void;
  countriesByContinent: Record<string, Country[]>;
  topCountries: Country[];
  onCountrySelect: (countryName: string) => void;
  onSurprise: () => void;
};

const LISTENING_MODE_STORAGE_KEY = "radio-passport-mode";
const FAVORITES_STORAGE_KEY = "radio-passport-favorites";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function dedupeStations(stations: Station[]): Station[] {
  const seen = new Set<string>();
  const unique: Station[] = [];
  for (const station of stations) {
    if (!seen.has(station.uuid)) {
      seen.add(station.uuid);
      unique.push(station);
    }
  }
  return unique;
}

const PLAYER_CARD_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    rotate: direction * 0.8,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    rotate: direction * -0.8,
    scale: 0.95,
  }),
} as const;

const PLAYER_CARD_TRANSITION = {
  duration: 0.35,
  ease: [0.42, 0, 0.58, 1] as const,
};

function QuickRetuneWidget({
  isOpen,
  onOpenChange,
  continents,
  activeContinent,
  onContinentSelect,
  countriesByContinent,
  topCountries,
  onCountrySelect,
  onSurprise,
}: QuickRetuneWidgetProps) {
  const previewCountries = activeContinent
    ? (countriesByContinent[activeContinent] ?? []).slice(0, 6)
    : topCountries.slice(0, 6);

  return (
    <div
      className="quick-retune-container"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      <motion.button
        type="button"
        className={`quick-retune-trigger ${isOpen ? "quick-retune-trigger--active" : ""}`}
        onClick={() => onOpenChange(!isOpen)}
        whileTap={{ scale: 0.96 }}
      >
        <IconMapPin size={18} />
        <span>Quick retune</span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="quick-retune-panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="quick-retune-panel"
          >
            <div className="quick-retune-panel__header">
              <Text size="sm" fw={600} c="#f8fafc">
                Quick retune
              </Text>
              <ActionIcon
                size="sm"
                radius="xl"
                variant="subtle"
                onClick={() => onOpenChange(false)}
                style={{ color: "rgba(226,232,240,0.7)" }}
              >
                <IconX size={14} />
              </ActionIcon>
            </div>
            <div className="quick-retune-panel__row">
              {continents.map((continent) => {
                const isActive = activeContinent === continent;
                return (
                  <button
                    key={continent}
                    type="button"
                    className={`quick-retune-chip ${
                      isActive ? "quick-retune-chip--active" : ""
                    }`}
                    onClick={() => onContinentSelect(isActive ? null : continent)}
                  >
                    {continent}
                  </button>
                );
              })}
            </div>
            <div className="quick-retune-panel__countries">
              {previewCountries.length === 0 ? (
                <Text size="xs" c="rgba(226,232,240,0.6)">
                  No spotlight countries available.
                </Text>
              ) : (
                previewCountries.map((country) => (
                  <button
                    key={country.name}
                    type="button"
                    className="quick-retune-country"
                    onClick={() => onCountrySelect(country.name)}
                  >
                    <div className="quick-retune-country__info">
                      <CountryFlag
                        iso={country.iso_3166_1}
                        title={`${country.name} flag`}
                        size={22}
                      />
                      <span>{country.name}</span>
                    </div>
                    <span className="quick-retune-country__meta">
                      {country.stationcount.toLocaleString()} stations
                    </span>
                  </button>
                ))
              )}
            </div>
            <Button
              radius="xl"
              size="xs"
              variant="light"
              leftSection={<IconArrowsShuffle size={14} />}
              onClick={onSurprise}
              style={{
                width: "100%",
                color: "#0f172a",
                background: "rgba(254,250,226,0.9)",
                border: "1px solid rgba(148,163,184,0.25)",
                fontWeight: 600,
              }}
            >
              Surprise me
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [listeningMode, setListeningMode] = useState<ListeningMode>("local");
  const [exploreStations, setExploreStations] = useState<Station[]>([]);
  const [isFetchingExplore, setIsFetchingExplore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardDirection, setCardDirection] = useState<1 | -1>(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const stationRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const [isQuickRetuneOpen, setIsQuickRetuneOpen] = useState(false);
  const [favoriteStationIds, setFavoriteStationIds] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    if (!isBrowser()) return;

    const storedMode = window.localStorage.getItem(LISTENING_MODE_STORAGE_KEY);
    if (storedMode === "world" || storedMode === "local") {
      setListeningMode(storedMode);
    }

    const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites) as string[];
        if (Array.isArray(parsed)) {
          setFavoriteStationIds(new Set(parsed));
        }
      } catch (error) {
        console.error("Failed to parse stored favorites", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;
    window.localStorage.setItem(LISTENING_MODE_STORAGE_KEY, listeningMode);
  }, [listeningMode]);

  useEffect(() => {
    if (!isBrowser()) return;
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Array.from(favoriteStationIds))
    );
  }, [favoriteStationIds]);

  useEffect(() => {
    if (!nowPlaying) return;
    setRecentStations((prev) => {
      const filtered = prev.filter((station) => station.uuid !== nowPlaying.uuid);
      return [nowPlaying, ...filtered].slice(0, 12);
    });
  }, [nowPlaying]);

  useEffect(() => {
    if (listeningMode !== "world") return;
    if (exploreStations.length > 0 || isFetchingExplore) return;

    let cancelled = false;

    const fetchExploreStations = async () => {
      setIsFetchingExplore(true);
      try {
        const response = await fetch(
          `${RB}/json/stations/topvote/120?hidebroken=true&order=clicktrend&reverse=true`,
          { headers: { "User-Agent": "radio-passport/1.0 (+cozy dev)" } }
        );

        if (!response.ok) return;

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;

        const payload = (await response.json()) as Station[];
        if (!cancelled && Array.isArray(payload)) {
          setExploreStations(dedupeStations(payload).slice(0, 120));
        }
      } catch (error) {
        console.error("Failed to fetch global stations", error);
      } finally {
        if (!cancelled) {
          setIsFetchingExplore(false);
        }
      }
    };

    fetchExploreStations();

    return () => {
      cancelled = true;
    };
  }, [exploreStations.length, isFetchingExplore, listeningMode]);

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

    setIsQuickRetuneOpen(true);
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
  setIsQuickRetuneOpen(false);
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
    if (isRouteTransitioning) {
      setShowNavigationIndicator(true);
    } else {
      setShowNavigationIndicator(false);
    }
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
    if (nowPlaying && stationRefs.current[nowPlaying.uuid] && autoPlayRef.current) {
      stationRefs.current[nowPlaying.uuid]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
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

  const resolveActiveStations = useCallback((): Station[] => {
    if (listeningMode === "world") {
      if (exploreStations.length > 0) return exploreStations;
      if (stations.length > 0) return stations;
      return recentStations;
    }

    if (stations.length > 0) return stations;
    if (exploreStations.length > 0) return exploreStations;
    return recentStations;
  }, [exploreStations, listeningMode, recentStations, stations]);

  const startStation = useCallback(
    (station: Station, options?: { autoPlay?: boolean }) => {
      const autoPlay = options?.autoPlay ?? false;

      const localIndex = stations.findIndex((item) => item.uuid === station.uuid);
      const worldIndex = exploreStations.findIndex((item) => item.uuid === station.uuid);

      if (listeningMode === "world") {
        if (worldIndex >= 0) {
          setCurrentStationIndex(worldIndex);
        } else if (localIndex >= 0) {
          setCurrentStationIndex(localIndex);
        }
      } else if (localIndex >= 0) {
        setCurrentStationIndex(localIndex);
      } else if (worldIndex >= 0) {
        setCurrentStationIndex(worldIndex);
      }

      autoPlayRef.current = autoPlay;
      setHasDismissedPlayer(false);
      setNowPlaying(station);
    },
    [exploreStations, listeningMode, stations]
  );

  const playPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        /* ignore */
      });
    }
  }, [isPlaying]);

  const playNext = useCallback(() => {
    const activeStations = resolveActiveStations();
    if (activeStations.length === 0) return;

    const nextIndex = shuffleMode
      ? Math.floor(Math.random() * activeStations.length)
      : (currentStationIndex + 1) % activeStations.length;

    const nextStation = activeStations[nextIndex];
    if (nextStation) {
      setCurrentStationIndex(nextIndex);
      startStation(nextStation, { autoPlay: true });
    }
  }, [currentStationIndex, resolveActiveStations, shuffleMode, startStation]);

  const playPrevious = useCallback(() => {
    const activeStations = resolveActiveStations();
    if (activeStations.length === 0) return;

    const previousIndex = shuffleMode
      ? Math.floor(Math.random() * activeStations.length)
      : (currentStationIndex - 1 + activeStations.length) % activeStations.length;

    const previousStation = activeStations[previousIndex];
    if (previousStation) {
      setCurrentStationIndex(previousIndex);
      startStation(previousStation, { autoPlay: true });
    }
  }, [currentStationIndex, resolveActiveStations, shuffleMode, startStation]);

  const toggleFavorite = useCallback((station: Station) => {
    setFavoriteStationIds((prev) => {
      const next = new Set(prev);
      if (next.has(station.uuid)) {
        next.delete(station.uuid);
      } else {
        next.add(station.uuid);
      }
      return next;
    });
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      playNext();
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

  const deckStations = useMemo(() => {
    const pool = resolveActiveStations();
    return dedupeStations([...recentStations, ...pool]).slice(0, 12);
  }, [recentStations, resolveActiveStations]);

  const playerCards = useMemo<PlayerCard[]>(() => {
    const cards: PlayerCard[] = [{ type: "mission" }];
    for (const station of deckStations) {
      cards.push({ type: "station", station });
    }
    return cards;
  }, [deckStations]);

  const activeStationsSnapshot = resolveActiveStations();
  const hasStationsToCycle = activeStationsSnapshot.length > 0;
  const canSeekStations = activeStationsSnapshot.length > 1 || shuffleMode;

  useEffect(() => {
    if (playerCards.length === 0) {
      setActiveCardIndex(0);
      return;
    }

    if (activeCardIndex > playerCards.length - 1) {
      setActiveCardIndex(playerCards.length - 1);
    }
  }, [activeCardIndex, playerCards.length]);

  useEffect(() => {
    if (!nowPlaying) return;
    const stationIndex = playerCards.findIndex(
      (card) => card.type === "station" && card.station.uuid === nowPlaying.uuid
    );

    if (stationIndex > 0 && stationIndex !== activeCardIndex) {
      setCardDirection(stationIndex > activeCardIndex ? 1 : -1);
      setActiveCardIndex(stationIndex);
    }
  }, [activeCardIndex, nowPlaying, playerCards]);

  const activeCard = playerCards[activeCardIndex] ?? playerCards[0] ?? { type: "mission" };
  const totalCards = playerCards.length;
  const activeStationCard = activeCard.type === "station" ? activeCard.station : null;
  const activeStationIsCurrent = activeStationCard
    ? nowPlaying?.uuid === activeStationCard.uuid
    : false;
  const activeStationIsFavorite = activeStationCard
    ? favoriteStationIds.has(activeStationCard.uuid)
    : false;
  const globalStationCount = exploreStations.length || Math.max(deckStations.length - 1, 0);
  const localStationCount = stations.length;
  const worldCaption = isFetchingExplore
    ? "Loading global mixtape..."
    : `${globalStationCount.toLocaleString()} stations across the atlas`;
  const localCaption = `${localStationCount.toLocaleString()} stations from ${selectedCountry ?? "this country"}`;

  const handleCardChange = useCallback(
    (direction: 1 | -1) => {
      if (totalCards <= 1) return;
      setCardDirection(direction);
      setActiveCardIndex((prev) => {
        const next = (prev + direction + totalCards) % totalCards;
        return next;
      });
    },
    [totalCards]
  );

  const handleCardJump = useCallback(
    (index: number) => {
      if (index === activeCardIndex || index < 0 || index >= totalCards) {
        return;
      }

      setCardDirection(index > activeCardIndex ? 1 : -1);
      setActiveCardIndex(index);
    },
    [activeCardIndex, totalCards]
  );

  const cardSwipeHandlers = useSwipeable({
    onSwipedLeft: () => handleCardChange(1),
    onSwipedRight: () => handleCardChange(-1),
    trackMouse: true,
  });

  const handleContinentSelect = (continent: string | null) => {
    setSelectedContinent(continent);
    setActiveContinent(continent);
  };

  const handleQuickRetuneCountrySelect = (countryName: string) => {
    const countryMeta = countryMap.get(countryName) ?? null;
    const continent = countryMeta ? getContinent(countryMeta.iso_3166_1) : null;
    if (continent) {
      setSelectedContinent(continent);
      setActiveContinent(continent);
    }
    setListeningMode("local");
    setIsQuickRetuneOpen(false);
    navigate(`/?country=${encodeURIComponent(countryName)}`, { preventScrollReset: true });
  };

  const handleSurpriseRetune = () => {
    const pool = topCountries.length > 0 ? topCountries : countries;
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (!random) return;

    const continent = getContinent(random.iso_3166_1);
    setSelectedContinent(continent);
    setActiveContinent(continent);
    setListeningMode("local");
    setIsQuickRetuneOpen(false);
    navigate(`/?country=${encodeURIComponent(random.name)}`, { preventScrollReset: true });
  };

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
            <PassportStampIcon size={48} animated={false} id="header" />
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
        className="relative z-10 mx-auto max-w-6xl px-4 pb-96 pt-12 md:px-8"
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
              <PassportStampIcon size={82} id="hero" />
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
                  <PassportStampIcon size={64} animated={false} id={stamp.id} />
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
                      <PassportStampIcon size={92} id="preview" />
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

            <section className="mt-8">
              <div className="player-stack-shell">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Title order={2} style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                      Radio passport player
                    </Title>
                    <Text size="sm" c="rgba(226,232,240,0.68)">
                      Swipe through recently stamped stations and queue your next destination.
                    </Text>
                  </div>
                  <Badge
                    radius="xl"
                    size="md"
                    leftSection={<IconHeadphones size={16} />}
                    style={{
                      background: "rgba(199,158,73,0.2)",
                      border: "1px solid rgba(199,158,73,0.45)",
                      color: "#fefae0",
                    }}
                  >
                    {Math.max(totalCards - 1, 0).toLocaleString()} stations in stack
                  </Badge>
                </div>

                <div className="player-card-stack mt-6" {...cardSwipeHandlers}>
                  <AnimatePresence initial={false} custom={cardDirection} mode="wait">
                    <motion.div
                      key={activeCard.type === "station" ? activeCard.station.uuid : "mission-card"}
                      custom={cardDirection}
                      variants={PLAYER_CARD_VARIANTS}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={PLAYER_CARD_TRANSITION}
                      className="player-card-layer"
                    >
                      {activeCard.type === "mission" ? (
                        <div className="mission-card">
                          <Badge
                            radius="xl"
                            size="sm"
                            leftSection={<IconCompass size={14} />}
                            style={{
                              background: "rgba(209,73,91,0.16)",
                              border: "1px solid rgba(209,73,91,0.35)",
                              color: "#f4ede0",
                            }}
                          >
                            Mission brief
                          </Badge>
                          <Title
                            order={3}
                            style={{ fontSize: "1.75rem", fontWeight: 600, color: "#fefae0" }}
                          >
                            For explorers who believe music speaks every language — travel the world one frequency at a time.
                          </Title>
                          <Text size="sm" c="rgba(226,232,240,0.7)">
                            Choose your compass mode to guide the stories we surface and keep your radio passport feeling personal and alive.
                          </Text>
                          <div className="mission-card__toggles">
                            <button
                              type="button"
                              className={`mode-toggle-btn ${
                                listeningMode === "world" ? "mode-toggle-btn--active" : ""
                              }`}
                              onClick={() => setListeningMode("world")}
                              aria-pressed={listeningMode === "world"}
                            >
                              <span className="mode-toggle-btn__icon" aria-hidden="true">
                                🌎
                              </span>
                              <div className="mode-toggle-btn__content">
                                <span className="mode-toggle-btn__title">Explore the World</span>
                                <span className="mode-toggle-btn__caption">{worldCaption}</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              className={`mode-toggle-btn ${
                                listeningMode === "local" ? "mode-toggle-btn--active" : ""
                              }`}
                              onClick={() => setListeningMode("local")}
                              aria-pressed={listeningMode === "local"}
                            >
                              <span className="mode-toggle-btn__icon" aria-hidden="true">
                                📻
                              </span>
                              <div className="mode-toggle-btn__content">
                                <span className="mode-toggle-btn__title">Stay Local</span>
                                <span className="mode-toggle-btn__caption">{localCaption}</span>
                              </div>
                            </button>
                          </div>
                          <Text size="xs" c="rgba(226,232,240,0.55)">
                            Your mode is saved locally so every visit picks up the journey where you left it.
                          </Text>
                        </div>
                      ) : (
                        <div className="player-card">
                          <div className="player-card__header">
                            <div className="player-card__avatar">
                              {activeStationCard?.favicon ? (
                                <Avatar
                                  src={activeStationCard.favicon}
                                  size={76}
                                  radius="xl"
                                  style={{ border: "1px solid rgba(255,255,255,0.16)" }}
                                />
                              ) : (
                                <ThemeIcon
                                  size={76}
                                  radius="xl"
                                  style={{
                                    background: "rgba(15,23,42,0.75)",
                                    border: "1px solid rgba(148,163,184,0.25)",
                                  }}
                                >
                                  <IconBroadcast size={32} />
                                </ThemeIcon>
                              )}
                            </div>
                            <div className="player-card__title-block">
                              <div className="player-card__title-row">
                                <Text fw={600} size="lg" c="#f8fafc" lineClamp={1}>
                                  {activeStationCard?.name}
                                </Text>
                                {activeStationCard?.bitrate ? (
                                  <Badge
                                    radius="xl"
                                    size="xs"
                                    leftSection={<IconWaveSine size={11} />}
                                    style={{
                                      background: "rgba(92,158,173,0.18)",
                                      border: "1px solid rgba(92,158,173,0.35)",
                                      color: "#fefae0",
                                    }}
                                  >
                                    {activeStationCard.bitrate} kbps
                                  </Badge>
                                ) : activeStationCard?.codec ? (
                                  <Badge
                                    radius="xl"
                                    size="xs"
                                    leftSection={<IconWaveSine size={11} />}
                                    style={{
                                      background: "rgba(92,158,173,0.18)",
                                      border: "1px solid rgba(92,158,173,0.35)",
                                      color: "#fefae0",
                                    }}
                                  >
                                    {activeStationCard.codec}
                                  </Badge>
                                ) : null}
                              </div>
                              <div className="player-card__meta-row">
                                {activeStationCard && (
                                  <>
                                    <CountryFlag
                                      iso={countryMap.get(activeStationCard.country)?.iso_3166_1}
                                      title={`${activeStationCard.country} flag`}
                                      size={28}
                                    />
                                    <span>{activeStationCard.country}</span>
                                    {activeStationCard.language && (
                                      <>
                                        <span aria-hidden="true">•</span>
                                        <span>{activeStationCard.language}</span>
                                      </>
                                    )}
                                    {activeStationCard.bitrate ? (
                                      <>
                                        <span aria-hidden="true">•</span>
                                        <span>{activeStationCard.bitrate} kbps</span>
                                      </>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {activeStationCard?.tags && (
                            <Text size="sm" c="rgba(226,232,240,0.72)" className="player-card__tags">
                              {activeStationCard.tags}
                            </Text>
                          )}
                          <div className="player-card__badges">
                            {activeStationCard?.codec && (
                              <Badge
                                radius="xl"
                                size="xs"
                                leftSection={<IconDisc size={11} />}
                                style={{
                                  background: "rgba(37,99,235,0.12)",
                                  border: "1px solid rgba(37,99,235,0.28)",
                                  color: "rgba(191,219,254,0.85)",
                                }}
                              >
                                {activeStationCard.codec}
                              </Badge>
                            )}
                            {activeStationCard?.tags && (
                              <Badge
                                radius="xl"
                                size="xs"
                                leftSection={<IconMusic size={11} />}
                                style={{
                                  background: "rgba(199,158,73,0.16)",
                                  border: "1px solid rgba(199,158,73,0.32)",
                                  color: "#fefae0",
                                }}
                              >
                                Passport vibes
                              </Badge>
                            )}
                          </div>
                          <div className="player-card__actions">
                            <div className="flex items-center gap-2">
                              {activeStationCard && (
                                <Tooltip
                                  label={
                                    activeStationIsFavorite
                                      ? "Remove from travel log"
                                      : "Add to travel log"
                                  }
                                  withArrow
                                  color="gray"
                                >
                                  <ActionIcon
                                    size="lg"
                                    radius="xl"
                                    onClick={() => toggleFavorite(activeStationCard)}
                                    style={{
                                      background: activeStationIsFavorite
                                        ? "linear-gradient(120deg, rgba(209,73,91,0.9) 0%, rgba(148,34,56,0.9) 100%)"
                                        : "rgba(15,23,42,0.7)",
                                      border: activeStationIsFavorite
                                        ? "1px solid rgba(254,250,226,0.6)"
                                        : "1px solid rgba(148,163,184,0.25)",
                                      color: activeStationIsFavorite ? "#fef3f2" : "rgba(248,250,252,0.85)",
                                    }}
                                  >
                                    <IconHeart
                                      size={18}
                                      fill={activeStationIsFavorite ? "currentColor" : "none"}
                                    />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                              {activeStationCard && (
                                <Tooltip label="Open stream" withArrow color="gray">
                                  <ActionIcon
                                    component="a"
                                    href={activeStationCard.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    size="lg"
                                    radius="xl"
                                    style={{
                                      background: "rgba(15,23,42,0.7)",
                                      border: "1px solid rgba(148,163,184,0.25)",
                                      color: "rgba(248,250,252,0.85)",
                                    }}
                                  >
                                    <IconExternalLink size={18} />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {activeStationCard && (
                                <Button
                                  radius="xl"
                                  size="sm"
                                  leftSection={
                                    activeStationIsCurrent && isPlaying ? (
                                      <IconPlayerPauseFilled size={16} />
                                    ) : (
                                      <IconPlayerPlayFilled size={16} />
                                    )
                                  }
                                  onClick={() => {
                                    if (!activeStationCard) return;
                                    if (activeStationIsCurrent) {
                                      if (isPlaying) {
                                        playPause();
                                      } else {
                                        startStation(activeStationCard, { autoPlay: true });
                                      }
                                    } else {
                                      startStation(activeStationCard, { autoPlay: true });
                                    }
                                  }}
                                  style={{
                                    background:
                                      "linear-gradient(120deg, rgba(199,158,73,0.92) 0%, rgba(148,113,51,0.92) 100%)",
                                    color: "#0f172a",
                                    fontWeight: 600,
                                    border: "1px solid rgba(254,250,226,0.6)",
                                  }}
                                >
                                  {activeStationIsCurrent ? (isPlaying ? "Pause" : "Resume") : "Play now"}
                                </Button>
                              )}
                              <Button
                                radius="xl"
                                variant="outline"
                                size="sm"
                                rightSection={<IconPlayerTrackNext size={16} />}
                                onClick={playNext}
                                disabled={!hasStationsToCycle}
                                style={{
                                  border: "1px solid rgba(148,163,184,0.35)",
                                  color: "rgba(248,250,252,0.85)",
                                  background: "rgba(10,20,38,0.4)",
                                  opacity: hasStationsToCycle ? 1 : 0.4,
                                }}
                              >
                                Next destination
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="player-card-controls">
                  <div className="player-card-dots" role="tablist" aria-label="Player cards">
                    {playerCards.map((card, index) => {
                      const isActive = index === activeCardIndex;
                      const key =
                        card.type === "station" ? `card-${card.station.uuid}` : `mission-${index}`;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`player-card-dot ${isActive ? "player-card-dot--active" : ""}`}
                          onClick={() => handleCardJump(index)}
                          aria-pressed={isActive}
                          aria-label={
                            card.type === "station" ? `Station ${card.station.name}` : "Mission card"
                          }
                          disabled={totalCards <= 1}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      radius="xl"
                      variant="subtle"
                      size="sm"
                      leftSection={<IconPlayerTrackPrev size={16} />}
                      onClick={() => handleCardChange(-1)}
                      disabled={totalCards <= 1}
                      style={{
                        color: "#fefae0",
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        opacity: totalCards <= 1 ? 0.4 : 1,
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      radius="xl"
                      variant="subtle"
                      size="sm"
                      rightSection={<IconPlayerTrackNext size={16} />}
                      onClick={() => handleCardChange(1)}
                      disabled={totalCards <= 1}
                      style={{
                        color: "#fefae0",
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        opacity: totalCards <= 1 ? 0.4 : 1,
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </section>

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
                                startStation(station, { autoPlay: true });
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

      <QuickRetuneWidget
        isOpen={isQuickRetuneOpen}
        onOpenChange={setIsQuickRetuneOpen}
        continents={continents}
        activeContinent={selectedContinent}
        onContinentSelect={handleContinentSelect}
        countriesByContinent={continentData}
        topCountries={topCountries}
        onCountrySelect={handleQuickRetuneCountrySelect}
        onSurprise={handleSurpriseRetune}
      />

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

                  <div className="flex w-full flex-col items-center gap-3 md:self-end">
                    <div className="player-mode-chip">
                      <span className="player-mode-chip__label">Listening mode</span>
                      <span className="player-mode-chip__value">
                        {listeningMode === "world" ? "Explore the World" : "Stay Local"}
                      </span>
                    </div>
                    <Button
                      radius="xl"
                      size="xs"
                      variant="light"
                      leftSection={<IconMapPin size={16} />}
                      onClick={() => setIsQuickRetuneOpen(true)}
                      style={{
                        color: "#0f172a",
                        background: "rgba(254,250,226,0.9)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        fontWeight: 600,
                      }}
                    >
                      Quick retune
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end md:pr-2">
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        onClick={handleBackToWorldView}
                        style={{
                          background: "rgba(15,23,42,0.7)",
                          border: "1px solid rgba(148,163,184,0.25)",
                          color: "#f8fafc",
                        }}
                      >
                        <IconArrowLeft size={18} />
                      </ActionIcon>
                    </motion.div>
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
                        size="lg"
                        radius="xl"
                        onClick={playPrevious}
                        disabled={!canSeekStations}
                        style={{
                          background: "rgba(15,23,42,0.7)",
                          border: "1px solid rgba(148,163,184,0.25)",
                          color: "#f8fafc",
                          opacity: canSeekStations ? 1 : 0.4,
                        }}
                      >
                        <IconPlayerTrackPrev size={20} />
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
                        disabled={!hasStationsToCycle}
                        style={{
                          background: "rgba(15,23,42,0.7)",
                          border: "1px solid rgba(148,163,184,0.25)",
                          color: "#f8fafc",
                          opacity: hasStationsToCycle ? 1 : 0.4,
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
