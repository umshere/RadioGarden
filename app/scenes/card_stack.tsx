import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, WheelEvent as ReactWheelEvent } from "react";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  IconAlertTriangle,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconShieldCheck,
} from "@tabler/icons-react";

import type { SceneComponent } from "./types";
import type { Station } from "~/types/radio";
import { deriveStationHealth, getHealthBadgeStyle } from "~/utils/stationMeta";
import { usePlayerStore } from "~/state/playerStore";

const MOOD_BACKGROUNDS: Record<string, string> = {
  night: "linear-gradient(135deg, #111827, #1f2937)",
  sunrise: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  lush: "linear-gradient(135deg, #56ab2f, #a8e063)",
  ocean: "linear-gradient(135deg, #36d1dc, #5b86e5)",
};

const TAG_LIMIT = 3;
const CARD_STACK_LIMIT = 8;
const CARD_BASE_WIDTH = 440;
const CARD_BASE_HEIGHT = 320;
const CARD_STAGE_HEIGHT = CARD_BASE_HEIGHT + 220;
const CARD_WIDTH_STYLE = `min(${CARD_BASE_WIDTH}px, 82vw)`;
const CARD_HEIGHT_STYLE = `clamp(260px, 48vh, ${CARD_BASE_HEIGHT}px)`;
const SCENE_MIN_HEIGHT = "min(48rem, 88vh)";
const DEFAULT_REASON = "The Passport sequenced stations that best fit this mood.";
const BASE_BACKGROUND = "#050b18";

const FAN_CONFIG = {
  spread: 120,
  verticalLift: 18,
  rotation: 6,
  depthScale: 0.075,
  depthFade: 0.18,
  maxVisibleOffset: 3,
};

const CARD_CENTER_LEFT = 47;
const CARD_ACCENTS = [
  "linear-gradient(135deg, #1d2671, #c33764)",
  "linear-gradient(135deg, #09203f, #537895)",
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  "linear-gradient(135deg, #42275a, #734b6d)",
  "linear-gradient(135deg, #283c86, #45a247)",
  "linear-gradient(135deg, #134e5e, #71b280)",
];

interface CompactNowPlayingProps {
  station: Station | null;
  onNext?: () => void;
  onPrevious?: () => void;
}

const CompactNowPlayingHeader = ({ station, onNext, onPrevious }: CompactNowPlayingProps) => {
  const { isPlaying, togglePlay } = usePlayerStore();

  if (!station) return null;

  const artworkAccent = getCardAccent(0);
  const fallbackInitials = getFallbackInitials(station.name);

  const buttonStyle: CSSProperties = {
    width: "46px",
    height: "46px",
    borderRadius: "999px",
    border: "1px solid rgba(248,250,252,0.12)",
    background: "rgba(15,23,42,0.85)",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease, border-color 0.15s ease",
  };

  return (
    <div
      className="compact-now-playing"
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.1rem",
        padding: "0.95rem 1.5rem",
        borderRadius: "1.25rem",
        background: "rgba(2,6,23,0.92)",
        border: "1px solid rgba(248,250,252,0.12)",
        boxShadow: "0 30px 80px rgba(2,6,23,0.7)",
        backdropFilter: "blur(22px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", minWidth: 0 }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "1rem",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: station.favicon ? undefined : artworkAccent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(248,250,252,0.95)",
            fontSize: "1.8rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {station.favicon ? (
            <img
              src={station.favicon}
              alt="Station artwork"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            fallbackInitials
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 0 }}>
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(226,232,240,0.65)",
            }}
          >
            Now Playing
          </span>
          <p
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "rgba(248,250,252,0.98)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {station.name}
          </p>
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(203,213,225,0.8)",
            }}
          >
            {[station.country, station.state].filter(Boolean).join(" • ") || station.language}
          </span>
        </div>
      </div>

      <div
        className="compact-player-controls"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}
      >
        <button
          type="button"
          aria-label="Previous station"
          onClick={onPrevious}
          disabled={!onPrevious}
          style={{
            ...buttonStyle,
            opacity: onPrevious ? 1 : 0.4,
            cursor: onPrevious ? "pointer" : "not-allowed",
          }}
        >
          <IconPlayerTrackPrev size={20} />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          style={{
            ...buttonStyle,
            width: "56px",
            height: "56px",
            background: "linear-gradient(120deg, rgba(59,130,246,0.95), rgba(147,197,253,0.95))",
            border: "none",
            color: "#020617",
          }}
        >
          {isPlaying ? <IconPlayerPauseFilled size={26} /> : <IconPlayerPlayFilled size={26} />}
        </button>
        <button
          type="button"
          aria-label="Next station"
          onClick={onNext}
          disabled={!onNext}
          style={{
            ...buttonStyle,
            opacity: onNext ? 1 : 0.4,
            cursor: onNext ? "pointer" : "not-allowed",
          }}
        >
          <IconPlayerTrackNext size={20} />
        </button>
      </div>
    </div>
  );
};

function getCardAccent(index: number): string {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
  return accent ?? "linear-gradient(135deg, #1d2671, #c33764)";
}

function getFallbackInitials(name: string | null | undefined): string {
  if (!name) return "FM";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .trim()
    .toUpperCase();
  return initials || "FM";
}

function getDisplayLanguage(station: Station): string {
  if (station.language && station.language.trim().length > 0) return station.language;
  if (station.languageCodes && station.languageCodes.length > 0) return station.languageCodes.join(" / ");
  return "Multi-lingual";
}

function extractTags(station: Station): string[] {
  if (Array.isArray(station.tagList) && station.tagList.length > 0) {
    return station.tagList.slice(0, TAG_LIMIT);
  }

  if (typeof station.tags === "string" && station.tags.trim().length > 0) {
    return station.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, TAG_LIMIT);
  }

  return [];
}

function formatCountryLabel(station: Station): string {
  const country = station.country?.trim() ?? "Global";
  if (station.state && station.state.trim().length > 0) {
    return `${station.state.trim()} · ${country}`;
  }
  return country;
}

function formatBitrateLabel(station: Station): string {
  const codec = station.codec ? station.codec.toUpperCase() : "MP3";
  const bitrate = station.bitrate > 0 ? `${station.bitrate} kbps` : "Live stream";
  return `${codec} · ${bitrate}`;
}

interface StationCardFanItemProps {
  station: Station;
  index: number;
  activeIndex: number;
  activeStationId: string | null;
  localActiveId: string | null;
  hoveredId: string | null;
  totalStations: number;
  descriptorReason: string;
  moodLabel: string;
  onHover: (id: string | null) => void;
  onClick: (station: Station) => void;
}

const StationCardFanItem = memo(
  ({
    station,
    index,
    activeIndex,
    activeStationId,
    localActiveId,
    hoveredId,
    totalStations,
    descriptorReason,
    moodLabel,
    onHover,
    onClick,
  }: StationCardFanItemProps) => {
    const isActive = station.uuid === (activeStationId ?? localActiveId);
    const isHovered = hoveredId === station.uuid;
    const offset = index - activeIndex;
    const clampedOffset = Math.max(-FAN_CONFIG.maxVisibleOffset, Math.min(FAN_CONFIG.maxVisibleOffset, offset));
    const depth = Math.abs(clampedOffset);
    const translateX = clampedOffset * FAN_CONFIG.spread;
    const translateY = depth * FAN_CONFIG.verticalLift - (offset === 0 ? 8 : 0);
    const rotate = clampedOffset * FAN_CONFIG.rotation;
    const baseScale = 1 - depth * FAN_CONFIG.depthScale;
    const scale = isActive ? 1 : Math.max(0.84, baseScale);
    const depthOpacity = isActive ? 1 : 1 - Math.min(FAN_CONFIG.depthFade * depth, 0.45);
    const zIndex = isActive ? 120 : 90 - depth * 10;
    const accent = getCardAccent(index);
    const fallbackInitials = getFallbackInitials(station.name);
    const languageLabel = getDisplayLanguage(station);
    const bitrateLabel = formatBitrateLabel(station);
    const stationOrder = index + 1;
    const tags = extractTags(station);
    const healthMeta = deriveStationHealth(station);
    const healthIcon =
      healthMeta?.status === "warning" || healthMeta?.status === "error" ? (
        <IconAlertTriangle size={12} />
      ) : (
        <IconShieldCheck size={12} />
      );
    const cardBackground = isActive ? "rgba(8,15,35,0.98)" : "rgba(6,10,24,0.9)";
    const borderColor = isActive ? "rgba(34,211,238,0.85)" : "rgba(148,163,184,0.35)";
    const glowShadow = isActive
      ? "0 15px 45px rgba(34,211,238,0.35)"
      : isHovered
        ? "0 12px 30px rgba(59,130,246,0.25)"
        : "0 18px 35px rgba(3,7,18,0.65)";
    const locationLabel = formatCountryLabel(station);
    const metadataLine = [locationLabel, languageLabel, bitrateLabel];
    const displayTags = tags.length > 0 ? tags : ["curated", "passport", moodLabel];

    return (
      <motion.button
        key={station.uuid}
        className="station-list-card"
        type="button"
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{
          opacity: isActive ? 1 : depthOpacity,
          x: translateX,
          y: translateY,
          rotate,
          scale,
        }}
        whileHover={{ scale: Math.min(scale + 0.06, 1.08) }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 24,
          mass: 0.8,
        }}
        style={{
          position: "absolute",
          top: "50%",
          left: `${CARD_CENTER_LEFT}%`,
          transform: "translate(-50%, -50%)",
          width: CARD_WIDTH_STYLE,
          height: CARD_HEIGHT_STYLE,
          borderRadius: "1.5rem",
          border: `1.5px solid ${borderColor}`,
          background: cardBackground,
          boxShadow: glowShadow,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          padding: "1.25rem",
          gap: "1.2rem",
          cursor: "pointer",
          overflow: "hidden",
          zIndex: isActive ? 110 : zIndex,
          backdropFilter: "blur(6px)",
          pointerEvents: Math.abs(offset) > FAN_CONFIG.maxVisibleOffset ? "none" : "auto",
          opacity: Math.abs(offset) > FAN_CONFIG.maxVisibleOffset ? 0 : undefined,
          display: Math.abs(offset) > FAN_CONFIG.maxVisibleOffset + 1 ? "none" : "flex",
        }}
        onMouseEnter={() => onHover(station.uuid)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(station.uuid)}
        onBlur={() => onHover(null)}
        onClick={(event) => {
          event.stopPropagation();
          onClick(station);
        }}
        aria-pressed={isActive}
        aria-label={`Play ${station.name}`}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            flex: 1,
            display: "flex",
            alignItems: "stretch",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              width: "108px",
              minWidth: "108px",
              borderRadius: "1.25rem",
              overflow: "hidden",
              border: `1px solid ${isActive ? "rgba(34,211,238,0.45)" : "rgba(148,163,184,0.25)"}`,
              background: station.favicon ? "rgba(15,23,42,0.65)" : accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive ? "0 10px 20px rgba(34,211,238,0.35)" : "0 15px 30px rgba(2,6,23,0.6)",
              flexShrink: 0,
            }}
          >
            {station.favicon ? (
              <img
                src={station.favicon}
                alt={`Artwork for ${station.name}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(248,250,252,0.92)",
                  fontSize: "2.1rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {fallbackInitials}
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.9rem", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.45rem",
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      color: "rgba(248,250,252,0.98)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {station.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                      fontSize: "0.78rem",
                      color: "rgba(203,213,225,0.9)",
                    }}
                  >
                    {metadataLine.map((label, metaIndex) => (
                      <span key={`${station.uuid}-meta-${metaIndex}`} style={{ display: "inline-flex", alignItems: "center" }}>
                        {label}
                        {metaIndex < metadataLine.length - 1 ? <span style={{ margin: "0 0.3rem" }}>•</span> : null}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(248,250,252,0.65)",
                    }}
                  >
                    {stationOrder}/{totalStations}
                  </span>
                  {isActive && (
                    <span
                      className="now-playing-pill"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        background: "rgba(8,145,178,0.12)",
                        border: "1px solid rgba(45,212,191,0.45)",
                        color: "rgba(186,230,253,0.95)",
                        fontSize: "0.72rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      <span className="now-playing-eq" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      Live
                    </span>
                  )}
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.92rem",
                  lineHeight: 1.45,
                  color: "rgba(226,232,240,0.9)",
                }}
              >
                {station.highlight?.trim() || descriptorReason}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {displayTags.map((tag) => (
                  <span
                    key={`${station.uuid}-${tag}`}
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      background: "rgba(15,23,42,0.75)",
                      border: "1px solid rgba(148,163,184,0.3)",
                      color: "rgba(248,250,252,0.9)",
                      textTransform: "none",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {tag.toLowerCase()}
                  </span>
                ))}
              </div>

              {healthMeta && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.7rem",
                    padding: "0.3rem 0.85rem",
                    borderRadius: "999px",
                    ...getHealthBadgeStyle(healthMeta.status),
                  }}
                >
                  {healthIcon}
                  {healthMeta.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.button>
    );
  }
);
StationCardFanItem.displayName = "StationCardFanItem";

const CardStackScene: SceneComponent = ({ descriptor, onStationSelect, activeStationId, className, sceneStatus }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [localActiveId, setLocalActiveId] = useState<string | null>(descriptor.stations[0]?.uuid ?? null);
  const [visibleStations, setVisibleStations] = useState(() => descriptor.stations.slice(0, CARD_STACK_LIMIT));
  const wheelDeltaRef = useRef(0);

  const activeStation = useMemo(() => {
    const id = activeStationId || localActiveId;
    return visibleStations.find((s) => s.uuid === id) || visibleStations[0];
  }, [activeStationId, localActiveId, visibleStations]);

  const activeIndex = useMemo(() => {
    const id = activeStation?.uuid ?? activeStationId ?? localActiveId;
    if (!id) return 0;
    const index = visibleStations.findIndex((station) => station.uuid === id);
    return index >= 0 ? index : 0;
  }, [activeStation?.uuid, activeStationId, localActiveId, visibleStations]);

  useEffect(() => {
    const next = descriptor.stations.slice(0, CARD_STACK_LIMIT);
    // Ensure no duplicates based on UUID
    const uniqueStations = next.filter((station, index, self) =>
      index === self.findIndex((s) => s.uuid === station.uuid)
    );
    setVisibleStations(uniqueStations);
    if (uniqueStations[0] && !activeStationId) {
      setLocalActiveId(uniqueStations[0].uuid);
    }
  }, [descriptor.stations, activeStationId]);

  const setActiveStation = useCallback(
    (station: Station | undefined, options?: { autoplay?: boolean }) => {
      if (!station) return;
      setLocalActiveId(station.uuid);
      if (options?.autoplay && station.uuid !== activeStationId) {
        onStationSelect?.(station);
      }
    },
    [activeStationId, onStationSelect]
  );

  const stepActiveStation = useCallback(
    (delta: number, options?: { autoplay?: boolean }) => {
      if (visibleStations.length === 0) return;
      const nextIndex = (activeIndex + delta + visibleStations.length) % visibleStations.length;
      const target = visibleStations[nextIndex];
      setActiveStation(target, options);
    },
    [activeIndex, setActiveStation, visibleStations]
  );

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (visibleStations.length <= 1) return;
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(dominantDelta) < 6) return;
      wheelDeltaRef.current += dominantDelta;
      if (Math.abs(wheelDeltaRef.current) >= 60) {
        const direction = wheelDeltaRef.current > 0 ? 1 : -1;
        wheelDeltaRef.current = 0;
        stepActiveStation(direction);
      }
    },
    [stepActiveStation, visibleStations.length]
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => stepActiveStation(1),
    onSwipedRight: () => stepActiveStation(-1),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });


  useEffect(() => {
    if (visibleStations.length === 0) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      if (visibleStations.length === 0) return;

      const forwardKeys = ["ArrowRight", "ArrowDown"];
      const backwardKeys = ["ArrowLeft", "ArrowUp"];

      if (forwardKeys.includes(event.key)) {
        event.preventDefault();
        const nextIndex = (activeIndex + 1) % visibleStations.length;
        setActiveStation(visibleStations[nextIndex]);
      } else if (backwardKeys.includes(event.key)) {
        event.preventDefault();
        const nextIndex = (activeIndex - 1 + visibleStations.length) % visibleStations.length;
        setActiveStation(visibleStations[nextIndex]);
      } else if (event.key === "Home") {
        event.preventDefault();
        setActiveStation(visibleStations[0]);
      } else if (event.key === "End") {
        event.preventDefault();
        setActiveStation(visibleStations[visibleStations.length - 1]);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        const target = visibleStations[activeIndex] ?? visibleStations[0];
        setActiveStation(target, { autoplay: true });
      }
    };

    window.addEventListener("keydown", handleKeyPress, true);
    document.addEventListener("keydown", handleKeyPress, true);
    return () => {
      window.removeEventListener("keydown", handleKeyPress, true);
      document.removeEventListener("keydown", handleKeyPress, true);
    };
  }, [activeIndex, setActiveStation, visibleStations]);

  const moodBackground = useMemo(() => {
    if (!descriptor.mood) return MOOD_BACKGROUNDS.night;
    const moodKey = descriptor.mood.toLowerCase();
    return MOOD_BACKGROUNDS[moodKey] ?? MOOD_BACKGROUNDS.night;
  }, [descriptor.mood]);

  const descriptorReason = descriptor.reason?.trim() || DEFAULT_REASON;
  const totalStations = descriptor.stations.length;
  const countryCount = useMemo(() => {
    const lookup = new Set(
      descriptor.stations
        .map((station) => station.countryCode ?? station.country)
        .filter((value): value is string => Boolean(value))
    );
    if (lookup.size > 0) {
      return lookup.size;
    }
    return totalStations > 0 ? 1 : 0;
  }, [descriptor.stations, totalStations]);

  const moodLabel = descriptor.mood ?? "AI-curated journey";

  const sceneStats = useMemo(
    () => [
      { label: "Stations", value: totalStations.toString() },
      { label: "Countries", value: countryCount.toString() },
      { label: "Mix", value: descriptor.animation?.replace(/[_-]+/g, " ") || "slow reveal" },
    ],
    [countryCount, descriptor.animation, totalStations]
  );
  const isSceneLoading = sceneStatus?.isLoading ?? false;
  const loadingTitle = sceneStatus?.title ?? moodLabel;
  const loadingHint = sceneStatus?.hint ?? "Analyzing vibes…";
  const loadingSteps = sceneStatus?.steps ?? [];
  const curatedMoodSection = (
    <motion.div
      key={isSceneLoading ? "loading" : "curated"}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        width: "100%",
        maxWidth: "min(960px, 95vw)",
        color: "rgba(241,245,249,0.95)",
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
        textAlign: "left",
        minHeight: isSceneLoading ? "200px" : undefined,
        justifyContent: isSceneLoading ? "center" : "flex-start",
        background: "rgba(8,12,32,0.65)",
        borderRadius: "1.25rem",
        border: "1px solid rgba(148,163,184,0.25)",
        padding: "1.35rem 1.6rem",
        margin: "0 auto",
      }}
    >
      {isSceneLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(226,232,240,0.65)",
              fontWeight: 600,
            }}
          >
            Curating your musical journey
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#fefce8",
            }}
          >
            {loadingTitle}
          </h2>
          <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.5, color: "rgba(226,232,240,0.85)" }}>{loadingHint}</p>
          {loadingSteps.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.8rem",
                fontSize: "0.62rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(203,213,225,0.75)",
              }}
            >
              {loadingSteps.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(226,232,240,0.6)",
                fontWeight: 500,
              }}
            >
              Curated mood
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "0.55rem",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                border: "1px solid rgba(248,250,252,0.35)",
                background: "rgba(8, 28, 64, 0.45)",
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "#fefce8",
                boxShadow: "0 20px 45px rgba(7, 19, 41, 0.45)",
              }}
            >
              {moodLabel}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5, color: "rgba(226,232,240,0.85)" }}>{descriptorReason}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem" }}>
            {sceneStats.map((stat) => (
              <div key={stat.label} style={{ minWidth: "100px" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.65rem",
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    color: "rgba(226,232,240,0.55)",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc" }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );

  if (visibleStations.length === 0) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: BASE_BACKGROUND,
          padding: "3rem 2.5rem",
          borderRadius: "1.5rem",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255, 255, 255, 0.85)",
          fontSize: "1rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          boxShadow: "0 25px 60px rgba(15, 35, 70, 0.35)",
        }}
      >
        Awaiting AI curation…
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        minHeight: SCENE_MIN_HEIGHT,
        backgroundColor: BASE_BACKGROUND,
        padding: "0.75rem 1.5rem 1.8rem",
        borderRadius: "1.5rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "0.65rem",
        boxShadow: "0 30px 80px rgba(5, 12, 30, 0.55)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `${moodBackground}, radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 48%)`,
          opacity: 0.45,
          pointerEvents: "none",
        }}
        aria-hidden={true}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
          maxWidth: "1200px",
        }}
      >
        <motion.div
          initial={{ opacity: 0.85, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(248,250,252,0.55)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.15rem 0",
          }}
        >
          <span style={{ width: "28px", height: "1px", background: "rgba(248,250,252,0.25)" }} />
          Arrow Keys · Click to Play · Home/End jump
          <span style={{ width: "28px", height: "1px", background: "rgba(248,250,252,0.25)" }} />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, scale: 0.97, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="card-stack-shell"
          onWheel={handleWheel}
          {...swipeHandlers}
          style={{
            position: "relative",
            width: "100%",
            background: "rgba(2,6,23,0.9)",
            borderRadius: "1.6rem",
            border: "1.5px solid rgba(148,163,184,0.25)",
            boxShadow: "0 45px 120px rgba(3, 8, 20, 0.65)",
            overflow: "visible",
            padding: "1.25rem 1.4rem 1.6rem",
            minHeight: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            touchAction: "pan-y",
            overscrollBehaviorY: "contain",
            gap: "0.35rem",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 20% 25%, rgba(59,130,246,0.12), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          {activeStation && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                width: "min(960px, 100%)",
                margin: "0 auto",
                position: "sticky",
                top: "1rem",
                zIndex: 5,
              }}
            >
              <CompactNowPlayingHeader
                station={activeStation}
                onNext={() => stepActiveStation(1, { autoplay: true })}
                onPrevious={() => stepActiveStation(-1, { autoplay: true })}
              />
            </motion.div>
          )}
          <div style={{ width: "100%" }}>{curatedMoodSection}</div>
          <div
            className="card-fan-stage"
            aria-label="AI curated stations"
            role="listbox"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "min(980px, 92vw)",
              margin: "0 auto 0.1rem",
            }}
          >
            {visibleStations.map((station, index) => (
              <StationCardFanItem
                key={station.uuid}
                station={station}
                index={index}
                activeIndex={activeIndex}
                activeStationId={activeStationId ?? null}
                localActiveId={localActiveId}
                hoveredId={hoveredId}
                totalStations={totalStations}
                descriptorReason={descriptorReason}
                moodLabel={moodLabel}
                onHover={setHoveredId}
                onClick={(candidate) => setActiveStation(candidate, { autoplay: true })}
              />
            ))}
          </div>
        </motion.section>

        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.45; }
            }

            @keyframes equalize {
              0% { transform: scaleY(0.4); opacity: 0.6; }
              50% { transform: scaleY(1.2); opacity: 1; }
              100% { transform: scaleY(0.4); opacity: 0.6; }
            }

            .now-playing-eq {
              display: inline-flex;
              align-items: flex-end;
              gap: 2px;
              height: 12px;
            }

            .now-playing-eq span {
              width: 3px;
              height: 10px;
              border-radius: 999px;
              background: rgba(34,211,238,0.9);
              animation: equalize 0.9s ease-in-out infinite;
            }

            .now-playing-eq span:nth-child(2) {
              animation-delay: 0.15s;
            }

            .now-playing-eq span:nth-child(3) {
              animation-delay: 0.3s;
            }

            .compact-now-playing button:enabled:hover {
              transform: translateY(-1px);
              border-color: rgba(248,250,252,0.4);
            }

            @media (max-width: 1024px) {
              .compact-now-playing {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
              }
              .compact-player-controls {
                width: 100%;
                justify-content: flex-start;
                flex-wrap: wrap;
                gap: 0.5rem;
              }
              .compact-player-controls button {
                flex: 1;
                min-width: 82px;
              }
            }

            @media (max-width: 768px) {
              .station-list-card {
                flex-direction: column;
                align-items: flex-start;
                left: 50% !important;
              }
            }

            @media (min-width: 769px) and (max-width: 1100px) {
              .station-list-card {
                left: 49% !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default CardStackScene;
