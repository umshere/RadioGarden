import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
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
  SimpleGrid,
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
  IconEPassport,
  IconSearch,
  IconMenu2,
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
  const [nowPlaying, setNowPlaying] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const stationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeContinent, setActiveContinent] = useState<string | null>(null);

  const topCountries = [...countries]
    .sort((a, b) => b.stationcount - a.stationcount)
    .slice(0, 80);

  // Build continent/country data
  const continentData = topCountries.reduce((acc, country) => {
    const continent = getContinent(country.iso_3166_1);
    if (!acc[continent]) {
      acc[continent] = [];
    }
    acc[continent].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const continents = Object.keys(continentData).sort();
  const currentContinent = nowPlaying ? getContinent(countries.find(c => c.name === nowPlaying.country)?.iso_3166_1) : null;
  const [selectedContinent, setSelectedContinent] = useState<string | null>(currentContinent);
  
  const countriesInContinent = selectedContinent ? continentData[selectedContinent] || [] : [];

  // Scroll to playing station
  useEffect(() => {
    if (nowPlaying && stationRefs.current[nowPlaying.uuid]) {
      stationRefs.current[nowPlaying.uuid]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [nowPlaying]);

  useEffect(() => {
    if (nowPlaying && audioRef.current) {
      audioRef.current.src = nowPlaying.url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        /* ignore */
      });
    }
  }, [nowPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    let animationFrame: number;
    const animate = () => {
      if (isPlaying) {
        setAudioLevel(Math.random() * 0.7 + 0.3);
      } else {
        setAudioLevel(0);
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  const playPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const playNext = () => {
    if (stations.length === 0) return;
    
    let nextIndex;
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * stations.length);
    } else {
      nextIndex = (currentStationIndex + 1) % stations.length;
    }
    
    setCurrentStationIndex(nextIndex);
    const nextStation = stations[nextIndex];
    if (nextStation) {
      setNowPlaying(nextStation as Station);
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
      }
    },
    trackMouse: true
  });

  const getCountryGradient = (countryName: string | null) => {
    if (!countryName) return "from-[#1e1b4b] via-[#1e1b4b] to-[#2d2a5f]";
    
    const gradients: Record<string, string> = {
      "United States": "from-[#1e1b4b] via-blue-950/40 to-red-950/40",
      "Canada": "from-[#1e1b4b] via-red-950/40 to-white/10",
      "Mexico": "from-[#1e1b4b] via-green-950/40 to-red-950/40",
      "Brazil": "from-[#1e1b4b] via-green-950/40 to-yellow-950/40",
      "United Kingdom": "from-[#1e1b4b] via-blue-950/40 to-red-950/40",
      "France": "from-[#1e1b4b] via-blue-950/40 to-red-950/40",
      "Germany": "from-[#1e1b4b] via-yellow-950/40 to-red-950/40",
      "Italy": "from-[#1e1b4b] via-green-950/40 to-red-950/40",
      "Spain": "from-[#1e1b4b] via-red-950/40 to-yellow-950/40",
      "Japan": "from-[#1e1b4b] via-white/10 to-red-950/40",
      "Australia": "from-[#1e1b4b] via-blue-950/40 to-yellow-950/40",
    };
    
    return gradients[countryName] || "from-[#1e1b4b] via-emerald-950/40 to-purple-950/40";
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vibrant Pink Header Background - Like mockup */}
      <div
        className="absolute top-0 left-0 right-0 h-80"
        style={{
          background: 'linear-gradient(135deg, #FF1B8D 0%, #FE85B2 50%, #FF69B4 100%)',
        }}
      />
      
      {/* Soft Pink to Lavender Background for content area */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, transparent 200px, #F8E8F5 300px, #F5E6F0 100%)',
        }}
      />

      <main className="relative z-10 mx-auto max-w-7xl p-4 md:p-6 pb-48" {...swipeHandlers}>
        {/* Vibrant Header with Pink Theme */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-40 mb-10 pt-6"
        >
          <div 
            className="rounded-3xl p-8 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(255, 27, 141, 0.3)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <Group gap="md" align="center">
                  {selectedCountry && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        component="a"
                        href="/"
                        variant="filled"
                        radius="xl"
                        size="md"
                        leftSection={<IconArrowLeft size={18} />}
                        style={{
                          background: 'linear-gradient(135deg, #FF1B8D 0%, #FF69B4 100%)',
                          color: 'white',
                        }}
                      >
                        Back
                      </Button>
                    </motion.div>
                  )}

                  <Group gap="md" align="center">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 rounded-2xl blur-xl opacity-60" 
                        style={{
                          background: 'linear-gradient(135deg, #FF1B8D 0%, #FFD700 100%)',
                        }}
                      />
                      <ThemeIcon
                        size={64}
                        radius="xl"
                        className="relative"
                        style={{
                          background: 'linear-gradient(135deg, #FF1B8D 0%, #FFD700 100%)',
                          boxShadow: '0 8px 24px rgba(255, 27, 141, 0.4)',
                        }}
                      >
                        <IconEPassport size={36} stroke={2} style={{ color: 'white' }} />
                      </ThemeIcon>
                    </div>
                    <div>
                      <Title
                        order={1}
                        style={{ 
                          fontSize: '2.5rem', 
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #FF1B8D 0%, #8B5CF6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Radio Passport
                      </Title>
                      <Text size="md" fw={500} style={{ color: '#6B21A8' }}>
                        Tune into the world, one station at a time
                      </Text>
                    </div>
                  </Group>
                </Group>

                {!selectedCountry && (
                  <Form
                    method="get"
                    onChange={(e) => submit(e.currentTarget)}
                    className="flex-1 max-w-md"
                  >
                    <Input
                      name="q"
                      placeholder="Search countries..."
                      size="lg"
                      radius="xl"
                      defaultValue={sp.get("q") ?? ""}
                      leftSection={<IconSearch size={20} />}
                      styles={{
                        input: {
                          background: "rgba(255, 255, 255, 0.6)",
                          backdropFilter: "blur(10px)",
                          borderColor: "rgba(255, 27, 141, 0.3)",
                          color: "#4A1D5F",
                          fontWeight: 500,
                          transition: "all 0.3s ease",
                          "&:focus": {
                            borderColor: "#FF1B8D",
                            boxShadow: "0 0 0 3px rgba(255, 27, 141, 0.15)",
                            background: "rgba(255, 255, 255, 0.8)",
                          },
                          "&::placeholder": {
                            color: "#9333EA",
                            opacity: 0.6,
                          }
                        },
                      }}
                    />
                  </Form>
                )}
              </Group>

              <div 
                className="h-px w-full my-2" 
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 27, 141, 0.3) 50%, transparent 100%)',
                }}
              />

              <Group gap="sm" wrap="wrap">
                <Badge 
                  radius="xl" 
                  variant="filled" 
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF1B8D 0%, #FF69B4 100%)',
                    color: 'white',
                  }}
                >
                  🌍 {topCountries.length.toLocaleString()} countries
                </Badge>
                <Badge 
                  radius="xl" 
                  variant="filled" 
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: 'white',
                  }}
                >
                  📻 {countries.reduce((sum, c) => sum + c.stationcount, 0).toLocaleString()} stations
                </Badge>
              </Group>
            </Stack>
          </div>
        </motion.header>

        {/* Continent Tab Navigation */}
        {!selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-30 mb-8"
          >
            <div 
              className="rounded-2xl p-3 shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 27, 141, 0.2)',
              }}
            >
              <Group gap="xs" wrap="nowrap" className="overflow-x-auto">
                <Button
                  radius="xl"
                  size="md"
                  variant={activeContinent === null ? "filled" : "subtle"}
                  onClick={() => setActiveContinent(null)}
                  styles={{
                    root: activeContinent === null ? {
                      background: 'linear-gradient(135deg, #FF1B8D 0%, #FF69B4 100%)',
                      color: 'white',
                      fontWeight: 600,
                    } : {
                      background: 'transparent',
                      color: '#8B5CF6',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(255, 27, 141, 0.1)',
                      }
                    }
                  }}
                >
                  🌍 All
                </Button>
                {continents.map((continent) => {
                  const continentEmoji: Record<string, string> = {
                    'Europe': '🇪🇺',
                    'Asia': '🌏',
                    'North America': '🌎',
                    'South America': '🌎',
                    'Africa': '🌍',
                    'Oceania': '🏝️',
                    'Other': '🌐',
                  };
                  return (
                    <Button
                      key={continent}
                      radius="xl"
                      size="md"
                      variant={activeContinent === continent ? "filled" : "subtle"}
                      onClick={() => setActiveContinent(continent)}
                      styles={{
                        root: activeContinent === continent ? {
                          background: 'linear-gradient(135deg, #FF1B8D 0%, #FF69B4 100%)',
                          color: 'white',
                          fontWeight: 600,
                        } : {
                          background: 'transparent',
                          color: '#8B5CF6',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'rgba(255, 27, 141, 0.1)',
                          }
                        }
                      }}
                    >
                      {continentEmoji[continent] || '🌐'} {continent}
                    </Button>
                  );
                })}
              </Group>
            </div>
          </motion.div>
        )}

        {/* Passport Stamps Grid */}
        {!selectedCountry && (
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 
                className="text-3xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FF1B8D 0%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                🌏 Explore Countries
              </h2>
              <p className="text-base font-medium" style={{ color: '#6B21A8' }}>
                Click a country to discover radio stations
              </p>
            </motion.div>

            {(() => {
              const filteredCountries = topCountries.filter((c) => {
                const q = sp.get("q")?.toLowerCase() ?? "";
                return q ? c.name.toLowerCase().includes(q) : true;
              });

              const countriesByContinent = filteredCountries.reduce((acc, country) => {
                const continent = getContinent(country.iso_3166_1);
                if (!acc[continent]) {
                  acc[continent] = [];
                }
                acc[continent].push(country);
                return acc;
              }, {} as Record<string, Country[]>);

              const sortedContinents = Object.entries(countriesByContinent).sort(
                ([, a], [, b]) => {
                  const totalA = a.reduce((sum, c) => sum + c.stationcount, 0);
                  const totalB = b.reduce((sum, c) => sum + c.stationcount, 0);
                  return totalB - totalA;
                }
              );

              // Filter by active continent if one is selected
              const displayContinents = activeContinent 
                ? sortedContinents.filter(([continent]) => continent === activeContinent)
                : sortedContinents;

              return displayContinents.map(([continent, continentCountries]) => {
                const totalStations = continentCountries.reduce((sum, c) => sum + c.stationcount, 0);

                return (
                  <motion.section
                    key={continent}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-10"
                  >
                    <div 
                      className="rounded-3xl p-8 shadow-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        border: '1.5px solid rgba(255, 27, 141, 0.2)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
                      }}
                    >
                      <Stack gap="xl">
                        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                          <Group gap="sm">
                            <div className="relative">
                              <div 
                                className="absolute inset-0 rounded-xl blur-lg opacity-50" 
                                style={{
                                  background: 'linear-gradient(135deg, #FF1B8D 0%, #FFD700 100%)',
                                }}
                              />
                              <ThemeIcon
                                size={56}
                                radius="xl"
                                className="relative"
                                style={{
                                  background: 'linear-gradient(135deg, #FF1B8D 0%, #FFD700 100%)',
                                }}
                              >
                                <IconWorld size={30} stroke={1.8} style={{ color: 'white' }} />
                              </ThemeIcon>
                            </div>
                            <div>
                              <Title 
                                order={3} 
                                style={{ 
                                  color: '#4A1D5F', 
                                  fontWeight: 700, 
                                  fontSize: '1.75rem' 
                                }}
                              >
                                {continent}
                              </Title>
                              <Text size="md" fw={500} style={{ color: '#8B5CF6' }}>
                                {continentCountries.length} countries • {totalStations.toLocaleString()} stations
                              </Text>
                            </div>
                          </Group>
                          <Badge
                            size="xl"
                            radius="xl"
                            leftSection={<IconBroadcast size={18} />}
                            style={{
                              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1rem',
                              padding: '12px 20px',
                            }}
                          >
                            {totalStations.toLocaleString()}
                          </Badge>
                        </Group>

                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing="lg">
                          {continentCountries.map((c, idx) => (
                            <motion.div
                              key={c.name}
                              initial={{ opacity: 0, y: 30, scale: 0.92 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: idx * 0.03, type: "spring", stiffness: 200, damping: 20 }}
                              whileHover={{ y: -8 }}
                            >
                              <Tooltip 
                                label={`${c.name} • ${c.stationcount.toLocaleString()} stations`} 
                                withArrow 
                                color="pink"
                                styles={{
                                  tooltip: {
                                    background: 'linear-gradient(135deg, #FF1B8D 0%, #FF69B4 100%)',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: 600,
                                  }
                                }}
                              >
                                <Card
                                  component="a"
                                  href={`/?country=${encodeURIComponent(c.name)}`}
                                  radius="xl"
                                  p="lg"
                                  className="stamp-card"
                                >
                                  <div className="stamp-card__perforation" />
                                  <div className="stamp-card__glow" />
                                  <Stack align="center" gap="sm" className="relative z-10 text-center">
                                    <CountryFlag
                                      iso={c.iso_3166_1}
                                      title={`${c.name} flag`}
                                      size={56}
                                    />
                                    <Title 
                                      order={4} 
                                      style={{ 
                                        color: '#4A1D5F', 
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {c.name}
                                    </Title>
                                    <Badge
                                      size="sm"
                                      radius="xl"
                                      variant="filled"
                                      leftSection={<IconBroadcast size={12} />}
                                      style={{
                                        background: 'linear-gradient(135deg, #8B5CF6 0%, #FF1B8D 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {c.stationcount.toLocaleString()}
                                    </Badge>
                                  </Stack>
                                </Card>
                              </Tooltip>
                            </motion.div>
                          ))}
                        </SimpleGrid>
                      </Stack>
                    </div>
                  </motion.section>
                );
              });
            })()}
          </section>
        )}

        {/* Station Discovery Interface */}
        {selectedCountry && (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="md" className="mb-8">
              <Group gap="md" align="center">
                <CountryFlag
                  iso={countries.find((c) => c.name === selectedCountry)?.iso_3166_1}
                  title={`${selectedCountry} flag`}
                  size={52}
                />
                <div>
                  <Title 
                    order={2} 
                    style={{ 
                      fontSize: '2rem',
                      background: 'linear-gradient(135deg, #FF1B8D 0%, #8B5CF6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: 700,
                    }}
                  >
                    {selectedCountry}
                  </Title>
                  <Text size="md" fw={500} style={{ color: '#6B21A8' }}>
                    {stations.length.toLocaleString()} stations available
                  </Text>
                </div>
              </Group>
            </Group>

            {stations.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center">
                <Text size="lg" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                  No stations found for this country
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stations.map((s, idx) => {
                  const isCurrentlyPlaying = nowPlaying?.uuid === s.uuid;
                  return (
                    <motion.div
                      key={s.uuid}
                      ref={(el) => { stationRefs.current[s.uuid] = el; }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Card 
                        radius="xl" 
                        p="lg" 
                        className={`station-card ${isCurrentlyPlaying ? 'station-card--playing' : ''}`}
                      >
                      <Stack gap="md">
                        <Group align="flex-start" gap="md" wrap="nowrap">
                          {s.favicon ? (
                            <Avatar
                              src={s.favicon}
                              size={68}
                              radius="lg"
                              className="station-card__avatar"
                            />
                          ) : (
                            <ThemeIcon
                              size={68}
                              radius="lg"
                              variant="gradient"
                              gradient={{ from: "violet.5", to: "purple.6", deg: 140 }}
                              className="station-card__avatar"
                            >
                              <IconBroadcast size={30} />
                            </ThemeIcon>
                          )}

                          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                            <Group justify="space-between" align="flex-start" gap="xs">
                              <Text fw={600} size="sm" lineClamp={1} style={{ color: 'white' }}>
                                {s.name}
                              </Text>
                              {s.codec && (
                                <Badge
                                  size="xs"
                                  radius="xl"
                                  variant="light"
                                  color="violet"
                                  leftSection={<IconWaveSine size={12} />}
                                  styles={{
                                    root: {
                                      background: 'rgba(139, 92, 246, 0.15)',
                                      border: '1px solid rgba(139, 92, 246, 0.25)',
                                    }
                                  }}
                                >
                                  {s.codec}
                                </Badge>
                              )}
                            </Group>

                            {s.tags && (
                              <Text size="xs" lineClamp={2} style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                {s.tags}
                              </Text>
                            )}

                            <Group gap="xs" wrap="wrap">
                              {s.language && (
                                <Badge
                                  size="xs"
                                  radius="xl"
                                  variant="light"
                                  color="blue"
                                  leftSection={<IconLanguage size={11} />}
                                  styles={{
                                    root: {
                                      background: 'rgba(59, 130, 246, 0.12)',
                                      border: '1px solid rgba(59, 130, 246, 0.2)',
                                    }
                                  }}
                                >
                                  {s.language}
                                </Badge>
                              )}
                              {s.bitrate > 0 && (
                                <Badge
                                  size="xs"
                                  radius="xl"
                                  variant="light"
                                  color="pink"
                                  leftSection={<IconMusic size={11} />}
                                  styles={{
                                    root: {
                                      background: 'rgba(236, 72, 153, 0.12)',
                                      border: '1px solid rgba(236, 72, 153, 0.2)',
                                    }
                                  }}
                                >
                                  {s.bitrate} kbps
                                </Badge>
                              )}
                            </Group>
                          </Stack>
                        </Group>

                        <div className="divider-soft" />

                        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
                          <Group gap="xs">
                            <Tooltip label="Open stream" withArrow color="dark">
                              <ActionIcon
                                component="a"
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                size="lg"
                                radius="xl"
                                variant="light"
                                color="gray"
                                styles={{
                                  root: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                  }
                                }}
                              >
                                <IconExternalLink size={18} />
                              </ActionIcon>
                            </Tooltip>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                radius="xl"
                                size="md"
                                leftSection={<IconPlayerPlayFilled size={18} />}
                                onClick={() => {
                                  setCurrentStationIndex(idx);
                                  setNowPlaying(s as Station);
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
                                }}
                              >
                                Play
                              </Button>
                            </motion.div>
                          </Group>
                        </Group>
                      </Stack>
                    </Card>
                  </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </main>

      {/* Vibrant Audio Player Footer */}
      <AnimatePresence>
        {nowPlaying && (
          <motion.footer
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="mx-auto w-full max-w-5xl relative">
              {/* Vibrant Pink Aurora Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl blur-3xl"
                animate={{
                  background: isPlaying 
                    ? [
                        'radial-gradient(circle at 20% 50%, rgba(255,27,141,0.4) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(255,215,0,0.4) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 80%, rgba(139,92,246,0.4) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 50%, rgba(255,27,141,0.4) 0%, transparent 50%)',
                      ]
                    : 'radial-gradient(circle at 50% 50%, rgba(255,27,141,0.25) 0%, transparent 50%)'
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              {/* Player Card with Vibrant Purple Background */}
              <div 
                className="relative rounded-3xl p-6 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.95) 0%, rgba(106, 13, 173, 0.98) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 27, 141, 0.4)',
                }}
              >
                <Group wrap="nowrap" gap="lg" align="flex-start">
                  {/* Album Art with Golden Glow */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="absolute -inset-3 rounded-2xl blur-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FF1B8D 100%)',
                      }}
                      animate={{
                        opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.2,
                        scale: isPlaying ? [1, 1.12, 1] : 1,
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <Avatar
                      src={nowPlaying.favicon || "https://placehold.co/80x80/8b5cf6/ffffff?text=📻"}
                      size={88}
                      radius="xl"
                      className="relative shadow-2xl"
                      style={{
                        border: '3px solid rgba(255, 215, 0, 0.6)',
                      }}
                    />
                  </div>

                  {/* Station Info */}
                  <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Badge
                      size="sm"
                      w="fit-content"
                      leftSection={<IconDisc size={14} />}
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      Now playing
                    </Badge>
                    <Text fw={700} size="xl" lineClamp={1} style={{ color: 'white' }}>
                      {nowPlaying.name}
                    </Text>
                    <Group gap="xs" align="center" wrap="nowrap">
                      <CountryFlag
                        iso={countries.find(c => c.name === nowPlaying.country)?.iso_3166_1}
                        title={`${nowPlaying.country} flag`}
                        size={28}
                      />
                      <Text size="sm" lineClamp={1} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {nowPlaying.country} • {nowPlaying.language || "Unknown"}
                      </Text>
                    </Group>

                    {/* Quick Navigation Selects */}
                    <Group gap="sm" wrap="wrap" mt="xs">
                      <Select
                        placeholder="Continent"
                        value={selectedContinent}
                        onChange={(value) => {
                          setSelectedContinent(value);
                          if (value && continentData[value] && continentData[value].length > 0) {
                            const firstCountry = continentData[value][0];
                            if (firstCountry) {
                              window.location.href = `/?country=${encodeURIComponent(firstCountry.name)}`;
                            }
                          }
                        }}
                        data={continents.map(c => ({ value: c, label: `${c}` }))}
                        size="xs"
                        radius="xl"
                        w={130}
                        styles={{
                          input: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderColor: 'rgba(139, 92, 246, 0.2)',
                            color: 'white',
                            fontSize: '0.75rem',
                          },
                          option: {
                            fontSize: '0.75rem',
                          }
                        }}
                        comboboxProps={{ shadow: 'xl' }}
                      />
                      
                      {selectedContinent && (
                        <Select
                          placeholder="Country"
                          value={nowPlaying.country}
                          onChange={(value) => {
                            if (value) {
                              window.location.href = `/?country=${encodeURIComponent(value)}`;
                            }
                          }}
                          data={countriesInContinent.map(c => ({ 
                            value: c.name, 
                            label: c.name
                          }))}
                          size="xs"
                          radius="xl"
                          w={150}
                          searchable
                          styles={{
                            input: {
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              borderColor: 'rgba(139, 92, 246, 0.2)',
                              color: 'white',
                              fontSize: '0.75rem',
                            },
                            option: {
                              fontSize: '0.75rem',
                            }
                          }}
                          comboboxProps={{ shadow: 'xl' }}
                        />
                      )}
                    </Group>
                  </Stack>

                  {/* Controls */}
                  <Group gap="xs" wrap="nowrap">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        variant={shuffleMode ? "filled" : "light"}
                        onClick={() => setShuffleMode(!shuffleMode)}
                        style={shuffleMode ? {
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                        } : {
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: 'white',
                        }}
                      >
                        <IconArrowsShuffle size={20} />
                      </ActionIcon>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ActionIcon
                        size="xl"
                        radius="xl"
                        onClick={playPause}
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
                        }}
                      >
                        {isPlaying ? (
                          <IconPlayerPauseFilled size={24} />
                        ) : (
                          <IconPlayerPlayFilled size={24} />
                        )}
                      </ActionIcon>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        onClick={playNext}
                        disabled={stations.length === 0}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: 'white',
                        }}
                      >
                        <IconPlayerTrackNext size={20} />
                      </ActionIcon>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        onClick={() => {
                          setNowPlaying(null);
                          setIsPlaying(false);
                        }}
                        style={{
                          background: 'rgba(255, 27, 141, 0.3)',
                          color: 'white',
                        }}
                      >
                        <IconX size={20} />
                      </ActionIcon>
                    </motion.div>
                  </Group>
                </Group>

                {/* Elegant Waveform Visualization */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 flex items-center justify-center gap-1 h-10"
                  >
                    {[...Array(50)].map((_, i) => (
                      <motion.div
                        key={`waveform-bar-${i}`}
                        className="w-1 rounded-full"
                        animate={{
                          height: [
                            `${15 + Math.random() * 30}%`,
                            `${20 + Math.random() * 60}%`,
                            `${15 + Math.random() * 30}%`,
                          ],
                        }}
                        transition={{
                          duration: 0.4 + Math.random() * 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          background: 'linear-gradient(to top, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.8))',
                          opacity: 0.5 + audioLevel * 0.5,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Hidden Audio Element */}
              <audio ref={audioRef} className="hidden" />
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
