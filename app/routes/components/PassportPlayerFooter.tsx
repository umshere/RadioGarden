import { motion, AnimatePresence } from "framer-motion";
import { useFloatingMusicNotes } from "~/hooks/useFloatingMusicNotes";
import { StationInfo } from "./player/StationInfo";
import { PlaybackControls } from "./player/PlaybackControls";
import { ModeBar } from "./player/ModeBar";
import { Equalizer } from "./player/Equalizer";
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
  onMinimize: () => void;
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
  onMinimize,
}: PassportPlayerFooterProps) {
  if (!nowPlaying) return null;

  const floatingNotes = useFloatingMusicNotes(8);

  return (
    <AnimatePresence>
      <motion.footer
        initial={{ y: 160, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 160, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 180 }}
        className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 md:px-4 md:pb-4"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="glass-veil relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {/* Main Content - Station Info + Controls */}
            <div className="relative z-[1] bg-slate-900/40">
              <div className="flex items-center justify-between gap-4 p-4">
                <StationInfo 
                  station={nowPlaying} 
                  isPlaying={isPlaying} 
                  countryMap={countryMap} 
                />
                
                <PlaybackControls
                  isPlaying={isPlaying}
                  shuffleMode={shuffleMode}
                  canSeekStations={canSeekStations}
                  onPlayPause={onPlayPause}
                  onPlayNext={onPlayNext}
                  onPlayPrevious={onPlayPrevious}
                  onShuffleToggle={onShuffleToggle}
                  onMinimize={onMinimize}
                  onDismiss={onDismiss}
                />
              </div>
            </div>
            
            <ModeBar
              listeningMode={listeningMode}
              onQuickRetune={onQuickRetune}
              onBackToWorld={onBackToWorld}
            />

            {/* Compact Equalizer with Music Notes */}
            <Equalizer 
              isPlaying={isPlaying} 
              audioLevel={audioLevel} 
              barCount={50}
              musicNotes={floatingNotes}
            />
          </div>
        </div>
      </motion.footer>
    </AnimatePresence>
  );
}
