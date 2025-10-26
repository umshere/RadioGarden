import { motion } from "framer-motion";
import type { FloatingNote } from "~/hooks/useFloatingMusicNotes";

type MusicNotesAnimationProps = {
  notes: FloatingNote[];
};

export function MusicNotesAnimation({ notes }: MusicNotesAnimationProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 z-[100]">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          className="absolute text-2xl"
          style={{
            left: `${note.startX}%`,
            bottom: 0,
          }}
          initial={{ 
            y: 0,
            rotate: 0,
            scale: 0.3,
            opacity: 0,
          }}
          animate={{
            y: [-0, -100, -250],
            x: [0, (note.endX - note.startX) * 2, (note.endX - note.startX) * 4],
            rotate: [0, note.rotation / 2, note.rotation],
            scale: [0.3, 1, 0.5],
            opacity: [0, 0.7, 0.5, 0],
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          <span style={{
            color: '#C79E49',
            textShadow: '0 0 10px rgba(199,158,73,0.8)',
            filter: 'drop-shadow(0 0 6px rgba(199,158,73,0.6))',
            display: 'block',
          }}>
            {note.note}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
