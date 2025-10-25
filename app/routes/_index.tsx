import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
  Form,
  useSubmit,
} from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Text, Title, Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useSwipeable } from "react-swipeable";
import PassportStampIcon from "~/components/PassportStampIcon";
import { BRAND } from "~/constants/brand";
import { getContinent, dedupeStations } from "~/utils/geography";
import type { Country, Station, ListeningMode, PlayerCard } from "~/types/radio";
import { HeroSection } from "./components/HeroSection";
import { AtlasFilters } from "./components/AtlasFilters";
import { AtlasGrid } from "./components/AtlasGrid";
import { CountryOverview } from "./components/CountryOverview";
import { PlayerCardStack } from "./components/PlayerCardStack";
import { StationGrid } from "./components/StationGrid";
import { QuickRetuneWidget } from "./components/QuickRetuneWidget";
import { PassportPlayerFooter } from "./components/PassportPlayerFooter";
import { LoadingView } from "./components/LoadingView";
import { ListeningModeToggle } from "./components/ListeningModeToggle";
import { rbFetchJson } from "~/utils/radioBrowser";
import { CollapsibleSection } from "./components/CollapsibleSection";
import { vibrate } from "~/utils/haptics";

// Fetches to Radio Browser now go through rbFetchJson with mirror fallback.

const LISTENING_MODE_STORAGE_KEY = "radio-passport-mode";
const FAVORITES_STORAGE_KEY = "radio-passport-favorites";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country");

  try {
    const countries: Country[] = await rbFetchJson(`/json/countries`);

    let stations: Station[] = [];
    if (country) {
      stations = await rbFetchJson(
        `/json/stations/bycountry/${encodeURIComponent(
          country
        )}?limit=100&hidebroken=true&order=clickcount&reverse=true`
      );
    }

    return json({ countries, stations, selectedCountry: country });
  } catch (error) {
    console.error("Error loading radio data:", error);
    return json({ countries: [], stations: [], selectedCountry: country });
  }
}

export default function Index() {
  const {
    countries,
    stations: loaderStations,
    selectedCountry: loaderSelectedCountry,
  } = useLoaderData<typeof loader>();
  const [sp] = useSearchParams();
  const countryParam = sp.get("country");
  const loaderMatchesSearch = (countryParam ?? null) === (loaderSelectedCountry ?? null);
  const selectedCountry: string | null = loaderMatchesSearch
    ? loaderSelectedCountry
    : null;
  const stations: Station[] = loaderMatchesSearch ? loaderStations : [];
  const isCountryRoute = Boolean(countryParam);
  const isCountryViewPending = isCountryRoute && !loaderMatchesSearch;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
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
  const [showQueue, setShowQueue] = useState(false);
  const [favoriteStationIds, setFavoriteStationIds] = useState<Set<string>>(new Set());
  const autoPlayRef = useRef(false);
  const [hasDismissedPlayer, setHasDismissedPlayer] = useState(false);
  const [showNavigationIndicator, setShowNavigationIndicator] = useState(false);
  const hoverAudioContextRef = useRef<AudioContext | null>(null);
  const hoverNoiseRef = useRef<(() => void) | null>(null);

  const topCountries = useMemo(
    () =>
      [...countries].sort((a, b) => b.stationcount - a.stationcount).slice(0, 80),
    [countries]
  );

  const totalStations = countries.reduce((sum, c) => sum + c.stationcount, 0);
  const countryMap = new Map(
    countries.map((country) => [country.name, country] as const)
  );

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

  const isRouteTransitioning = navigation.state !== "idle";

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
        const payload = await rbFetchJson<Station[]>(
          `/json/stations/topvote/120?hidebroken=true&order=clicktrend&reverse=true`
        );
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
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

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
        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * duration),
          context.sampleRate
        );
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

  // If Explore World was requested and explore stations just loaded, auto-play the first
  useEffect(() => {
    if (
      (window as any).__pendingExploreAutoplay &&
      listeningMode === "world" &&
      exploreStations.length > 0
    ) {
      const first = exploreStations[0];
      if (first) {
        setActiveCardIndex(1);
        startStation(first, { autoPlay: true });
      }
      (window as any).__pendingExploreAutoplay = false;
    }
  }, [exploreStations.length, listeningMode]);

  const handleStartListening = useCallback(() => {
    if (typeof document === "undefined") return;

    setActiveContinent(null);
    setSelectedContinent(null);

    const atlasSection = document.getElementById("atlas");
    atlasSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // moved below startStation definition to avoid use-before-declare

  const handleQuickRetune = useCallback(() => {
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
    if (
      selectedCountry ||
      nowPlaying ||
      topCountries.length === 0 ||
      hasDismissedPlayer
    ) {
      return;
    }

    let cancelled = false;

    const loadStation = async () => {
      try {
        const result = await rbFetchJson<Station[]>(
          `/json/stations/byname/ISHQ FM 104.8?limit=1&hidebroken=true`
        );
        const [station] = result;
        if (!station || cancelled) return;

        const stationCountry = countryMap.get(station.country);
        const continent = stationCountry
          ? getContinent(stationCountry.iso_3166_1)
          : "Asia";

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
  }, [selectedCountry, nowPlaying, topCountries, hasDismissedPlayer, countryMap]);

  useEffect(() => {
    if (!selectedCountry) return;
    if (
      nowPlaying &&
      stationRefs.current[nowPlaying.uuid] &&
      autoPlayRef.current
    ) {
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

  // Clear stale world station when navigating to a different country's view
  useEffect(() => {
    if (selectedCountry && nowPlaying && nowPlaying.country !== selectedCountry) {
      setIsPlaying(false);
      setNowPlaying(null);
      setHasDismissedPlayer(true);
    }
  }, [selectedCountry]);

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
      const worldIndex = exploreStations.findIndex(
        (item) => item.uuid === station.uuid
      );

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

      // Update atlas context to match the station's region
      const stationCountry = countryMap.get(station.country);
      if (stationCountry) {
        const continent = getContinent(stationCountry.iso_3166_1);
        setSelectedContinent(continent);
        setActiveContinent(continent);
      }

      autoPlayRef.current = autoPlay;
      setShowQueue(false);
      setHasDismissedPlayer(false);
      setNowPlaying(station);
    },
    [exploreStations, listeningMode, stations, countryMap]
  );

  const handlePreviewCountryPlay = useCallback(async (countryName: string) => {
    try {
      const result = await rbFetchJson<Station[]>(
        `/json/stations/bycountry/${encodeURIComponent(countryName)}?limit=1&hidebroken=true&order=clickcount&reverse=true`
      );
      const [first] = result;
      if (first) {
        vibrate(12);
        startStation(first, { autoPlay: true });
      }
    } catch (error) {
      console.error("Failed to preview country station", error);
    }
  }, [startStation]);

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
      
      // Update atlas context to match the next station's region
      const stationCountry = countryMap.get(nextStation.country);
      if (stationCountry) {
        const continent = getContinent(stationCountry.iso_3166_1);
        setSelectedContinent(continent);
        setActiveContinent(continent);
      }
      
      startStation(nextStation, { autoPlay: true });
      
      // Scroll to station's region in the grid (if in country view and ref exists)
      if (selectedCountry && stationRefs.current[nextStation.uuid]) {
        setTimeout(() => {
          stationRefs.current[nextStation.uuid]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 200);
      }
    }
  }, [currentStationIndex, resolveActiveStations, shuffleMode, startStation, countryMap, selectedCountry]);

  const playPrevious = useCallback(() => {
    const activeStations = resolveActiveStations();
    if (activeStations.length === 0) return;

    const previousIndex = shuffleMode
      ? Math.floor(Math.random() * activeStations.length)
      : (currentStationIndex - 1 + activeStations.length) % activeStations.length;

    const previousStation = activeStations[previousIndex];
    if (previousStation) {
      setCurrentStationIndex(previousIndex);
      
      // Update atlas context to match the previous station's region
      const stationCountry = countryMap.get(previousStation.country);
      if (stationCountry) {
        const continent = getContinent(stationCountry.iso_3166_1);
        setSelectedContinent(continent);
        setActiveContinent(continent);
      }
      
      startStation(previousStation, { autoPlay: true });
      
      // Scroll to station's region in the grid (if in country view and ref exists)
      if (selectedCountry && stationRefs.current[previousStation.uuid]) {
        setTimeout(() => {
          stationRefs.current[previousStation.uuid]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 200);
      }
    }
  }, [currentStationIndex, resolveActiveStations, shuffleMode, startStation, countryMap, selectedCountry]);

  const toggleFavorite = useCallback((station: Station) => {
    vibrate(10);
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
    ? topCountries.filter((country) =>
        country.name.toLowerCase().includes(searchQuery)
      )
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

  const handleCardChange = useCallback(
    (direction: 1 | -1) => {
      if (playerCards.length <= 1) return;
      setCardDirection(direction);
      setActiveCardIndex((prev) => {
        const next = (prev + direction + playerCards.length) % playerCards.length;
        return next;
      });
    },
    [playerCards.length]
  );

  const handleCardJump = useCallback(
    (index: number) => {
      if (
        index === activeCardIndex ||
        index < 0 ||
        index >= playerCards.length
      ) {
        return;
      }

      setCardDirection(index > activeCardIndex ? 1 : -1);
      setActiveCardIndex(index);
    },
    [activeCardIndex, playerCards.length]
  );

  const handleContinentSelect = (continent: string | null) => {
    setSelectedContinent(continent);
    setActiveContinent(continent);
    // Provide immediate visual feedback by scrolling to the atlas section
    if (typeof document !== "undefined") {
      const atlas = document.getElementById("atlas");
      atlas?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleQuickRetuneCountrySelect = (countryName: string) => {
    const countryMeta = countryMap.get(countryName) ?? null;
    const continent = countryMeta
      ? getContinent(countryMeta.iso_3166_1)
      : null;
    if (continent) {
      setSelectedContinent(continent);
      setActiveContinent(continent);
    }
    setListeningMode("local");
    setIsQuickRetuneOpen(false);
    
    // Navigate to country view without resetting scroll
    navigate(`/?country=${encodeURIComponent(countryName)}`, {
      preventScrollReset: true,
    });
    
    // Scroll to station grid after a brief delay to let navigation settle
    setTimeout(() => {
      const stationGrid = document.getElementById("station-grid");
      if (stationGrid) {
        stationGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
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
    
    // Navigate to random country without resetting scroll
    navigate(`/?country=${encodeURIComponent(random.name)}`, {
      preventScrollReset: true,
    });
    
    // Scroll to station grid and auto-play first station
    setTimeout(() => {
      const stationGrid = document.getElementById("station-grid");
      if (stationGrid) {
        stationGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  const handleMissionExploreWorld = useCallback(() => {
    // Switch to world exploration and auto-play the first global station
    setListeningMode("world");
    setActiveContinent(null);
    setSelectedContinent(null);

    // Only scroll the player into view if it's significantly off-screen
    if (typeof document !== "undefined") {
      const playerEl = document.getElementById("player");
      if (playerEl) {
        const rect = playerEl.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const isOffscreen = rect.top > viewportH * 0.9 || rect.bottom < 0;
        if (isOffscreen) {
          playerEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    const startFirstWorld = (stations: Station[]) => {
      const first = stations[0];
      if (first) {
        setActiveCardIndex(1);
        startStation(first, { autoPlay: true });
      }
    };

    if (exploreStations.length > 0) {
      startFirstWorld(exploreStations);
      return;
    }

    // Fetch a fresh global set immediately for snappy UX
    (async () => {
      setIsFetchingExplore(true);
      try {
        const payload = await rbFetchJson<Station[]>(
          `/json/stations/topvote/120?hidebroken=true&order=clicktrend&reverse=true`
        );
        if (Array.isArray(payload)) {
          const world = dedupeStations(payload).slice(0, 120);
          setExploreStations(world);
          startFirstWorld(world);
        }
      } catch (error) {
        console.error("Failed to fetch world stations for mission explore", error);
      } finally {
        setIsFetchingExplore(false);
      }
    })();
  }, [exploreStations, startStation]);

  const handleMissionStayLocal = useCallback(() => {
    setListeningMode("local");
    // Close any open overlays
    setIsQuickRetuneOpen(false);

    // Only scroll the player into view if it's significantly off-screen
    if (typeof document !== "undefined") {
      const playerEl = document.getElementById("player");
      if (playerEl) {
        const rect = playerEl.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const isOffscreen = rect.top > viewportH * 0.9 || rect.bottom < 0;
        if (isOffscreen) {
          playerEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    if (selectedCountry && stations.length > 0) {
      // Jump the player stack to the first station card and scroll to grid
      setActiveCardIndex(1);
      if (typeof document !== "undefined") {
        const firstCard = document.querySelector('.station-card');
        firstCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else {
      // No country selected — focus the atlas instead of opening modal immediately
      if (typeof document !== "undefined") {
        const atlas = document.getElementById("atlas");
        atlas?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedCountry, stations.length]);

  const handleToggleListeningMode = useCallback(() => {
    if (listeningMode === "world") {
      handleMissionStayLocal();
    } else {
      handleMissionExploreWorld();
    }
  }, [listeningMode, handleMissionStayLocal, handleMissionExploreWorld]);

  return (
    <div
      className="app-bg relative min-h-screen text-slate-100"
      style={{
        backgroundImage: "url(/texture.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "400px 400px",
        overflow: isQuickRetuneOpen ? "hidden" : undefined,
      }}
    >
      <header 
        className="sticky top-0 z-40 nav-shell backdrop-blur-lg" 
        aria-hidden={isQuickRetuneOpen} 
        style={isQuickRetuneOpen ? { pointerEvents: "none", userSelect: "none" } : undefined}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 text-sm font-semibold text-slate-100 transition-transform hover:scale-105"
            onClick={handleBackToWorldView}
          >
            <PassportStampIcon size={48} animated={false} id="header" />
            <div className="hidden md:flex md:flex-col">
              <span className="hero-wordmark text-lg leading-tight">
                Radio Passport
              </span>
              <span className="logo-subtitle">Sound atlas</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-1">
              <Link to="/" className="nav-link" prefetch="intent" preventScrollReset>
                Home
              </Link>
              <a href="#explore" className="nav-link" aria-current="page">
                Explore
              </a>
              <span className="nav-link opacity-40 cursor-not-allowed" aria-disabled="true" title="Coming soon">
                Favorites
              </span>
              <span className="nav-link opacity-40 cursor-not-allowed" aria-disabled="true" title="Coming soon">
                About
              </span>
            </div>
            {/* Top-bar instant search (world-wide). Using GET so it updates URL ?q=. */}
            <div className="hidden md:block">
              <Form method="get" onChange={(e) => submit(e.currentTarget)} preventScrollReset>
                <Input
                  name="q"
                  placeholder="Search countries"
                  size="sm"
                  radius="xl"
                  defaultValue={searchQueryRaw}
                  leftSection={<IconSearch size={16} stroke={1.6} />}
                  aria-label="Search countries"
                  autoComplete="off"
                  styles={{
                    input: {
                      background: "rgba(3, 24, 45, 0.6)",
                      borderColor: "rgba(92, 158, 173, 0.3)",
                      color: "#f4ede0",
                      fontWeight: 500,
                      height: 34,
                    },
                  }}
                />
              </Form>
            </div>
            <ListeningModeToggle
              listeningMode={listeningMode}
              onToggle={handleToggleListeningMode}
              size="sm"
            />
          </nav>
          <Badge
            radius="xl"
            size="md"
            className="hidden md:block"
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
        className="relative z-10 mx-auto max-w-6xl px-4 pb-64 pt-12 md:px-8"
        {...swipeHandlers}
        aria-hidden={isQuickRetuneOpen}
        style={isQuickRetuneOpen ? { pointerEvents: "none", userSelect: "none" } : undefined}
      >
        {isCountryViewPending ? (
          <LoadingView />
        ) : !selectedCountry ? (
          <>
            <HeroSection
              topCountries={topCountries}
              totalStations={totalStations}
              continents={continents.length}
              nowPlaying={nowPlaying}
              searchQueryRaw={searchQueryRaw}
              onStartListening={handleStartListening}
              onQuickRetune={handleQuickRetune}
              onMissionExploreWorld={handleMissionExploreWorld}
              onMissionStayLocal={handleMissionStayLocal}
              onHoverSound={triggerHoverStatic}
            />

            <section id="atlas" className="mt-12 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Title
                    order={2}
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 600,
                      color: BRAND.beige,
                    }}
                  >
                    Chart your path by continent
                  </Title>
                  <Text size="sm" c="rgba(244,237,224,0.7)">
                    Filter the atlas to the regions that match your listening mood.
                  </Text>
                </div>
                <Text size="sm" c="rgba(244,237,224,0.55)">
                  Showing {filteredCountries.length.toLocaleString()} of{" "}
                  {topCountries.length.toLocaleString()} spotlight countries
                </Text>
              </div>

              <AtlasFilters
                continents={continents}
                activeContinent={activeContinent}
                onContinentSelect={setActiveContinent}
              />
            </section>

            <section className="mt-10">
              <AtlasGrid displaySections={displaySections} onPreviewCountry={handlePreviewCountryPlay} />
            </section>
          </>
        ) : (
          <>
            <CountryOverview
              selectedCountry={selectedCountry}
              selectedCountryMeta={selectedCountryMeta}
              stationCount={stations.length}
              onBack={handleBackToWorldView}
              showQueue={showQueue}
              onToggleQueue={() => setShowQueue((s) => !s)}
            />

            {/* Show the large player deck only when nothing is currently playing.
                On country pages this avoids duplicating the sticky footer and
                reduces vertical space usage. Users can still play directly
                from the station grid and control playback via the footer. */}
            {(!nowPlaying || showQueue) && (
              <CollapsibleSection title="Player queue" defaultOpen>
                <PlayerCardStack
                  playerCards={playerCards}
                  activeCardIndex={activeCardIndex}
                  cardDirection={cardDirection}
                  nowPlaying={nowPlaying}
                  isPlaying={isPlaying}
                  listeningMode={listeningMode}
                  favoriteStationIds={favoriteStationIds}
                  countryMap={countryMap}
                  hasStationsToCycle={hasStationsToCycle}
                  isFetchingExplore={isFetchingExplore}
                  localStationCount={stations.length}
                  globalStationCount={
                    exploreStations.length || Math.max(deckStations.length - 1, 0)
                  }
                  selectedCountry={selectedCountry}
                  onCardChange={handleCardChange}
                  onCardJump={handleCardJump}
                  onToggleFavorite={toggleFavorite}
                  onStartStation={startStation}
                  onPlayPause={playPause}
                  onPlayNext={playNext}
                  onSetListeningMode={setListeningMode}
                  onMissionExploreWorld={handleMissionExploreWorld}
                  onMissionStayLocal={handleMissionStayLocal}
                />
              </CollapsibleSection>
            )}

            <CollapsibleSection title={`Stations in ${selectedCountry ?? "this country"}`} defaultOpen id="stations">
              <section className="mt-4">
                <StationGrid
                  stations={stations}
                  nowPlaying={nowPlaying}
                  stationRefs={stationRefs}
                  onPlayStation={(station) => {
                    startStation(station, { autoPlay: true });
                  }}
                  isFetchingExplore={isFetchingExplore}
                  favoriteStationIds={favoriteStationIds}
                  onToggleFavorite={toggleFavorite}
                />
              </section>
            </CollapsibleSection>
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

      <div aria-hidden={isQuickRetuneOpen} style={isQuickRetuneOpen ? { pointerEvents: "none", userSelect: "none" } : undefined}>
        <PassportPlayerFooter
          nowPlaying={nowPlaying}
          isPlaying={isPlaying}
          audioLevel={audioLevel}
          shuffleMode={shuffleMode}
          listeningMode={listeningMode}
          canSeekStations={canSeekStations}
          hasStationsToCycle={hasStationsToCycle}
          countryMap={countryMap}
          onPlayPause={playPause}
          onPlayNext={playNext}
          onPlayPrevious={playPrevious}
          onShuffleToggle={() => setShuffleMode((prev) => !prev)}
          onQuickRetune={() => setIsQuickRetuneOpen(true)}
          onBackToWorld={handleBackToWorldView}
          onDismiss={() => {
            setNowPlaying(null);
            setIsPlaying(false);
            setHasDismissedPlayer(true);
          }}
        />
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
