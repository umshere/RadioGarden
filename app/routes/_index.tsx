import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useNavigation, useSearchParams, Form, useSubmit } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Text, Title, Input, Tooltip, ActionIcon } from "@mantine/core";
import { IconSearch, IconMinimize } from "@tabler/icons-react";
import { useSwipeable } from "react-swipeable";

import PassportStampIcon from "~/components/PassportStampIcon";
import { ClientOnly } from "~/components/ClientOnly";
import { BRAND } from "~/constants/brand";
import { getContinent } from "~/utils/geography";
import { rbFetchJson } from "~/utils/radioBrowser";
import { normalizeStations } from "~/utils/stations";
import { rankStations, pickTopStation } from "~/utils/stationMeta";
import { vibrate } from "~/utils/haptics";
import type { AiDescriptorState, VoiceCommandPayload } from "~/types/ai";
import type { Country, Station } from "~/types/radio";
import { callAiOrchestrator } from "~/utils/aiOrchestrator";

// Components
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
import { CollapsibleSection } from "./components/CollapsibleSection";
import { MinimalPlayer } from "./components/MinimalPlayer";

// Custom Hooks
import { useRadioPlayer } from "~/hooks/useRadioPlayer";
import { useListeningMode } from "~/hooks/useListeningMode";
import { useFavorites } from "~/hooks/useFavorites";
import { useRecentStations } from "~/hooks/useRecentStations";
import { useHoverAudio } from "~/hooks/useHoverAudio";
import { useAtlasState } from "~/hooks/useAtlasState";
import { usePlayerCards } from "~/hooks/usePlayerCards";
import { useStationNavigation } from "~/hooks/useStationNavigation";
import { useAtlasNavigation } from "~/hooks/useAtlasNavigation";
import { useDerivedData } from "~/hooks/useDerivedData";
import { useEventHandlers } from "~/hooks/useEventHandlers";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country");

  try {
    const countries: Country[] = await rbFetchJson(`/json/countries`);
    let stations: Station[] = [];

    if (country) {
      const rawStations = await rbFetchJson<unknown>(
        `/json/stations/bycountry/${encodeURIComponent(country)}?limit=100&hidebroken=true&order=clickcount&reverse=true`
      );
      const normalized = normalizeStations(Array.isArray(rawStations) ? rawStations : []);
      stations = rankStations(normalized);
    }

    return json({ countries, stations, selectedCountry: country });
  } catch (error) {
    console.error("Error loading radio data:", error);
    return json({ countries: [], stations: [], selectedCountry: country });
  }
}

export default function Index() {
  // Remix hooks
  const { countries, stations: loaderStations, selectedCountry: loaderSelectedCountry } = useLoaderData<typeof loader>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();

  // Route params
  const countryParam = sp.get("country");
  const loaderMatchesSearch = (countryParam ?? null) === (loaderSelectedCountry ?? null);
  const selectedCountry = loaderMatchesSearch ? loaderSelectedCountry : null;
  const stations = loaderMatchesSearch ? loaderStations : [];
  const isCountryViewPending = Boolean(countryParam) && !loaderMatchesSearch;
  const searchQueryRaw = sp.get("q") ?? "";
  const searchQuery = searchQueryRaw.trim().toLowerCase();

  // Domain hooks - all state management extracted
  const player = useRadioPlayer();
  const mode = useListeningMode();
  const { favoriteStationIds, toggleFavorite } = useFavorites();
  const { recentStations, addToRecent } = useRecentStations();
  const { triggerHoverStatic } = useHoverAudio();
  const atlas = useAtlasState(countries, player.nowPlaying, selectedCountry);
  const cards = usePlayerCards(recentStations, stations, mode.exploreStations, mode.listeningMode);
  
  // UI state (minimal - most extracted to hooks)
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardDirection, setCardDirection] = useState<1 | -1>(1);
  const [isQuickRetuneOpen, setIsQuickRetuneOpen] = useState(false);
  const [hasDismissedPlayer, setHasDismissedPlayer] = useState(false);
  const [showNavigationIndicator, setShowNavigationIndicator] = useState(false);
  const [isMinimalPlayer, setIsMinimalPlayer] = useState(false);
  const stationRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [descriptorState, setDescriptorState] = useState<AiDescriptorState>({
    status: "idle",
    mood: null,
    transcript: null,
    descriptor: null,
    error: null,
    updatedAt: null,
  });
  const aiDescriptorAbortRef = useRef<AbortController | null>(null);

  // Derived data
  const topCountries = useMemo(
    () => [...countries].sort((a, b) => b.stationcount - a.stationcount).slice(0, 80),
    [countries]
  );
  
  const derived = useDerivedData(countries, topCountries, searchQuery, atlas.activeContinent);
  const isRouteTransitioning = navigation.state !== "idle";
  const selectedCountryMeta = selectedCountry ? atlas.countryMap.get(selectedCountry) || null : null;

  // Navigation helpers
  const atlasNavigation = useAtlasNavigation(
    atlas.countryMap,
    atlas.setSelectedContinent,
    atlas.setActiveContinent
  );

  const { playNext, playPrevious } = useStationNavigation(
    player.currentStationIndex,
    player.setCurrentStationIndex,
    player.shuffleMode,
    cards.activeStationsSnapshot,
    player.startStation,
    atlas.countryMap,
    atlas.setSelectedContinent,
    atlas.setActiveContinent,
    selectedCountry
  );

  // Core event handler
  const handleStartStation = useCallback((station: Station, options?: { autoPlay?: boolean; preserveQueue?: boolean }) => {
    atlasNavigation.selectContinentForCountry(station.country);
    setHasDismissedPlayer(false);
    player.startStation(station, { autoPlay: options?.autoPlay ?? true });
  }, [atlasNavigation, player, setHasDismissedPlayer]);

  // All other event handlers
  const handlers = useEventHandlers({
    player,
    mode,
    atlas,
    navigate,
    selectedCountry,
    stations,
    setHasDismissedPlayer,
    setIsQuickRetuneOpen,
    setActiveCardIndex,
    handleStartStation,
    topCountries,
    countries,
    atlasNavigation,
  });
  const { handleWorldMoodRefresh } = handlers;

  // Card navigation handlers
  const handleCardChange = useCallback((direction: 1 | -1) => {
    if (cards.playerCards.length <= 1) return;
    setCardDirection(direction);
    setActiveCardIndex((prev) => (prev + direction + cards.playerCards.length) % cards.playerCards.length);
  }, [cards.playerCards.length]);

  const handleCardJump = useCallback((index: number) => {
    if (index === activeCardIndex || index < 0 || index >= cards.playerCards.length) return;
    setCardDirection(index > activeCardIndex ? 1 : -1);
    setActiveCardIndex(index);
  }, [activeCardIndex, cards.playerCards.length]);

  const handleVoiceDescriptorRequest = useCallback(
    async ({ mood, transcript }: VoiceCommandPayload) => {
      aiDescriptorAbortRef.current?.abort();

      const abortController = new AbortController();
      aiDescriptorAbortRef.current = abortController;

      setDescriptorState((prev) => ({
        status: "loading",
        mood,
        transcript,
        descriptor: prev.descriptor,
        error: null,
        updatedAt: prev.updatedAt,
      }));

      mode.setListeningMode("world");

      try {
        const response = await callAiOrchestrator(
          { mood, transcript },
          { signal: abortController.signal }
        );

        if (aiDescriptorAbortRef.current !== abortController) {
          return;
        }

        setDescriptorState({
          status: "success",
          mood: response.mood ?? mood,
          transcript,
          descriptor: response.descriptor,
          error: null,
          updatedAt: Date.now(),
        });

        await handleWorldMoodRefresh({ mood: response.mood ?? mood ?? undefined });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          if (aiDescriptorAbortRef.current === abortController) {
            aiDescriptorAbortRef.current = null;
            setDescriptorState((prev) => ({
              ...prev,
              status: prev.descriptor ? "success" : "idle",
              error: null,
            }));
          }
          return;
        }

        if (aiDescriptorAbortRef.current !== abortController) {
          return;
        }

        setDescriptorState((prev) => ({
          status: "error",
          mood,
          transcript,
          descriptor: prev.descriptor,
          error:
            error instanceof Error
              ? error.message
              : "Failed to contact AI orchestrator",
          updatedAt: Date.now(),
        }));
      } finally {
        if (aiDescriptorAbortRef.current === abortController) {
          aiDescriptorAbortRef.current = null;
        }
      }
    },
    [mode, handleWorldMoodRefresh]
  );

  const handleToggleFavorite = useCallback((station: Station) => {
    vibrate(10);
    toggleFavorite(station.uuid);
  }, [toggleFavorite]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: playNext,
    onSwipedRight: () => player.nowPlaying && (player.stop(), setHasDismissedPlayer(true)),
    trackMouse: true,
  });

  // Side effects
  useEffect(() => {
    if (player.nowPlaying) addToRecent(player.nowPlaying);
  }, [player.nowPlaying, addToRecent]);

  useEffect(() => {
    if (selectedCountry && player.nowPlaying && player.nowPlaying.country !== selectedCountry) {
      player.stop();
      setHasDismissedPlayer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, player.nowPlaying]);

  useEffect(() => {
    setShowNavigationIndicator(isRouteTransitioning);
  }, [isRouteTransitioning]);

  useEffect(() => {
    if (
      mode.listeningMode === "world" &&
      mode.exploreStations.length === 0 &&
      !mode.isFetchingExplore
    ) {
      handleWorldMoodRefresh();
    }
  }, [
    mode.listeningMode,
    mode.exploreStations.length,
    mode.isFetchingExplore,
    handleWorldMoodRefresh,
  ]);

  useEffect(() => {
    if (selectedCountry || player.nowPlaying || topCountries.length === 0 || hasDismissedPlayer) return;

    let cancelled = false;
    const loadStation = async () => {
      try {
        const raw = await rbFetchJson<unknown>(
          `/json/stations/byname/ISHQ FM 104.8?limit=1&hidebroken=true`
        );
        const station = pickTopStation(normalizeStations(Array.isArray(raw) ? raw : []));
        if (!station || cancelled) return;

        const continent = atlasNavigation.selectContinentForCountry(station.country) ?? "Asia";
        atlas.setSelectedContinent((prev) => prev ?? continent);
        setHasDismissedPlayer(false);
        player.startStation(station, { autoPlay: false, preserveQueue: true });
      } catch (error) {
        console.error("Failed to seed station", error);
      }
    };

    loadStation();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, player.nowPlaying, topCountries.length, hasDismissedPlayer]);

  useEffect(() => {
    if (!player.nowPlaying) return;
    const stationIndex = cards.playerCards.findIndex(
      (card) => card.type === "station" && card.station.uuid === player.nowPlaying!.uuid
    );
    if (stationIndex >= 0 && stationIndex !== activeCardIndex) {
      setCardDirection(stationIndex > activeCardIndex ? 1 : -1);
      setActiveCardIndex(stationIndex);
    }
  }, [activeCardIndex, player.nowPlaying, cards.playerCards]);

  useEffect(() => {
    if (cards.playerCards.length === 0) setActiveCardIndex(0);
    else if (activeCardIndex > cards.playerCards.length - 1) setActiveCardIndex(cards.playerCards.length - 1);
  }, [activeCardIndex, cards.playerCards.length]);

  useEffect(() => {
    return () => {
      aiDescriptorAbortRef.current?.abort();
    };
  }, []);

  // Render
  const ariaHidden = isQuickRetuneOpen ? { "aria-hidden": true, style: { pointerEvents: "none" as const, userSelect: "none" as const } } : {};

  return (
    <div className="app-bg relative min-h-screen text-slate-100" style={{
      backgroundImage: "url(/texture.png)",
      backgroundRepeat: "repeat",
      backgroundSize: "400px 400px",
      backgroundBlendMode: "overlay",
      overflow: isQuickRetuneOpen ? "hidden" : undefined,
    }}>
      <header className="fixed top-0 left-0 right-0 z-50 nav-shell backdrop-blur-lg" {...ariaHidden}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/world" className="flex items-center gap-3 text-sm font-semibold text-slate-100 transition-transform hover:scale-105" onClick={handlers.handleBackToWorldView}>
            <PassportStampIcon size={48} animated={false} id="header" />
            <div className="hidden md:flex md:flex-col">
              <span className="hero-wordmark text-lg leading-tight">Radio Passport</span>
              <span className="logo-subtitle">Sound atlas</span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-1">
              <Link to="/" className="nav-link" prefetch="intent" preventScrollReset>Local</Link>
              <Link to="/world" className="nav-link" prefetch="intent" preventScrollReset>World</Link>
              <a href="#explore" className="nav-link" aria-current="page">Explore</a>
              <span className="nav-link opacity-40 cursor-not-allowed" aria-disabled="true" title="Coming soon">Favorites</span>
              <span className="nav-link opacity-40 cursor-not-allowed" aria-disabled="true" title="Coming soon">About</span>
            </div>
            
            <div className="hidden md:block">
              <Form method="get" onChange={(e) => submit(e.currentTarget)} preventScrollReset>
                <Input name="q" placeholder="Search countries" size="sm" radius="xl" defaultValue={searchQueryRaw}
                  leftSection={<IconSearch size={16} stroke={1.6} />} aria-label="Search countries" autoComplete="off"
                  styles={{ input: { background: "rgba(3, 24, 45, 0.6)", borderColor: "rgba(92, 158, 173, 0.3)", color: "#f4ede0", fontWeight: 500, height: 34 } }}
                />
              </Form>
            </div>
            
                        <ListeningModeToggle
              listeningMode={mode.listeningMode}
              onToggle={handlers.handleToggleListeningMode}
              size="sm"
            />
            <ClientOnly>
              {player.nowPlaying && (
                <Tooltip label={isMinimalPlayer ? "Expand player" : "Minimize player"} position="bottom" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setIsMinimalPlayer(!isMinimalPlayer)}
                    style={{ color: "#94a3b8" }}
                    aria-label={isMinimalPlayer ? "Expand player" : "Minimize player"}
                  >
                    <IconMinimize size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </ClientOnly>
          </nav>
          
          <Badge radius="xl" size="md" className="hidden md:block" style={{
            background: "rgba(209, 73, 91, 0.18)", color: BRAND.beige, border: "1px solid rgba(209, 73, 91, 0.4)",
            fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase"
          }}>Live beta</Badge>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-64 pt-24 md:px-8" {...swipeHandlers} {...ariaHidden}>
        {isCountryViewPending ? <LoadingView /> : !selectedCountry ? (
          <>
            <HeroSection topCountries={topCountries} totalStations={derived.totalStations} continents={derived.continents.length}
              nowPlaying={player.nowPlaying} searchQueryRaw={searchQueryRaw} onStartListening={handlers.handleStartListening}
              onQuickRetune={handlers.handleQuickRetune} onMissionExploreWorld={handlers.handleMissionExploreWorld}
              onMissionStayLocal={handlers.handleMissionStayLocal} onHoverSound={triggerHoverStatic}
            />

            <section id="atlas" className="mt-6">
              <div className="sticky top-[73px] z-40 pb-3 pt-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Title order={2} style={{ fontSize: "1.35rem", fontWeight: 600, color: BRAND.beige, marginBottom: "0.15rem" }}>
                      Chart your path by continent
                    </Title>
                    <Text size="xs" c="rgba(244,237,224,0.6)">
                      Filter the atlas to the regions that match your listening mood.
                    </Text>
                  </div>
                  <Text size="xs" c="rgba(244,237,224,0.45)" className="whitespace-nowrap">
                    Showing {derived.filteredCountries.length.toLocaleString()} of {topCountries.length.toLocaleString()} spotlight countries
                  </Text>
                </div>

                <div className="mt-3">
                  <AtlasFilters continents={derived.continents} activeContinent={atlas.activeContinent} onContinentSelect={atlas.setActiveContinent} />
                </div>
              </div>

              <div className="mt-4">
                <AtlasGrid displaySections={derived.displaySections} onPreviewCountry={handlers.handlePreviewCountryPlay} />
              </div>
            </section>
          </>
        ) : (
          <>
            <CountryOverview selectedCountry={selectedCountry} selectedCountryMeta={selectedCountryMeta}
              stationCount={stations.length} onBack={handlers.handleBackToWorldView}
            />

            <PlayerCardStack
              playerCards={cards.playerCards}
              activeCardIndex={activeCardIndex}
              cardDirection={cardDirection}
              nowPlaying={player.nowPlaying}
              isPlaying={player.isPlaying}
              listeningMode={mode.listeningMode}
              stackStations={cards.deckStations}
              recentStations={recentStations}
              favoriteStationIds={favoriteStationIds}
              countryMap={atlas.countryMap}
              hasStationsToCycle={cards.hasStationsToCycle}
              isFetchingExplore={mode.isFetchingExplore}
              localStationCount={stations.length}
              globalStationCount={mode.exploreStations.length || cards.deckStations.length}
              selectedCountry={selectedCountry}
              worldDescriptor={descriptorState}
              onCardChange={handleCardChange}
              onCardJump={handleCardJump}
              onToggleFavorite={handleToggleFavorite}
              onStartStation={handleStartStation}
              onPlayPause={player.playPause}
              onPlayNext={playNext}
              onSetListeningMode={mode.setListeningMode}
              onMissionExploreWorld={handlers.handleMissionExploreWorld}
              onMissionStayLocal={handlers.handleMissionStayLocal}
            />

            <CollapsibleSection title={`Stations in ${selectedCountry}`} defaultOpen id="stations">
              <section className="mt-4">
                <StationGrid stations={stations} nowPlaying={player.nowPlaying} stationRefs={stationRefs}
                  onPlayStation={handleStartStation} isFetchingExplore={mode.isFetchingExplore}
                  favoriteStationIds={favoriteStationIds} onToggleFavorite={handleToggleFavorite}
                />
              </section>
            </CollapsibleSection>
          </>
        )}
      </main>

      <QuickRetuneWidget isOpen={isQuickRetuneOpen} onOpenChange={setIsQuickRetuneOpen} continents={derived.continents}
        activeContinent={atlas.activeContinent} onContinentSelect={handlers.handleContinentSelect}
        countriesByContinent={derived.continentData} topCountries={topCountries}
        onCountrySelect={handlers.handleQuickRetuneCountrySelect} onSurprise={handlers.handleSurpriseRetune}
      />

      <AnimatePresence>
        {showNavigationIndicator && (
          <motion.div key="navigation-indicator" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-none fixed top-6 right-6 z-40">
            <motion.div layout className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(12,20,36,0.82)] px-5 py-3 shadow-xl backdrop-blur"
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.2 }}>
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-100/70">Tuning</span>
              <div className="flex h-6 items-end gap-[3px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.span key={index} className="w-[6px] rounded-full bg-[rgba(199,158,73,0.7)]"
                    animate={{ height: [8, 22, 10] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror", delay: index * 0.08, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div {...ariaHidden}>
        {isMinimalPlayer ? (
          <MinimalPlayer
            nowPlaying={player.nowPlaying}
            isPlaying={player.isPlaying}
            canSeekStations={cards.canSeekStations}
            countryMap={atlas.countryMap}
            onPlayPause={player.playPause}
            onPlayNext={playNext}
            onPlayPrevious={playPrevious}
            onMaximize={() => setIsMinimalPlayer(false)}
            onDismiss={() => {
              player.stop();
              setHasDismissedPlayer(true);
            }}
          />
        ) : (
          <PassportPlayerFooter
            nowPlaying={player.nowPlaying}
            isPlaying={player.isPlaying}
            audioLevel={player.audioLevel}
            shuffleMode={player.shuffleMode}
            listeningMode={mode.listeningMode}
            canSeekStations={cards.canSeekStations}
            hasStationsToCycle={cards.hasStationsToCycle}
            countryMap={atlas.countryMap}
            onPlayPause={player.playPause}
            onPlayNext={playNext}
            onPlayPrevious={playPrevious}
            onShuffleToggle={() => player.setShuffleMode((prev: boolean) => !prev)}
            onQuickRetune={() => setIsQuickRetuneOpen(true)}
            onBackToWorld={handlers.handleBackToWorldView}
            onMinimize={() => setIsMinimalPlayer(true)}
            onDismiss={() => {
              player.stop();
              setHasDismissedPlayer(true);
            }}
            descriptorState={descriptorState}
            onVoiceDescriptor={handleVoiceDescriptorRequest}
          />
        )}
      </div>

    </div>
  );
}
