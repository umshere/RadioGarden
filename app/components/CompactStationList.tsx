import { motion } from "framer-motion";
import { IconPlayerPlayFilled, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import type { Station } from "~/types/radio";

interface CompactStationCardProps {
    station: Station;
    isPlaying: boolean;
    isFavorite?: boolean;
    onPlay: (station: Station) => void;
    onToggleFavorite?: (station: Station) => void;
    index: number;
}

export function CompactStationCard({
    station,
    isPlaying,
    isFavorite = false,
    onPlay,
    onToggleFavorite,
    index,
}: CompactStationCardProps) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            onClick={() => onPlay(station)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${isPlaying
                ? "bg-[#e0e5ec] text-slate-700 border-slate-300/30 shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]"
                : "bg-[#e0e5ec] text-slate-700 border-slate-300/30 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]"
                }`}
        >
            {/* Artwork/Icon */}
            <div className={`h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 ${isPlaying ? "bg-slate-200/50 shadow-inner" : "bg-slate-200/50"
                }`}>
                {station.favicon ? (
                    <img src={station.favicon} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center font-bold text-xs ${isPlaying ? "text-slate-400" : "text-slate-400"
                        }`}>
                        FM
                    </div>
                )}
            </div>

            {/* Station Info */}
            <div className="flex-1 min-w-0 text-left">
                <div className={`text-sm font-bold truncate leading-tight ${isPlaying ? "text-slate-900" : "text-slate-900"
                    }`}>
                    {station.name}
                </div>
                <div className={`text-xs truncate leading-tight mt-0.5 ${isPlaying ? "text-slate-500" : "text-slate-500"
                    }`}>
                    {[station.country, station.state].filter(Boolean).join(" • ")}
                </div>
                {/* Tags/Bitrate */}
                <div className="flex gap-1.5 mt-1">
                    {station.bitrate > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isPlaying
                            ? "bg-slate-300/50 text-slate-500"
                            : "bg-slate-300/50 text-slate-500"
                            }`}>
                            {station.bitrate}kbps
                        </span>
                    )}
                    {station.language && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold truncate max-w-20 ${isPlaying
                            ? "bg-slate-300/50 text-slate-500"
                            : "bg-slate-300/50 text-slate-500"
                            }`}>
                            {station.language}
                        </span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {onToggleFavorite && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(station);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${isPlaying
                            ? "bg-white/10 text-white/80 hover:bg-white/20"
                            : "bg-[#e0e5ec] text-slate-400 shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
                            }`}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isFavorite ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
                    </button>
                )}

                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isPlaying
                    ? "bg-slate-900 text-white shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
                    : "bg-slate-900 text-white shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]"
                    }`}>
                    <IconPlayerPlayFilled size={14} />
                </div>
            </div>
        </motion.button>
    );
}

interface CompactStationListProps {
    stations: Station[];
    nowPlayingId?: string | null;
    favoriteIds?: Set<string>;
    onPlayStation: (station: Station) => void;
    onToggleFavorite?: (station: Station) => void;
}

export function CompactStationList({
    stations,
    nowPlayingId,
    favoriteIds = new Set(),
    onPlayStation,
    onToggleFavorite,
}: CompactStationListProps) {
    if (stations.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-slate-400 text-sm">No stations available</div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {stations.map((station, index) => (
                <CompactStationCard
                    key={station.uuid}
                    station={station}
                    isPlaying={station.uuid === nowPlayingId}
                    isFavorite={favoriteIds.has(station.uuid)}
                    onPlay={onPlayStation}
                    onToggleFavorite={onToggleFavorite}
                    index={index}
                />
            ))}
        </div>
    );
}
