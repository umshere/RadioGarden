import { useMemo } from "react";
import { ActionIcon, Text } from "@mantine/core";
import {
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
    IconPlayerSkipBackFilled,
    IconPlayerSkipForwardFilled,
} from "@tabler/icons-react";
import type { Station } from "~/types/radio";

interface CompactRetroTunerProps {
    station: Station;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function CompactRetroTuner({
    station,
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
}: CompactRetroTunerProps) {
    // Generate a consistent "frequency" based on station UUID
    const frequency = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < station.uuid.length; i++) {
            hash = station.uuid.charCodeAt(i) + ((hash << 5) - hash);
        }
        const range = 108.0 - 88.0;
        const normalized = Math.abs(hash % 1000) / 1000;
        return (88.0 + normalized * range).toFixed(1);
    }, [station.uuid]);

    const freqNum = parseFloat(frequency);
    const tickStart = Math.floor(freqNum) - 2;
    const ticks = Array.from({ length: 25 }, (_, i) => tickStart + i * 0.2);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white/50 p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
                {/* Left: Frequency Display */}
                <div className="flex flex-col items-center md:items-start">
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" className="mb-2">
                        Now Playing
                    </Text>
                    <h2 className="font-mono text-6xl font-bold tracking-tighter text-slate-900 md:text-7xl">
                        {frequency}
                    </h2>
                    <Text size="sm" c="dimmed" fw={500} className="mt-1">
                        MHz
                    </Text>
                </div>

                {/* Center: Tuner Scale */}
                <div className="flex-1">
                    <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
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
                                            className={`w-px bg-slate-400 ${isMajor ? "h-6" : "h-3"
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
                    <div className="mt-4 text-center">
                        <Text fw={700} size="lg" c="slate.9" lineClamp={1}>
                            {station.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                            {[station.country, station.state].filter(Boolean).join(" • ")}
                        </Text>
                    </div>
                </div>

                {/* Right: Transport Controls */}
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
        </div>
    );
}
