import { motion } from "framer-motion";
import { BRAND } from "~/constants/brand";

type PassportStampIconProps = {
  size?: number;
  animated?: boolean;
  id?: string;
};

let idCounter = 0;

export default function PassportStampIcon({
  size = 72,
  animated = true,
  id,
}: PassportStampIconProps) {
  const motionProps = animated
    ? {
        animate: { rotate: [-3, 3, -3], scale: [0.97, 1, 0.97] },
        transition: {
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror" as const,
          ease: [0.42, 0, 0.58, 1] as const,
        },
      }
    : {};

  return (
    <motion.img
      src="/icon.png"
      width={size}
      height={size}
      alt="Radio Passport"
      style={{ filter: "drop-shadow(0 4px 12px rgba(199,158,73,0.3))" }}
      {...motionProps}
    />
  );
}
