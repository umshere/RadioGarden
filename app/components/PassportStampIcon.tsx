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
  // Use a stable gradient ID - either provided or a simple static one
  const gradientId = id ? `passport-glow-${id}` : "passport-glow-default";

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
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 18px 32px rgba(1,26,55,0.36))" }}
      {...motionProps}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="48%">
          <stop offset="0%" stopColor={BRAND.teal} stopOpacity="0.92" />
          <stop offset="55%" stopColor={BRAND.ocean} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#031A33" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="50"
        fill={`url(#${gradientId})`}
        stroke={BRAND.beige}
        strokeWidth="3.2"
        strokeDasharray="7 5"
      />
      <circle
        cx="60"
        cy="60"
        r="38"
        fill="none"
        stroke={BRAND.stamp}
        strokeWidth="2.4"
        strokeDasharray="4 6"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M28 60c8.1-11.6 17.7-17.4 32-17.4 14.3 0 23.9 5.8 32 17.4-8.1 11.6-17.7 17.4-32 17.4-14.3 0-24-5.8-32-17.4z"
        stroke={BRAND.beige}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M34 46.3c7.2 4.6 15.5 7 26 7s18.8-2.4 26-7M34 73.7c7.2-4.6 15.5-7 26-7s18.8 2.4 26 7"
        stroke={BRAND.teal}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx="60" cy="60" r="8" fill={BRAND.stamp} />
    </motion.svg>
  );
}
