import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { SceneComponent } from "./types";

type AnimationSettings = {
  stackGap: number;
  baseScale: number;
  hoverScale: number;
  transition: {
    stiffness: number;
    damping: number;
    mass: number;
  };
};

const DEFAULT_ANIMATION: AnimationSettings = {
  stackGap: 32,
  baseScale: 0.92,
  hoverScale: 1.04,
  transition: {
    stiffness: 240,
    damping: 28,
    mass: 1,
  },
};

const MOOD_BACKGROUNDS: Record<string, string> = {
  night: "linear-gradient(135deg, #111827, #1f2937)",
  sunrise: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  lush: "linear-gradient(135deg, #56ab2f, #a8e063)",
  ocean: "linear-gradient(135deg, #36d1dc, #5b86e5)",
};

function resolveAnimationSettings(source: Record<string, unknown> | null | undefined): AnimationSettings {
  const fallback = DEFAULT_ANIMATION;
  if (!source) return fallback;

  const stackGapValue = source["stackGap"];
  const baseScaleValue = source["baseScale"];
  const hoverScaleValue = source["hoverScale"];
  const stackGap = typeof stackGapValue === "number" ? stackGapValue : fallback.stackGap;
  const baseScale = typeof baseScaleValue === "number" ? baseScaleValue : fallback.baseScale;
  const hoverScale = typeof hoverScaleValue === "number" ? hoverScaleValue : fallback.hoverScale;

  const transitionSource = (source["transition"] as Record<string, unknown> | null | undefined) ?? null;
  const stiffnessValue = transitionSource?.["stiffness"];
  const dampingValue = transitionSource?.["damping"];
  const massValue = transitionSource?.["mass"];
  const stiffness = typeof stiffnessValue === "number" ? stiffnessValue : fallback.transition.stiffness;
  const damping = typeof dampingValue === "number" ? dampingValue : fallback.transition.damping;
  const mass = typeof massValue === "number" ? massValue : fallback.transition.mass;

  return {
    stackGap,
    baseScale,
    hoverScale,
    transition: { stiffness, damping, mass },
  };
}

const CardStackScene: SceneComponent = ({ descriptor, onStationSelect, activeStationId, className }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleStations, setVisibleStations] = useState(() => descriptor.stations.slice(0, 5));

  useEffect(() => {
    setVisibleStations(descriptor.stations.slice(0, 5));
  }, [descriptor.stations]);

  const animation = useMemo(() => resolveAnimationSettings(descriptor.animation), [descriptor.animation]);

  const background = useMemo(() => {
    if (!descriptor.mood) return MOOD_BACKGROUNDS.night;
    const moodKey = descriptor.mood.toLowerCase();
    return MOOD_BACKGROUNDS[moodKey] ?? MOOD_BACKGROUNDS.night;
  }, [descriptor.mood]);

  if (visibleStations.length === 0) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background,
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
        No stations queued
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background,
        padding: "3rem 2.5rem",
        borderRadius: "1.5rem",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 25px 60px rgba(15, 35, 70, 0.35)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(420px, 90%)",
          height: "min(560px, 85%)",
        }}
      >
        <AnimatePresence>
          {visibleStations.map((station, index) => {
            const reversedIndex = visibleStations.length - index - 1;
            const isActive = station.uuid === activeStationId;
            const isHovered = hoveredId === station.uuid;

            const translateY = reversedIndex * animation.stackGap * -0.4;
            const translateZ = reversedIndex * -80;
            const scale = isActive ? animation.hoverScale : animation.baseScale - reversedIndex * 0.04;
            const zIndex = 100 - reversedIndex * 2 + (isActive ? 20 : 0);

            return (
              <motion.button
                key={station.uuid}
                layout
                type="button"
                initial={{ opacity: 0, y: 40, scale: animation.baseScale }}
                animate={{
                  opacity: 1,
                  y: translateY,
                  scale: isHovered || isActive ? animation.hoverScale : scale,
                  z: translateZ,
                }}
                exit={{ opacity: 0, y: -60, scale: animation.baseScale * 0.85 }}
                transition={{
                  type: "spring",
                  stiffness: animation.transition.stiffness,
                  damping: animation.transition.damping,
                  mass: animation.transition.mass,
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex,
                  borderRadius: "1.5rem",
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.92)",
                  boxShadow: "0 18px 38px rgba(0, 0, 0, 0.25)",
                  display: "grid",
                  gridTemplateRows: "auto 1fr",
                  overflow: "hidden",
                  padding: 0,
                  transformStyle: "preserve-3d",
                }}
                onClick={() => onStationSelect?.(station)}
                onMouseEnter={() => setHoveredId(station.uuid)}
                onMouseLeave={() => setHoveredId((prev) => (prev === station.uuid ? null : prev))}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.92), rgba(55, 65, 81, 0.85))",
                    color: "white",
                    padding: "1.25rem 1.5rem",
                    textAlign: "left",
                  }}
                >
                  <p style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", opacity: 0.75 }}>
                    {station.country}
                  </p>
                  <h3 style={{ fontSize: "1.65rem", fontWeight: 700, margin: "0.35rem 0 0" }}>{station.name}</h3>
                </div>
                <div
                  style={{
                    position: "relative",
                    background: station.favicon ? undefined : "rgba(15, 35, 70, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: station.favicon ? "0" : "1.5rem",
                  }}
                >
                  {station.favicon ? (
                    <img
                      src={station.favicon}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "0.95rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.45em",
                        color: "rgba(15, 35, 70, 0.75)",
                        textAlign: "center",
                      }}
                    >
                      {station.codec ?? "Live"} • {station.bitrate ? `${station.bitrate}kbps` : "Stream"}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardStackScene;
