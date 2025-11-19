import { useMemo, useCallback, useState } from "react";
import { ActionIcon, Paper, Text, Tooltip } from "@mantine/core";
import { AnimatePresence } from "framer-motion";
import RetroTuner from "./RetroTuner";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconMapPin,
} from "@tabler/icons-react";
import { usePlayerStore } from "~/state/playerStore";
import { useUIStore } from "~/state/uiStore";

export default function PlayerDock() {
  const {
    nowPlaying,
    isPlaying,
    togglePlay,
    queue,
    currentStationIndex,
    startStation
  } = usePlayerStore();

  const { toggleQuickRetune } = useUIStore();
  const { raptorMiniEnabled } = useUIStore();

  const title = useMemo(() => nowPlaying?.name ?? "", [nowPlaying?.name]);
  const subtitle = useMemo(
    () => [nowPlaying?.country, nowPlaying?.state].filter(Boolean).join(" • "),
    [nowPlaying?.country, nowPlaying?.state]
  );

  const frequency = useMemo(() => {
    if (!nowPlaying) return "0.0";
    let hash = 0;
    for (let i = 0; i < nowPlaying.uuid.length; i++) {
      hash = nowPlaying.uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const range = 108.0 - 88.0;
    const normalized = Math.abs(hash % 1000) / 1000;
    return (88.0 + normalized * range).toFixed(1);
  }, [nowPlaying?.uuid]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = (currentStationIndex + 1) % queue.length;
    const nextStation = queue[nextIndex];
    if (nextStation) {
      startStation(nextStation, { preserveQueue: true });
    }
  }, [queue, currentStationIndex, startStation]);

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIndex = (currentStationIndex - 1 + queue.length) % queue.length;
    const prevStation = queue[prevIndex];
    if (prevStation) {
      startStation(prevStation, { preserveQueue: true });
    }
  }, [queue, currentStationIndex, startStation]);

  const handleRetune = useCallback(() => {
    if (queue.length === 0) return;
    // Pick a random station different from current
    let randomIndex = Math.floor(Math.random() * queue.length);
    if (queue.length > 1 && randomIndex === currentStationIndex) {
      randomIndex = (randomIndex + 1) % queue.length;
    }
    const randomStation = queue[randomIndex];
    if (randomStation) {
      startStation(randomStation, { preserveQueue: true });
    }
  }, [queue, currentStationIndex, startStation]);

  const [isExpanded, setIsExpanded] = useState(false);

  if (!nowPlaying) return null;

  // Desktop dock (float bottom-right to avoid covering hero CTAs)
  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <RetroTuner
            station={nowPlaying}
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <aside className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden w-full max-w-2xl px-4 lg:block">
        <div
          className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-4 p-3">
            {/* Artwork */}
            <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50 flex-shrink-0">
              {nowPlaying.favicon ? (
                <img src={nowPlaying.favicon} alt="artwork" className="w-full h-full object-cover" />
              ) : (
                <div className="text-lg font-mono text-slate-300">FM</div>
              )}
            </div>

            {/* Station Info + Frequency Display */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <Text size="sm" fw={700} className="truncate text-slate-900">
                  {title}
                </Text>
                <span className="font-mono text-xs text-slate-400">
                  {frequency} MHz
                </span>
              </div>
              <Text size="xs" c="dimmed" className="truncate">
                {subtitle}
              </Text>
            </div>

            {/* Transport & Quick Retune Controls */}
            <div className="flex items-center gap-1">
              <Tooltip label="Quick Retune" position="top" withArrow>
                <ActionIcon
                  size="md"
                  radius="xl"
                  variant="subtle"
                  color="violet"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleQuickRetune();
                  }}
                  aria-label="Quick Retune"
                  className="text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                >
                  <IconMapPin size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Previous" position="top" withArrow>
                <ActionIcon
                  size="md"
                  radius="xl"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Previous"
                  className="text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                >
                  <IconPlayerSkipBackFilled size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={isPlaying ? "Pause" : "Play"} position="top" withArrow>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                >
                  {isPlaying ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />}
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Next" position="top" withArrow>
                <ActionIcon
                  size="md"
                  radius="xl"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Next"
                  className="text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                >
                  <IconPlayerSkipForwardFilled size={16} />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile mini-player */}
      <div
        className="lg:hidden fixed left-0 right-0 z-40 px-3 transition-all duration-300 ease-out"
        style={{
          bottom: "calc(4rem + env(safe-area-inset-bottom) + 12px)"
        }}
      >
        <div
          data-raptor={raptorMiniEnabled ? "true" : "false"}
          onClick={() => setIsExpanded(true)}
          className={`rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-3 py-2.5 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-transform cursor-pointer ${raptorMiniEnabled ? 'py-1.5' : 'py-2.5'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`${raptorMiniEnabled ? 'h-8 w-8' : 'h-10 w-10'} rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-100 text-sm flex-shrink-0 text-slate-400`}>
              {nowPlaying.favicon ? (
                <img src={nowPlaying.favicon} alt="artwork" className="w-full h-full object-cover" />
              ) : (
                "FM"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-slate-900 truncate leading-tight">{title}</div>
              <div className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">{subtitle}</div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-1">
              {/* Quick Retune (Toggle Widget) */}
              <ActionIcon
                size="md"
                radius="xl"
                variant="subtle"
                color="violet"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleQuickRetune();
                }}
                aria-label="Quick Retune"
                className="text-slate-400 hover:text-violet-600 hover:bg-violet-50"
              >
                <IconMapPin size={18} />
              </ActionIcon>

              {/* Prev */}
              <ActionIcon
                size="md"
                radius="xl"
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous"
                className="text-slate-400 hover:text-slate-800 hover:bg-slate-50"
              >
                <IconPlayerSkipBackFilled size={18} />
              </ActionIcon>

              {/* Play/Pause */}
              <ActionIcon
                size="lg"
                radius="xl"
                variant="filled"
                color={isPlaying ? "gray" : "dark"}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
                className={isPlaying ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"}
              >
                {isPlaying ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />}
              </ActionIcon>

              {/* Next */}
              <ActionIcon
                size="md"
                radius="xl"
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next"
                className="text-slate-400 hover:text-slate-800 hover:bg-slate-50"
              >
                <IconPlayerSkipForwardFilled size={18} />
              </ActionIcon>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
