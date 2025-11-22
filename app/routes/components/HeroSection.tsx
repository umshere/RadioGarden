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
  const [isMounted, setIsMounted] = useState(false);

  // Floating music notes animation data - deterministic seed based on index
  const floatingNotes = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => {
        // Use index-based deterministic values to avoid hydration mismatch
        const seed = i / 18;
        const isEven = i % 2 === 0;
        return {
          id: i,
          delay: seed * 6,
          duration: 12 + seed * 8,
          startX: (i * 5.5) % 100,
          endX: ((i * 5.5) + (isEven ? 60 : -60)) % 100,
          startY: 115,
          midY: 40 + (seed * 30),
          endY: -25 - (seed * 15),
          rotation: i * 25,
          scale1: 0.6 + (seed * 0.5),
          scale2: 1.1 + (seed * 0.6),
          opacity: 0.5 + (seed * 0.35),
          note: ['🎵', '🎶', '🎼', '🎹', '🎺', '🎸', '🎻', '🎤', '🎧', '🎙️'][i % 10],
          blur: seed * 0.3,
          color: isEven ? 'rgba(99, 102, 241, 0.3)' : 'rgba(168, 85, 247, 0.3)', // Indigo and purple
        };
      }),
    []
  );

  // Only enable animations after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e8e8e8',
      }}
    >
      {/* Animated Gradient Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: ['-20%', '120%'],
            y: ['-10%', '110%'],
            scale: heroHovered ? [1, 1.5, 1] : [1, 1.3, 1],
            opacity: heroHovered ? [0.4, 0.6, 0.4] : [0.4, 0.4, 0.4],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{
            x: ['120%', '-20%'],
            y: ['110%', '-10%'],
            scale: heroHovered ? [1.2, 0.8, 1.2] : [1.2, 1, 1.2],
            opacity: heroHovered ? [0.4, 0.7, 0.4] : [0.4, 0.4, 0.4],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: ['50%', '50%'],
            y: ['-20%', '120%'],
            scale: heroHovered ? [1, 1.8, 1] : [1, 1.5, 1],
            opacity: heroHovered ? [0.4, 0.6, 0.4] : [0.4, 0.4, 0.4],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating Music Notes Animation - Enhanced & Visible */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isMounted && floatingNotes.map((note) => (
          <motion.div
            key={note.id}
            className="absolute text-3xl md:text-4xl"
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
              scale: [note.scale1, note.scale2, note.scale1 * 0.6],
              opacity: [0, note.opacity, note.opacity * 0.7, 0],
            }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              filter: `blur(${note.blur}px) drop-shadow(0 2px 8px ${note.color})`,
              color: note.color,
            }}
          >
            {note.note}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="max-w-2xl space-y-5 sm:space-y-6">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            role="status"
            aria-live="polite"
          >
            <span className="text-indigo-500">
              <IconCompass size={14} />
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
              <PassportStampIcon size={80} id="preview" />
              <div className="flex flex-col">
                <motion.span
                  className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
                >
                  Radio Passport
                </motion.span>
                <span className="mt-0.5 text-sm font-medium text-slate-500">Global sound atlas</span>
              </div>
            </div>
            <AnimatePresence initial={false} mode="wait">
              <motion.h1
                key={HERO_TAGLINES[heroTaglineIndex]}
                className="text-lg font-medium text-slate-600 sm:text-xl md:text-2xl md:leading-tight"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
              >
                {HERO_TAGLINES[heroTaglineIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Tooltip label="Begin listening with curated picks" position="top" withArrow>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 w-full justify-center sm:w-auto"
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
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow-md active:scale-95 w-full justify-center sm:w-auto"
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              className="rounded-xl border p-3 bg-white/60 backdrop-blur-md border-slate-200 shadow-sm"
            >
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                Countries
              </Text>
              <Text size="lg" fw={800} c="slate.9">
                {topCountries.length.toLocaleString()}
              </Text>
            </div>
            <div
              className="rounded-xl border p-3 bg-white/60 backdrop-blur-md border-slate-200 shadow-sm"
            >
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                Stations
              </Text>
              <Text size="lg" fw={800} c="slate.9">
                {(totalStations / 1000).toFixed(0)}k
              </Text>
            </div>
            <div
              className="rounded-xl border p-3 bg-white/60 backdrop-blur-md border-slate-200 shadow-sm"
            >
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                Continents
              </Text>
              <Text size="lg" fw={800} c="slate.9">
                {continents}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
