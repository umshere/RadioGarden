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
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Badge,
  Text,
  Group,
  Stack,
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
  const { countries, stations, selectedCountry } = useLoaderData<typeof loader>();
  const [sp] = useSearchParams();
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

  const isRouteTransitioning = navigation.state !== "idle";

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
    <div className="app-bg relative min-h-screen text-slate-100">
      <header className="nav-shell">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-slate-100">
            <Avatar
              src="/icon.png"
              alt="Radio Passport icon"
              size={44}
              radius="xl"
              styles={{
                root: {
                  background: "linear-gradient(140deg, rgba(24,37,63,0.9) 0%, rgba(15,23,42,0.9) 100%)",
                  border: "1px solid rgba(199, 158, 73, 0.45)",
                  boxShadow: "0 12px 28px rgba(5, 11, 25, 0.4)",
                  padding: 6,
                },
                image: {
                  borderRadius: "9999px",
                },
              }}
            />
            <span className="hidden text-lg tracking-tight md:block">Radio Passport</span>
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
              background: "linear-gradient(120deg, rgba(199,158,73,0.85) 0%, rgba(148,113,51,0.85) 100%)",
              color: "#0f172a",
              border: "1px solid rgba(254, 250, 226, 0.65)",
              fontWeight: 600,
              letterSpacing: 0.3,
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
        {!selectedCountry ? (
          <>
            <motion.section
              id="explore"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hero-surface px-6 py-8 md:px-10 md:py-12"
            >
              <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl space-y-6">
                  <Badge
                    radius="xl"
                    size="md"
                    leftSection={<IconHeadphones size={16} />}
                    style={{
                      background: "rgba(199, 158, 73, 0.18)",
                      border: "1px solid rgba(199, 158, 73, 0.45)",
                      color: "#fefae0",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                    }}
                  >
                    Global radio atlas
                  </Badge>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src="/icon.png"
                        alt="Radio Passport emblem"
                        size={60}
                        radius="xl"
                        styles={{
                          root: {
                            background: "linear-gradient(140deg, rgba(24,37,63,0.9) 0%, rgba(15,23,42,0.9) 100%)",
                            border: "1px solid rgba(199, 158, 73, 0.45)",
                            boxShadow: "0 12px 28px rgba(5, 11, 25, 0.4)",
                            padding: 8,
                          },
                          image: {
                            borderRadius: "9999px",
                          },
                        }}
                      />
                      <Title order={1} style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.15 }}>
                        Tune into the world, one passport stamp at a time.
                      </Title>
                    </div>
                    <Text size="lg" c="rgba(226,232,240,0.72)" style={{ lineHeight: 1.6 }}>
                      Discover broadcast gems from every corner of the globe with a calm, curated interface
                      that feels like leafing through a well-traveled journal.
                    </Text>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <Text size="xs" c="rgba(226,232,240,0.6)" fw={500}>
                        Countries featured
                      </Text>
                      <Text size="xl" fw={700}>
                        {topCountries.length.toLocaleString()}
                      </Text>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <Text size="xs" c="rgba(226,232,240,0.6)" fw={500}>
                        Stations tracked
                      </Text>
                      <Text size="xl" fw={700}>
                        {totalStations.toLocaleString()}
                      </Text>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <Text size="xs" c="rgba(226,232,240,0.6)" fw={500}>
                        Continents covered
                      </Text>
                      <Text size="xl" fw={700}>
                        {continents.length}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur">
                  <Text size="sm" c="rgba(226,232,240,0.65)" fw={500}>
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
                          background: "rgba(6, 13, 27, 0.55)",
                          borderColor: "rgba(148, 163, 184, 0.25)",
                          color: "#f8fafc",
                          fontWeight: 500,
                          "&:focus": {
                            borderColor: "rgba(199, 158, 73, 0.55)",
                            boxShadow: "0 0 0 3px rgba(199, 158, 73, 0.18)",
                          },
                          "&::placeholder": {
                            color: "rgba(148, 163, 184, 0.7)",
                          },
                        },
                      }}
                    />
                  </Form>
                  <Button
                    component="a"
                    href="#explore"
                    radius="xl"
                    rightSection={<IconCompass size={16} />}
                    style={{
                      background: "linear-gradient(120deg, rgba(199,158,73,0.9) 0%, rgba(148,113,51,0.9) 100%)",
                      color: "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    Browse featured regions
                  </Button>
                </div>
              </div>
            </motion.section>

            <section className="mt-12 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Title order={2} style={{ fontSize: "1.75rem", fontWeight: 600 }}>
                    Chart your path by continent
                  </Title>
                  <Text size="sm" c="rgba(226,232,240,0.65)">
                    Filter the atlas to the regions that match your listening mood.
                  </Text>
                </div>
                <Text size="sm" c="rgba(226,232,240,0.5)">
                  Showing {filteredCountries.length.toLocaleString()} of {topCountries.length.toLocaleString()} spotlight countries
                </Text>
              </div>

              <div className="scroll-track overflow-x-auto pb-2">
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
                  <Text size="md" c="rgba(226,232,240,0.6)">
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
                    onClick={() => navigate("/", { preventScrollReset: true })}
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
