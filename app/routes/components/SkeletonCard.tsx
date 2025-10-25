import { motion } from "framer-motion";

export function SkeletonCard() {
  return (
    <div className="station-card opacity-60">
      <div className="flex flex-col gap-4">
        {/* Header skeleton */}
        <div className="flex items-start gap-4">
          <div className="skeleton h-12 w-12 flex-shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>

        {/* Metadata skeleton */}
        <div className="flex items-center gap-4">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>

        {/* Button skeleton */}
        <div className="skeleton h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonCountryStamp() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="country-card opacity-60"
    >
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="skeleton h-16 w-16 rounded-full" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </motion.div>
  );
}

export function SkeletonAtlasGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCountryStamp key={index} />
      ))}
    </div>
  );
}
