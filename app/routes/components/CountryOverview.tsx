import { motion } from "framer-motion";
import { Button, Badge, Title, Text, ActionIcon } from "@mantine/core";
import {
  IconArrowLeft,
  IconBroadcast,
  IconMapPin,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Country, Station } from "~/types/radio";
import { useMemo } from "react";

type CountryOverviewProps = {
  selectedCountry: string;
  selectedCountryMeta: Country | null;
  stationCount: number;
  onBack: () => void;
  nowPlaying?: Station | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export function CountryOverview({
  selectedCountry,
  selectedCountryMeta,
  stationCount,
  onBack,
  nowPlaying,
  isPlaying = false,
  onPlayPause,
  onNext,
  onPrev,
}: CountryOverviewProps) {
  // Generate frequency for now playing station
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

  const freqNum = parseFloat(frequency);
  const tickStart = Math.floor(freqNum) - 2;
  const ticks = Array.from({ length: 25 }, (_, i) => tickStart + i * 0.2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-slate-200 bg-white/50 px-6 py-8 shadow-sm md:px-10 md:py-10"
    >
      <div className="relative z-10 space-y-6">
        {/* Top Row: Back Button & Badges */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Button
            variant="subtle"
            radius="xl"
            leftSection={<IconArrowLeft size={18} />}
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            Back to world view
          </Button>
          <div className="flex items-center gap-3">
            <Badge
              radius="xl"
              size="lg"
              leftSection={<IconBroadcast size={16} />}
              className="bg-slate-100 text-slate-600 border border-slate-200"
            >
              {stationCount.toLocaleString()} stations catalogued
            </Badge>
          </div>
        </div>

        {/* Country Info & Now Playing Combined */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Country Info */}
          <div className="flex items-center gap-4">
            <CountryFlag
              iso={selectedCountryMeta?.iso_3166_1}
              title={`${selectedCountry} flag`}
              size={64}
              className="rounded-xl shadow-sm border border-slate-100"
            />
            <div>
              <Title order={1} className="text-3xl md:text-4xl font-bold text-slate-900">
                {selectedCountry}
              </Title>
              <Text size="sm" c="dimmed">
                Explore this nation's airwaves and discover local voices in real time.
              </Text>
            </div>
          </div>

          {/* Right: Passport Code or Now Playing */}
          {nowPlaying ? (
            <div className="flex flex-col items-center gap-4 lg:items-end">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Now Playing
              </Text>
              <div className="text-center lg:text-right">
                <h2 className="font-mono text-5xl font-bold tracking-tighter text-slate-900 lg:text-6xl">
                  {frequency}
                </h2>
                <Text size="sm" c="dimmed" fw={500}>
                  MHz
                </Text>
              </div>
            </div>
          ) : (
            selectedCountryMeta && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
                <div className="flex items-center gap-2">
                  <IconMapPin size={16} />
                  Passport code: {selectedCountryMeta.iso_3166_1}
                </div>
              </div>
            )
          )}
        </div>

        {/* Tuner Scale & Controls (only when playing) */}
        {nowPlaying && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            {/* Tuner Scale */}
            <div className="flex-1">
              <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
                {/* Scale Ticks */}
                <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-6">
                  {ticks.map((tick, i) => {
                    const isMajor = i % 5 === 0;
                    const isNearCurrent = Math.abs(tick - freqNum) < 1.5;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2"
                        style={{ opacity: isNearCurrent ? 1 : 0.3 }}
                      >
                        <div
                          className={`w-px bg-slate-400 ${isMajor ? "h-5" : "h-3"
                            }`}
                        />
                        {isMajor && (
                          <span className="text-[9px] font-bold text-slate-500">
                            {Math.floor(tick)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Red Needle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                  <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-red-500" />
                </div>
              </div>

              {/* Station Info */}
              <div className="mt-3 text-center md:text-left">
                <Text fw={700} size="md" c="slate.9" lineClamp={1}>
                  {nowPlaying.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {[nowPlaying.country, nowPlaying.state].filter(Boolean).join(" • ")}
                </Text>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-center gap-3">
              <ActionIcon
                size="lg"
                radius="xl"
                variant="light"
                color="gray"
                onClick={onPrev}
                className="bg-slate-100 hover:bg-slate-200"
              >
                <IconPlayerSkipBackFilled size={20} />
              </ActionIcon>

              <ActionIcon
                size="xl"
                radius="xl"
                onClick={onPlayPause}
                className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
              >
                {isPlaying ? (
                  <IconPlayerPauseFilled size={24} />
                ) : (
                  <IconPlayerPlayFilled size={24} />
                )}
              </ActionIcon>

              <ActionIcon
                size="lg"
                radius="xl"
                variant="light"
                color="gray"
                onClick={onNext}
                className="bg-slate-100 hover:bg-slate-200"
              >
                <IconPlayerSkipForwardFilled size={20} />
              </ActionIcon>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
