import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { FloatingNote } from "~/hooks/useFloatingMusicNotes";

type MusicNotesAnimationProps = {
  notes: FloatingNote[];
  isPlaying?: boolean;
};

export function MusicNotesAnimation({ notes, isPlaying = false }: MusicNotesAnimationProps) {
  const [breeze, setBreeze] = useState(true);

  useEffect(() => {
    // Trigger breeze burst on mount (station change)
    setBreeze(true);
    const timer = setTimeout(() => setBreeze(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 z-0">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          className="absolute text-2xl"
          style={{
            left: 0,
            bottom: `${note.startY}%`,
          }}
          initial={{ 
            x: '0vw',
            y: 0,
            rotate: 0,
            scale: 0.3,
            opacity: 0,
          }}
          animate={breeze ? {
            x: '120vw',
            y: -200,
            rotate: note.rotation * 2,
            scale: [0.5, 1.2, 0],
            opacity: [0.9, 0.7, 0],
          } : isPlaying ? {
            x: ['0vw', '50vw', '100vw'],
            y: [0, -50, -150],
            rotate: [0, note.rotation / 2, note.rotation],
            scale: [0.3, 1, 0.5],
            opacity: [0, 0.7, 0.5, 0],
          } : {
            scale: 0.3,
            opacity: 0,
          }}
          transition={breeze ? {
            duration: 1.5,
            delay: note.delay * 0.1,
            ease: [0.19, 1, 0.22, 1],
          } : {
            x: {
              duration: isPlaying ? note.duration : 2,
              delay: isPlaying ? note.delay : 0,
              repeat: isPlaying ? Infinity : 0,
              ease: isPlaying ? "easeOut" : [0.43, 0.13, 0.23, 0.96],
            },
            y: {
              duration: isPlaying ? note.duration : 2,
              delay: isPlaying ? note.delay : 0,
              repeat: isPlaying ? Infinity : 0,
              ease: isPlaying ? "easeOut" : [0.43, 0.13, 0.23, 0.96],
            },
            rotate: {
              duration: isPlaying ? note.duration : 2,
              delay: isPlaying ? note.delay : 0,
              repeat: isPlaying ? Infinity : 0,
              ease: isPlaying ? "easeOut" : [0.43, 0.13, 0.23, 0.96],
            },
            scale: {
              duration: isPlaying ? note.duration : 1.5,
              ease: [0.34, 1.56, 0.64, 1],
            },
            opacity: {
              duration: isPlaying ? note.duration : 1.5,
              ease: "easeOut",
            },
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
