import { motion } from "framer-motion";
import { IconWorld, IconMapPin } from "@tabler/icons-react";
import type { ListeningMode } from "~/types/radio";

type ListeningModeToggleProps = {
  listeningMode: ListeningMode;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
};

export function ListeningModeToggle({
  listeningMode,
  onToggle,
  size = "md",
  className = "",
}: ListeningModeToggleProps) {
  const isWorldMode = listeningMode === "world";
  const iconSize = size === "sm" ? 14 : 16;
  const padding = size === "sm" ? "px-3 py-1.5" : "px-4 py-2";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={`group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 ${padding} backdrop-blur transition-all hover:border-white/20 hover:bg-white/10 ${className}`}
      whileTap={{ scale: 0.96 }}
      title={`Switch to ${isWorldMode ? "Local" : "World"} mode`}
      aria-label={`Currently in ${isWorldMode ? "World" : "Local"} mode. Click to switch to ${isWorldMode ? "Local" : "World"} mode.`}
      aria-pressed={isWorldMode}
    >
      <motion.div
        className="flex items-center gap-1.5"
        initial={false}
        animate={{ opacity: 1 }}
      >
        {isWorldMode ? (
          <IconWorld size={iconSize} className="text-yellow-400" />
        ) : (
          <IconMapPin size={iconSize} className="text-blue-400" />
        )}
        <span className={`${textSize} font-semibold uppercase tracking-wider text-slate-200`}>
          {isWorldMode ? "World" : "Local"}
        </span>
      </motion.div>
    </motion.button>
  );
}
