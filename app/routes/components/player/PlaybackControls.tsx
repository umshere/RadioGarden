import { motion } from "framer-motion";
import { ActionIcon, Tooltip } from "@mantine/core";
import {
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconArrowsShuffle,
  IconMinimize,
  IconX,
} from "@tabler/icons-react";

type PlaybackControlsProps = {
  isPlaying: boolean;
  shuffleMode: boolean;
  canSeekStations: boolean;
  onPlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onShuffleToggle: () => void;
  onMinimize: () => void;
  onDismiss: () => void;
};

const controlButtonStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#94a3b8",
};

const playButtonStyle = {
  background: "linear-gradient(135deg, rgba(199,158,73,0.95), rgba(151,118,57,0.95))",
  border: "2px solid rgba(199,158,73,0.6)",
  color: "#0f1419",
  boxShadow: "0 4px 16px rgba(199,158,73,0.35)",
};

export function PlaybackControls({
  isPlaying,
  shuffleMode,
  canSeekStations,
  onPlayPause,
  onPlayNext,
  onPlayPrevious,
  onShuffleToggle,
  onMinimize,
  onDismiss,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      {canSeekStations && (
        <Tooltip label="Previous" position="top" withArrow>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <ActionIcon
              size="md"
              variant="light"
              onClick={onPlayPrevious}
              style={controlButtonStyle}
              aria-label="Previous station"
            >
              <IconPlayerTrackPrev size={18} />
            </ActionIcon>
          </motion.div>
        </Tooltip>
      )}
      
      <Tooltip label={isPlaying ? "Pause" : "Play"} position="top" withArrow>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <ActionIcon
            size={48}
            variant="filled"
            onClick={onPlayPause}
            style={playButtonStyle}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <IconPlayerPauseFilled size={22} /> : <IconPlayerPlayFilled size={22} />}
          </ActionIcon>
        </motion.div>
      </Tooltip>
      
      {canSeekStations && (
        <Tooltip label="Next" position="top" withArrow>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <ActionIcon
              size="md"
              variant="light"
              onClick={onPlayNext}
              style={controlButtonStyle}
              aria-label="Next station"
            >
              <IconPlayerTrackNext size={18} />
            </ActionIcon>
          </motion.div>
        </Tooltip>
      )}
      
      <div className="mx-1 h-8 w-px bg-white/10" />
      
      <Tooltip label={shuffleMode ? "Shuffle on" : "Shuffle off"} position="top" withArrow>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <ActionIcon
            size="md"
            variant="light"
            onClick={onShuffleToggle}
            style={{
              background: shuffleMode ? "rgba(199,158,73,0.2)" : "rgba(255,255,255,0.06)",
              border: shuffleMode ? "1px solid rgba(199,158,73,0.4)" : "1px solid rgba(255,255,255,0.12)",
              color: shuffleMode ? "#fefae0" : "#94a3b8",
            }}
            aria-label={shuffleMode ? "Shuffle on" : "Shuffle off"}
          >
            <IconArrowsShuffle size={18} />
          </ActionIcon>
        </motion.div>
      </Tooltip>
      
      <Tooltip label="Minimize player" position="top" withArrow>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <ActionIcon
            size="md"
            variant="subtle"
            onClick={onMinimize}
            style={{ color: "#94a3b8" }}
            aria-label="Minimize player"
          >
            <IconMinimize size={18} />
          </ActionIcon>
        </motion.div>
      </Tooltip>
      
      <Tooltip label="Close player" position="top" withArrow>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <ActionIcon
            size="md"
            variant="subtle"
            onClick={onDismiss}
            style={{ color: "#64748b" }}
            aria-label="Close player"
          >
            <IconX size={18} />
          </ActionIcon>
        </motion.div>
      </Tooltip>
    </div>
  );
}
