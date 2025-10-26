import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, useSubmit } from "@remix-run/react";
import { Text, Input, Title, Button, Badge, Tooltip } from "@mantine/core";
import { IconSearch, IconHeadphones, IconCompass } from "@tabler/icons-react";
import PassportStampIcon from "~/components/PassportStampIcon";
import { CountryFlag } from "~/components/CountryFlag";
import { BRAND } from "~/constants/brand";
import type { Country, Station } from "~/types/radio";

const HERO_TAGLINES = [
  "Every country, one click away — your global radio passport.",
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
  const submit = useSubmit();
  const [heroHovered, setHeroHovered] = useState(false);
  const [heroTaglineIndex, setHeroTaglineIndex] = useState(0);
  const [heroTickerIndex, setHeroTickerIndex] = useState(0);

  const countryMap = useMemo(
    () => new Map(topCountries.map((country) => [country.name, country] as const)),
    [topCountries]
  );

  const floatingStamps = useMemo<Array<{ id: string; style: CSSProperties; delay: number }>>(
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
      className="hero-surface brand-hero px-6 py-10 md:px-10 md:py-14"
      onPointerEnter={() => setHeroHovered(true)}
      onPointerLeave={() => setHeroHovered(false)}
      style={{
        backgroundImage:
          'linear-gradient(rgba(1, 26, 55, 0.85), rgba(1, 26, 55, 0.75)), url(/RG-HERO.png)',
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
                <span className="logo-subtitle mt-2 inline-block">Global sound atlas</span>
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
              Chart a calm, exploratory ride through world radio with layered textures, analog
              warmth, and a sense of journey tuned into every interaction.
            </motion.p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
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
                {continents}
              </Text>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-5">
          <div className="hero-mini-player">
            <span className="hero-mini-player__badge">Passport preview</span>
            <div className="mt-4 flex items-start gap-4">
              {heroPreviewFavicon ? (
                <img
                  src={heroPreviewFavicon}
                  alt={`${heroPreviewStation.name} artwork`}
                  className="h-[60px] w-[60px] rounded-xl border border-white/[0.22]"
                />
              ) : (
                <div
                  className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-white/[0.18]"
                  style={{ background: "rgba(3, 25, 45, 0.85)" }}
                >
                  <IconCompass size={26} />
                </div>
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
            <div className="flex items-center justify-between">
              <Text size="sm" c="rgba(244,237,224,0.72)" fw={500}>
                Search across the atlas
              </Text>
              {searchQueryRaw && (
                <Badge
                  radius="xl"
                  size="xs"
                  style={{
                    background: "rgba(92,158,173,0.2)",
                    border: "1px solid rgba(92,158,173,0.45)",
                    color: "#fefae0",
                  }}
                >
                  Filtering active
                </Badge>
              )}
            </div>
            <Form method="get" onChange={(event) => submit(event.currentTarget)}>
              <Input
                name="q"
                placeholder="Search countries (instant results)"
                size="md"
                radius="xl"
                defaultValue={searchQueryRaw}
                leftSection={<IconSearch size={18} stroke={1.6} />}
                aria-label="Search countries"
                autoComplete="off"
                styles={{
                  input: {
                    background: "rgba(3, 24, 45, 0.65)",
                    borderColor: searchQueryRaw 
                      ? "rgba(92, 158, 173, 0.65)" 
                      : "rgba(92, 158, 173, 0.35)",
                    color: "#f4ede0",
                    fontWeight: 500,
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    "&:focus": {
                      borderColor: "rgba(92, 158, 173, 0.85)",
                      boxShadow: "0 0 0 3px rgba(92, 158, 173, 0.25)",
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
  );
}
