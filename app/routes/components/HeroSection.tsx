import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Text, Tooltip } from "@mantine/core";
import { IconSearch, IconHeadphones, IconCompass, IconMusic } from "@tabler/icons-react";
import PassportStampIcon from "~/components/PassportStampIcon";
import { CountryFlag } from "~/components/CountryFlag";
import { BRAND } from "~/constants/brand";
import type { Country, Station } from "~/types/radio";

const HERO_TAGLINES = [
  "Every country, one click away your global radio passport.",
  "Stamp your way through the world's soundscapes.",
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

type HeroSectionProps = {
  topCountries: Country[];
  totalStations: number;
  continents: number;
  nowPlaying: Station | null;
  searchQueryRaw: string;
  onStartListening: () => void;
  onQuickRetune: () => void;
  onMissionExploreWorld?: () => void;
  onMissionStayLocal?: () => void;
  onHoverSound?: () => void;
};

export function HeroSection({
  topCountries,
  totalStations,
  continents,
  nowPlaying,
  searchQueryRaw,
  onStartListening,
  onQuickRetune,
  onMissionExploreWorld,
  onMissionStayLocal,
  onHoverSound,
}: HeroSectionProps) {
  const [heroHovered, setHeroHovered] = useState(false);
  const [heroTaglineIndex, setHeroTaglineIndex] = useState(0);
  const [heroTickerIndex, setHeroTickerIndex] = useState(0);

  // Floating music notes animation data - random but stable
  const floatingNotes = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 8,
        duration: 15 + Math.random() * 10,
        startX: Math.random() * 100,
        endX: Math.random() * 100,
        startY: 110,
        midY: 50 + Math.random() * 20,
        endY: -20 - Math.random() * 10,
        rotation: Math.random() * 360,
        scale1: 0.4 + Math.random() * 0.3,
        scale2: 0.8 + Math.random() * 0.4,
        opacity: 0.2 + Math.random() * 0.15,
        note: ['🎵', '🎶', '🎼', '🎹', '🎺', '🎸', '🎻', '🎤'][Math.floor(Math.random() * 8)],
        blur: Math.random() * 1.2,
      })),
    []
  );

  const countryMap = useMemo(
    () => new Map(topCountries.map((country) => [country.name, country] as const)),
    [topCountries]
  );

  const heroTickerItems = useMemo(() => {
    const headlineCountry = topCountries[0]?.name ?? "Global";
    const base = [
      `${totalStations.toLocaleString()} verified stations ready to tune`,
      `${continents} continents on the dial`,
      `Spotlight • ${headlineCountry}`,
    ];

    if (nowPlaying) {
      base.unshift(`Now playing • ${nowPlaying.name} — ${nowPlaying.country}`);
    }

    return base;
  }, [continents, nowPlaying, topCountries, totalStations]);

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
    const fallback = HERO_PREVIEW_FALLBACKS[fallbackIndex] ?? HERO_PREVIEW_FALLBACKS[0];

    return fallback as Pick<Station, "name" | "country" | "language" | "tags">;
  }, [heroTickerIndex, nowPlaying]);

  const heroPreviewCountryMeta = heroPreviewStation
    ? countryMap.get(heroPreviewStation.country) ?? null
    : null;

  const heroPreviewFavicon =
    typeof heroPreviewStation === "object" && "favicon" in heroPreviewStation
      ? (heroPreviewStation.favicon as string | undefined)
      : undefined;

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

  return (
    <motion.section
      id="explore"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="hero-surface brand-hero px-6 py-8 md:px-10 md:py-10"
      onPointerEnter={() => setHeroHovered(true)}
      onPointerLeave={() => setHeroHovered(false)}
      style={{
        backgroundImage:
          'linear-gradient(rgba(1, 26, 55, 0.85), rgba(1, 26, 55, 0.75)), url(/RG-HERO.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'normal',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Music Notes Animation - Random & Stable */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingNotes.map((note) => (
          <motion.div
            key={note.id}
            className="absolute text-2xl"
            initial={{ 
              x: `${note.startX}vw`, 
              y: `${note.startY}%`,
              rotate: note.rotation,
              scale: note.scale1,
              opacity: 0,
            }}
            animate={{
              y: [`${note.startY}%`, `${note.midY}%`, `${note.endY}%`],
              x: [`${note.startX}vw`, `${(note.startX + note.endX) / 2}vw`, `${note.endX}vw`],
              rotate: [note.rotation, note.rotation + 180, note.rotation + 360],
              scale: [note.scale1, note.scale2, note.scale1 * 0.8],
              opacity: [0, note.opacity, note.opacity * 0.6, 0],
            }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              filter: `blur(${note.blur}px)`,
              color: 'rgba(199,158,73,0.45)',
            }}
          >
            {note.note}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-6">
          <motion.span
            className="brand-hero__ticker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            role="status"
            aria-live="polite"
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <PassportStampIcon size={64} id="preview" />
              <div className="flex flex-col">
                <motion.span
                  className="hero-wordmark text-3xl md:text-4xl leading-none"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
                >
                  Radio Passport
                </motion.span>
                <span className="logo-subtitle mt-1 block">Global sound atlas</span>
              </div>
            </div>
            <AnimatePresence initial={false} mode="wait">
              <motion.h1
                key={HERO_TAGLINES[heroTaglineIndex]}
                className="text-xl font-semibold text-slate-100 md:text-2xl md:leading-tight"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
              >
                {HERO_TAGLINES[heroTaglineIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip label="Begin listening with curated picks" position="top" withArrow>
              <button
                type="button"
                className="cta-primary"
                onClick={onStartListening}
                onMouseEnter={onHoverSound}
                onFocus={onHoverSound}
                aria-label="Start your listening journey"
                title="Start your listening journey"
              >
                <IconHeadphones size={18} />
                Start Your Journey
              </button>
            </Tooltip>
            <Tooltip label="Quickly jump to a region or station" position="top" withArrow>
              <button
                type="button"
                className="cta-secondary"
                onClick={onQuickRetune}
                aria-label="Browse world atlas"
                title="Browse world atlas"
              >
                <IconCompass size={18} />
                Quick Retune
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-xl border p-3"
              style={{
                background: "rgba(2, 27, 47, 0.65)",
                borderColor: "rgba(92, 158, 173, 0.28)",
                backdropFilter: "blur(14px)",
              }}
            >
              <Text size="xs" c="rgba(244,237,224,0.7)" fw={600}>
                Countries
              </Text>
              <Text size="lg" fw={700} c={BRAND.beige}>
                {topCountries.length.toLocaleString()}
              </Text>
            </div>
            <div
              className="rounded-xl border p-3"
              style={{
                background: "rgba(2, 27, 47, 0.65)",
                borderColor: "rgba(92, 158, 173, 0.28)",
                backdropFilter: "blur(14px)",
              }}
            >
              <Text size="xs" c="rgba(244,237,224,0.7)" fw={600}>
                Stations
              </Text>
              <Text size="lg" fw={700} c={BRAND.beige}>
                {(totalStations / 1000).toFixed(0)}k
              </Text>
            </div>
            <div
              className="rounded-xl border p-3"
              style={{
                background: "rgba(2, 27, 47, 0.65)",
                borderColor: "rgba(92, 158, 173, 0.28)",
                backdropFilter: "blur(14px)",
              }}
            >
              <Text size="xs" c="rgba(244,237,224,0.7)" fw={600}>
                Continents
              </Text>
              <Text size="lg" fw={700} c={BRAND.beige}>
                {continents}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
