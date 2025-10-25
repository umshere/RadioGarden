import { motion, AnimatePresence } from "framer-motion";
import { Avatar, Text, Badge, ActionIcon, Button, Tooltip } from "@mantine/core";
import {
  IconDisc,
  IconArrowLeft,
  IconArrowsShuffle,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconX,
  IconMapPin,
} from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Station, ListeningMode } from "~/types/radio";

type PassportPlayerFooterProps = {
  nowPlaying: Station | null;
  isPlaying: boolean;
  audioLevel: number;
  shuffleMode: boolean;
  listeningMode: ListeningMode;
  canSeekStations: boolean;
  hasStationsToCycle: boolean;
  countryMap: Map<string, { name: string; iso_3166_1: string; stationcount: number }>;
  onPlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onShuffleToggle: () => void;
  onQuickRetune: () => void;
  onBackToWorld: () => void;
  onDismiss: () => void;
};

export function PassportPlayerFooter({
  nowPlaying,
  isPlaying,
  audioLevel,
  shuffleMode,
  listeningMode,
  canSeekStations,
  hasStationsToCycle,
  countryMap,
  onPlayPause,
  onPlayNext,
  onPlayPrevious,
  onShuffleToggle,
  onQuickRetune,
  onBackToWorld,
  onDismiss,
}: PassportPlayerFooterProps) {
  if (!nowPlaying) return null;

  return (
    <AnimatePresence>
      <motion.footer
        initial={{ y: 160, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 160, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 180 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 md:px-4 md:pb-4"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="glass-veil relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl md:p-6">
            <div className="flex flex-col gap-4 md:grid md:grid-cols-[auto,minmax(0,1fr),auto] md:items-center md:gap-8">
              <div className="flex min-w-0 items-center gap-3 md:gap-4">
                <div className="relative">
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(199,158,73,0.3) 0%, transparent 70%)",
                    }}
                    animate={{ opacity: isPlaying ? [0.2, 0.5, 0.2] : 0.15 }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <Avatar
                    src={
                      nowPlaying.favicon ||
                      "https://placehold.co/120x120/0f172a/ffffff?text=📻"
                    }
                    size={72}
                    radius="xl"
                    className="md:w-[86px] md:h-[86px]"
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

              <div className="flex w-full flex-col items-center gap-3 md:self-end">
                <div className="player-mode-chip">
                  <span className="player-mode-chip__label">Listening mode</span>
                  <span className="player-mode-chip__value">
                    {listeningMode === "world" ? "Explore the World" : "Stay Local"}
                  </span>
                </div>
                <Tooltip label="Change region or find a new station" position="top" withArrow>
                  <Button
                    radius="xl"
                    size="xs"
                    variant="light"
                    leftSection={<IconMapPin size={16} />}
                    onClick={onQuickRetune}
                    style={{
                      color: "#0f172a",
                      background: "rgba(254,250,226,0.9)",
                      border: "1px solid rgba(148,163,184,0.25)",
                      fontWeight: 600,
                    }}
                    aria-label="Quick retune to another station"
                  >
                    Quick retune
                  </Button>
                </Tooltip>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end md:pr-2 md:gap-3">
                                <Tooltip label="Exit and browse world" position="top" withArrow>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <ActionIcon
                      size="lg"
                      variant="light"
                      onClick={onBackToWorld}
                      className="touch-manipulation min-w-[44px] min-h-[44px]"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#94a3b8",
                      }}
                      aria-label="Back to world view"
                    >
                      <IconArrowLeft size={20} />
                    </ActionIcon>
                  </motion.div>
                </Tooltip>
                                <Tooltip label={shuffleMode ? "Shuffle on: Random stations" : "Shuffle off: Sequential play"} position="top" withArrow>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <ActionIcon
                      size="lg"
                      variant="light"
                      onClick={onShuffleToggle}
                      className="touch-manipulation min-w-[44px] min-h-[44px]"
                      style={{
                        background: shuffleMode
                          ? "rgba(199,158,73,0.25)"
                          : "rgba(255,255,255,0.08)",
                        border: shuffleMode
                          ? "1px solid rgba(199,158,73,0.5)"
                          : "1px solid rgba(255,255,255,0.15)",
                        color: shuffleMode ? "#fefae0" : "#94a3b8",
                      }}
                      aria-label={shuffleMode ? "Shuffle mode on" : "Shuffle mode off"}
                      aria-pressed={shuffleMode}
                    >
                      <IconArrowsShuffle size={20} />
                    </ActionIcon>
                  </motion.div>
                </Tooltip>
                {canSeekStations && (
                  <Tooltip label="Previous station" position="top" withArrow>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="lg"
                        variant="light"
                        onClick={onPlayPrevious}
                        className="touch-manipulation min-w-[44px] min-h-[44px]"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "#94a3b8",
                        }}
                        aria-label="Previous"
                      >
                        <IconPlayerTrackPrev size={20} />
                      </ActionIcon>
                    </motion.div>
                  </Tooltip>
                )}
                <Tooltip label={isPlaying ? "Pause" : "Play"} position="top" withArrow>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <ActionIcon
                      size="xl"
                      variant="filled"
                      onClick={onPlayPause}
                      className="touch-manipulation min-w-[52px] min-h-[52px]"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(199,158,73,0.9), rgba(151,118,57,0.9))",
                        border: "2px solid rgba(199,158,73,0.5)",
                        color: "#0f1419",
                        boxShadow: "0 4px 12px rgba(199,158,73,0.3)",
                      }}
                      aria-label={isPlaying ? "Pause station" : "Play station"}
                      aria-pressed={isPlaying}
                    >
                      {isPlaying ? (
                        <IconPlayerPauseFilled size={24} />
                      ) : (
                        <IconPlayerPlayFilled size={24} />
                      )}
                    </ActionIcon>
                  </motion.div>
                </Tooltip>
                                {canSeekStations && (
                  <Tooltip label="Next station" position="top" withArrow>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                      <ActionIcon
                        size="lg"
                        variant="light"
                        onClick={onPlayNext}
                        className="touch-manipulation min-w-[44px] min-h-[44px]"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "#94a3b8",
                        }}
                        aria-label="Next"
                      >
                        <IconPlayerTrackNext size={20} />
                      </ActionIcon>
                    </motion.div>
                  </Tooltip>
                )}
                                <Tooltip label="Stop and close player" position="top" withArrow>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <ActionIcon
                      size="lg"
                      variant="subtle"
                      onClick={onDismiss}
                      className="touch-manipulation min-w-[44px] min-h-[44px]"
                      style={{ color: "#64748b" }}
                      aria-label="Close player"
                    >
                      <IconX size={20} />
                    </ActionIcon>
                  </motion.div>
                </Tooltip>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex h-12 items-end justify-center gap-[3px]"
            >
              {Array.from({ length: 40 }).map((_, index) => {
                const idleHeight = 18 + Math.random() * 8;
                const idleHeights = [
                  `${idleHeight}%`,
                  `${idleHeight + 6}%`,
                  `${idleHeight}%`,
                ];
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
                      duration: isPlaying
                        ? 0.4 + Math.random() * 0.5
                        : 1.4 + Math.random() * 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </AnimatePresence>
  );
}
