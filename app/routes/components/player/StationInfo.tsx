import { motion } from "framer-motion";
import { Avatar, Text, Badge } from "@mantine/core";
import { IconDisc } from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Station } from "~/types/radio";

type StationInfoProps = {
  station: Station;
  isPlaying: boolean;
  countryMap: Map<string, { name: string; iso_3166_1: string; stationcount: number }>;
};

export function StationInfo({ station, isPlaying, countryMap }: StationInfoProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="relative flex-shrink-0">
        <motion.span
          className="absolute inset-0 -z-10 rounded-xl"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(199,158,73,0.3) 0%, transparent 70%)",
          }}
          animate={{ opacity: isPlaying ? [0.2, 0.5, 0.2] : 0.15 }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <Avatar
          src={station.favicon || "https://placehold.co/120x120/0f172a/ffffff?text=📻"}
          size={56}
          radius="md"
          style={{
            border: "2px solid rgba(199,158,73,0.5)",
            boxShadow: "0 8px 20px rgba(5,11,25,0.4)",
          }}
        />
      </div>
      
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Badge
            radius="md"
            size="xs"
            leftSection={<IconDisc size={11} />}
            style={{
              background: "rgba(199,158,73,0.18)",
              border: "1px solid rgba(199,158,73,0.4)",
              color: "#fefae0",
              fontSize: "0.7rem",
              padding: "0 6px",
              height: "20px",
            }}
          >
            NOW PLAYING
          </Badge>
        </div>
        <Text fw={600} size="md" c="#f8fafc" lineClamp={1}>
          {station.name}
        </Text>
        <div className="flex items-center gap-2 text-xs text-slate-300/70">
          <CountryFlag
            iso={countryMap.get(station.country)?.iso_3166_1}
            title={`${station.country} flag`}
            size={18}
          />
          <span>{station.country}</span>
          {station.language && (
            <>
              <span>•</span>
              <span>{station.language}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
