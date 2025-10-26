import { motion } from "framer-motion";
import { MusicNotesAnimation } from "./MusicNotesAnimation";
import type { FloatingNote } from "~/hooks/useFloatingMusicNotes";

type EqualizerProps = {
  isPlaying: boolean;
  audioLevel: number;
  barCount?: number;
  musicNotes?: FloatingNote[];
};

export function Equalizer({ isPlaying, audioLevel, barCount = 50, musicNotes }: EqualizerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex h-6 items-end justify-center gap-[1.5px] border-t border-white/5 bg-black/10 px-4 overflow-visible"
    >
      {musicNotes && <MusicNotesAnimation notes={musicNotes} />}
      
      {Array.from({ length: barCount }).map((_, index) => {
        const idleHeight = 20 + Math.random() * 10;
        const idleHeights = [`${idleHeight}%`, `${idleHeight + 8}%`, `${idleHeight}%`];
        const activeHeights = [
          `${25 + Math.random() * 35}%`,
          `${40 + Math.random() * 45}%`,
          `${25 + Math.random() * 35}%`,
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
  );
}
