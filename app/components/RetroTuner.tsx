import { useMemo } from "react";
import { ActionIcon, Text } from "@mantine/core";
import {
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
    IconPlayerSkipBackFilled,
    IconPlayerSkipForwardFilled,
    IconChevronDown,
    IconHeart,
    IconShare,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Station } from "~/types/radio";

interface RetroTunerProps {
    station: Station;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

export default function RetroTuner({
    station,
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
    onClose,
}: RetroTunerProps) {
    // Generate a consistent "frequency" based on station UUID if not real
    const frequency = useMemo(() => {
        // Simple hash to get a number between 88.0 and 108.0
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
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#e0e5ec] text-slate-800"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6">
                <ActionIcon
                    variant="transparent"
                    color="dark"
                    onClick={onClose}
                    className="opacity-60 hover:opacity-100"
                >
                    <IconChevronDown size={28} />
                </ActionIcon>
                {/* AM/FM Removed as requested */}
            </div>

            {/* Main Tuner Area */}
            <div className="flex flex-1 flex-col items-center justify-center gap-8 md:gap-12">
                {/* 1. Giant Frequency Number */}
                <div className="flex flex-col items-center">
                    <h1 className="font-mono text-7xl md:text-8xl font-bold tracking-tighter text-slate-900">
                        {frequency}
                    </h1>
                    <p className="mt-2 text-sm font-medium uppercase tracking-widest text-slate-500">
                        {station.name}
                    </p>
                </div>

                {/* 2. Radio Tuner Scale & 3. Needle */}
                <div className="relative w-full max-w-md px-4 md:px-8">
                    {/* Glass Container */}
                    <div className="relative h-28 md:h-32 w-full overflow-hidden rounded-2xl bg-slate-200/50 shadow-inner backdrop-blur-sm">
                        {/* Scale Ticks */}
                        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-6 md:px-8">
                            {ticks.map((tick, i) => {
                                const isMajor = i % 5 === 0;
                                return (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center gap-2"
                                        style={{ opacity: Math.abs(tick - freqNum) < 1.5 ? 1 : 0.3 }}
                                    >
                                        <div
                                            className={`w-px bg-slate-400 ${isMajor ? "h-6 md:h-8" : "h-3 md:h-4"
                                                }`}
                                        />
                                        {isMajor && (
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500">
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
                            {/* Triangle/Marker */}
                            <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-red-500" />
                        </div>
                    </div>

                    {/* Side Actions */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 md:left-2">
                        <ActionIcon variant="transparent" color="red">
                            <IconHeart size={20} />
                        </ActionIcon>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 md:right-2">
                        <ActionIcon variant="transparent" color="gray">
                            <IconShare size={20} />
                        </ActionIcon>
                    </div>
                </div>
            </div>

            {/* 5. Button Row (Transport) */}
            <div className="mb-12 flex items-center justify-center gap-6 md:gap-8 px-4 md:px-8">
                <button
                    onClick={onPrev}
                    className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-[#e0e5ec] text-slate-500 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] active:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]"
                >
                    <IconPlayerSkipBackFilled size={20} />
                </button>

                <button
                    onClick={onPlayPause}
                    className="flex h-20 w-28 md:h-24 md:w-32 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform"
                >
                    {isPlaying ? (
                        <IconPlayerPauseFilled size={28} />
                    ) : (
                        <IconPlayerPlayFilled size={28} />
                    )}
                    <span className="ml-2 text-xs md:text-sm font-bold uppercase tracking-widest">
                        {isPlaying ? "Pause" : "Play"}
                    </span>
                </button>

                <button
                    onClick={onNext}
                    className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-[#e0e5ec] text-slate-500 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] active:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]"
                >
                    <IconPlayerSkipForwardFilled size={20} />
                </button>
            </div>

            {/* Footer Info */}
            <div className="pb-8 text-center">
                <p className="text-lg font-bold text-slate-800">
                    {station.name}
                </p>
                <p className="text-sm text-slate-500">
                    {[station.country, station.state].filter(Boolean).join(" • ")}
                </p>
            </div>
        </motion.div>
    );
}
