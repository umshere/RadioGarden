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
import { neomorphicButtonSmall, neomorphicButtonPrimary } from "~/utils/buttonStyles";

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

  const frequencyPercent = useMemo(() => {
    const freqNum = parseFloat(frequency);
    return ((freqNum - 88.0) / 20.0) * 100;
  }, [frequency]);

  const ticks = useMemo(() => {
    const freqNum = parseFloat(frequency);
    const tickStart = 88;
    const tickEnd = 108;
    const tickCount = 21;
    return Array.from({ length: tickCount }, (_, i) => ({
      value: tickStart + i,
      isNear: Math.abs((tickStart + i) - freqNum) < 2,
    }));
  }, [frequency]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    // Calculate next index with proper wrapping
    const nextIndex = (currentStationIndex + 1) % queue.length;
    const nextStation = queue[nextIndex];

    if (nextStation) {
      // Update the index in the store before starting the station
      startStation(nextStation, { preserveQueue: true });
    }
  }, [queue, currentStationIndex, startStation]);

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;

    // Calculate previous index with proper wrapping
    const prevIndex = (currentStationIndex - 1 + queue.length) % queue.length;
    const prevStation = queue[prevIndex];

    if (prevStation) {
      // Update the index in the store before starting the station
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

      <aside className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden w-full max-w-3xl px-4 lg:block">
        <div
          className="pointer-events-auto rounded-2xl bg-[#e0e5ec] backdrop-blur-xl border border-slate-300/30"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-4 p-4">
            {/* Artwork */}
            <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200/50 flex items-center justify-center bg-slate-100 flex-shrink-0 shadow-inner">
              {nowPlaying.favicon ? (
                <img src={nowPlaying.favicon} alt="artwork" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xl font-mono text-slate-400 font-bold">FM</div>
              )}
            </div>

            {/* Tuner Display Section */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* Station Info Row */}
              <div className="flex items-baseline gap-3">
                <Text size="sm" fw={700} className="truncate text-slate-900">
                  {title}
                </Text>
                <Text size="xs" c="dimmed" className="truncate">
                  {subtitle}
                </Text>
              </div>

              {/* Horizontal Tuner Scale */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "36px",
                  background: "rgba(203,213,225,0.3)",
                  borderRadius: "8px",
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "inset 3px 3px 6px rgba(184,185,190,0.4), inset -3px -3px 6px rgba(255,255,255,0.5)",
                }}
              >
                {/* Tick marks */}
                <div
                  style={{
                    position: "absolute",
                    inset: "0 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {ticks.map((tick, i) => {
                    const isMajor = tick.value % 5 === 0;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "2px",
                          opacity: tick.isNear ? 1 : 0.3,
                          transition: "opacity 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "1.5px",
                            height: isMajor ? "14px" : "8px",
                            background: "#64748b",
                            borderRadius: "999px",
                          }}
                        />
                        {isMajor && (
                          <span
                            style={{
                              fontSize: "0.55rem",
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            {tick.value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Red needle indicator */}
                <div
                  style={{
                    position: "absolute",
                    left: `calc(${frequencyPercent}% + 12px - 2px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "24px",
                    background: "#ef4444",
                    borderRadius: "999px",
                    boxShadow: "0 0 8px rgba(239,68,68,0.6)",
                    zIndex: 10,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `calc(${frequencyPercent}% + 12px - 6px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "12px",
                    height: "12px",
                    background: "#ef4444",
                    borderRadius: "50%",
                    zIndex: 11,
                  }}
                />

                {/* Frequency Display */}
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "monospace",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    zIndex: 12,
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                  }}
                >
                  <span>{frequency}</span>
                  <span style={{ fontSize: "0.65rem", color: "#64748b" }}>MHz</span>
                </div>
              </div>
            </div>

            {/* Transport Controls with Neomorphic Style */}
            <div className="flex items-center gap-2">
              <Tooltip label="Quick Retune" position="top" withArrow>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0e5ec] text-violet-600 shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all hover:text-violet-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleQuickRetune();
                  }}
                  aria-label="Quick Retune"
                >
                  <IconMapPin size={16} />
                </button>
              </Tooltip>

              <Tooltip label="Previous" position="top" withArrow>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0e5ec] text-slate-500 shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all hover:text-slate-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Previous"
                >
                  <IconPlayerSkipBackFilled size={16} />
                </button>
              </Tooltip>

              <Tooltip label={isPlaying ? "Pause" : "Play"} position="top" withArrow>
                <button
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] active:scale-95 transition-transform hover:bg-slate-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <IconPlayerPauseFilled size={20} /> : <IconPlayerPlayFilled size={20} />}
                </button>
              </Tooltip>

              <Tooltip label="Next" position="top" withArrow>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0e5ec] text-slate-500 shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all hover:text-slate-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Next"
                >
                  <IconPlayerSkipForwardFilled size={16} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile mini-player */}
      <div
        className="lg:hidden fixed left-0 right-0 z-40 px-3 transition-all duration-300 ease-out"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 12px)"
        }}
      >
        <div
          data-raptor={raptorMiniEnabled ? "true" : "false"}
          onClick={() => setIsExpanded(true)}
          className={`rounded-2xl bg-[#e0e5ec] border border-slate-300/30 px-3 active:scale-[0.98] transition-transform cursor-pointer ${raptorMiniEnabled ? 'py-2' : 'py-3'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`${raptorMiniEnabled ? 'h-10 w-10' : 'h-12 w-12'} rounded-xl overflow-hidden border border-slate-200/50 flex items-center justify-center bg-slate-100 text-sm flex-shrink-0 text-slate-500 font-bold shadow-inner`}>
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
              {/* Quick Retune */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0e5ec] text-violet-600 shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleQuickRetune();
                }}
                aria-label="Quick Retune"
              >
                <IconMapPin size={16} />
              </button>

              {/* Prev */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0e5ec] text-slate-500 shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous"
              >
                <IconPlayerSkipBackFilled size={16} />
              </button>

              {/* Play/Pause */}
              <button
                className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:scale-95 transition-transform ${isPlaying ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />}
              </button>

              {/* Next */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0e5ec] text-slate-500 shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next"
              >
                <IconPlayerSkipForwardFilled size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Tuner Display */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "28px",
              background: "rgba(203,213,225,0.3)",
              borderRadius: "6px",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              boxShadow: "inset 2px 2px 4px rgba(184,185,190,0.4), inset -2px -2px 4px rgba(255,255,255,0.5)",
            }}
          >
            {/* Simplified tick marks for mobile */}
            <div
              style={{
                position: "absolute",
                inset: "0 8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {ticks.filter((_, i) => i % 5 === 0).map((tick, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    opacity: tick.isNear ? 1 : 0.25,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "1.5px",
                      height: "12px",
                      background: "#64748b",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Red needle indicator */}
            <div
              style={{
                position: "absolute",
                left: `calc(${frequencyPercent}% + 8px - 1.5px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: "2.5px",
                height: "18px",
                background: "#ef4444",
                borderRadius: "999px",
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `calc(${frequencyPercent}% + 8px - 4px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: "8px",
                height: "8px",
                background: "#ef4444",
                borderRadius: "50%",
                zIndex: 11,
              }}
            />

            {/* Frequency Display */}
            <div
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                fontWeight: "bold",
                color: "#0f172a",
                zIndex: 12,
                display: "flex",
                alignItems: "baseline",
                gap: "2px",
              }}
            >
              <span>{frequency}</span>
              <span style={{ fontSize: "0.55rem", color: "#64748b" }}>MHz</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
