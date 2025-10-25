import { motion } from "framer-motion";
import { Text, Badge, ThemeIcon, Avatar, ActionIcon, Tooltip, Button } from "@mantine/core";
import {
  IconBroadcast,
  IconWaveSine,
  IconLanguage,
  IconMusic,
  IconExternalLink,
  IconPlayerPlayFilled,
  IconHeart,
} from "@tabler/icons-react";
import type { Station } from "~/types/radio";
import { vibrate } from "~/utils/haptics";

type StationCardProps = {
  station: Station;
  index: number;
  isCurrent: boolean;
  onPlay: (station: Station) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (station: Station) => void;
  stationRef?: (element: HTMLDivElement | null) => void;
};

export function StationCard({
  station,
  index,
  isCurrent,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
  stationRef,
}: StationCardProps) {
  return (
    <motion.div
      ref={stationRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <div
        className={`station-card ${isCurrent ? "station-card--active" : ""} ${
          isFavorite ? "station-card--favorite" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          {station.favicon ? (
            <Avatar
              src={station.favicon}
              size={64}
              radius="lg"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            />
          ) : (
            <ThemeIcon
              size={64}
              radius="lg"
              style={{
                background: "rgba(17,27,47,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <IconBroadcast size={28} />
            </ThemeIcon>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <Text fw={600} size="sm" c="#f8fafc" lineClamp={1}>
                {station.name}
              </Text>
              {station.codec && (
                <Badge
                  radius="xl"
                  size="xs"
                  leftSection={<IconWaveSine size={11} />}
                  style={{
                    background: "rgba(148,163,184,0.15)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    color: "rgba(226,232,240,0.8)",
                  }}
                >
                  {station.codec}
                </Badge>
              )}
            </div>
            {station.tags && (
              <Text size="xs" c="rgba(226,232,240,0.55)" lineClamp={2}>
                {station.tags}
              </Text>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {station.language && (
                <Badge
                  radius="xl"
                  size="xs"
                  leftSection={<IconLanguage size={11} />}
                  style={{
                    background: "rgba(37,99,235,0.12)",
                    border: "1px solid rgba(37,99,235,0.25)",
                    color: "rgba(191,219,254,0.85)",
                  }}
                >
                  {station.language}
                </Badge>
              )}
              {station.bitrate > 0 && (
                <Badge
                  radius="xl"
                  size="xs"
                  leftSection={<IconMusic size={11} />}
                  style={{
                    background: "rgba(199,158,73,0.18)",
                    border: "1px solid rgba(199,158,73,0.32)",
                    color: "#fefae0",
                  }}
                >
                  {station.bitrate} kbps
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="divider-soft" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tooltip label="Open stream in new tab" withArrow color="gray">
            <ActionIcon
              component="a"
              href={station.url}
              target="_blank"
              rel="noreferrer"
              size="lg"
              radius="xl"
              style={{
                background: "rgba(17,27,47,0.9)",
                border: "1px solid rgba(148,163,184,0.25)",
                color: "rgba(226,232,240,0.75)",
              }}
              aria-label={`Open ${station.name} stream in a new tab`}
            >
              <IconExternalLink size={18} />
            </ActionIcon>
          </Tooltip>
          {onToggleFavorite && (
            <Tooltip label={isFavorite ? "Remove from favorites" : "Add to favorites"} withArrow color="gray">
              <ActionIcon
                size="lg"
                radius="xl"
                onClick={() => {
                  vibrate(10);
                  onToggleFavorite?.(station);
                }}
                style={{
                  background: isFavorite
                    ? "linear-gradient(120deg, rgba(209,73,91,0.9) 0%, rgba(148,34,56,0.9) 100%)"
                    : "rgba(17,27,47,0.9)",
                  border: isFavorite
                    ? "1px solid rgba(254,250,226,0.6)"
                    : "1px solid rgba(148,163,184,0.25)",
                  color: isFavorite ? "#fde4e4" : "rgba(226,232,240,0.75)",
                }}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Unfavorite ${station.name}` : `Favorite ${station.name}`}
              >
                <IconHeart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label={`Play ${station.name}`} withArrow>
            <Button
              radius="xl"
              size="sm"
              leftSection={<IconPlayerPlayFilled size={16} />}
              onClick={() => {
                vibrate(12);
                onPlay(station);
              }}
              style={{
                background:
                  "linear-gradient(120deg, rgba(199,158,73,0.9) 0%, rgba(148,113,51,0.9) 100%)",
                color: "#0f172a",
                fontWeight: 600,
              }}
              aria-label={`Play ${station.name}`}
            >
              Play station
            </Button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
