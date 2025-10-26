import { motion, AnimatePresence } from "framer-motion";
import { Text, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconX,
  IconMaximize,
} from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Station } from "~/types/radio";

type MinimalPlayerProps = {
  nowPlaying: Station | null;
  isPlaying: boolean;
  canSeekStations: boolean;
  countryMap: Map<string, { name: string; iso_3166_1: string; stationcount: number }>;
  onPlayPause: () => void;
  onPlayNext?: () => void;
  onPlayPrevious?: () => void;
  onDismiss: () => void;
  onMaximize: () => void;
};

export function MinimalPlayer({
  nowPlaying,
  isPlaying,
  canSeekStations,
  countryMap,
  onPlayPause,
  onPlayNext,
  onPlayPrevious,
  onDismiss,
  onMaximize,
}: MinimalPlayerProps) {
  if (!nowPlaying) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-8 md:right-auto md:bottom-6 md:max-w-md"
      >
        <div className="glass-veil rounded-xl border border-white/10 bg-white/8 p-3 shadow-xl backdrop-blur-lg">
          <div className="flex items-center gap-3">
            {/* Station info - compact */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <CountryFlag
                iso={countryMap.get(nowPlaying.country)?.iso_3166_1}
                title={`${nowPlaying.country} flag`}
                size={20}
              />
              <div className="min-w-0 flex-1">
                <Text size="sm" fw={500} c="#f8fafc" lineClamp={1} className="leading-tight">
                  {nowPlaying.name}
                </Text>
                <Text size="xs" c="rgba(241,245,249,0.6)" lineClamp={1}>
                  {nowPlaying.country}
                </Text>
              </div>
            </div>

            {/* Controls - minimal */}
            <div className="flex items-center gap-1">
              {canSeekStations && onPlayPrevious && (
                <Tooltip label="Previous" position="top" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={onPlayPrevious}
                    style={{ color: "#94a3b8" }}
                    aria-label="Previous station"
                  >
                    <IconPlayerTrackPrev size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              <Tooltip label={isPlaying ? "Pause" : "Play"} position="top" withArrow>
                <ActionIcon
                  size="md"
                  variant="filled"
                  onClick={onPlayPause}
                  style={{
                    background: "linear-gradient(135deg, rgba(199,158,73,0.9), rgba(151,118,57,0.9))",
                    border: "1px solid rgba(199,158,73,0.5)",
                    color: "#0f1419",
                  }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <IconPlayerPauseFilled size={18} />
                  ) : (
                    <IconPlayerPlayFilled size={18} />
                  )}
                </ActionIcon>
              </Tooltip>

              {canSeekStations && onPlayNext && (
                <Tooltip label="Next" position="top" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={onPlayNext}
                    style={{ color: "#94a3b8" }}
                    aria-label="Next station"
                  >
                    <IconPlayerTrackNext size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              <Tooltip label="Maximize player" position="top" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={onMaximize}
                  style={{ color: "#94a3b8" }}
                  aria-label="Maximize player"
                >
                  <IconMaximize size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Close player" position="top" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={onDismiss}
                  style={{ color: "#64748b" }}
                  aria-label="Close player"
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
