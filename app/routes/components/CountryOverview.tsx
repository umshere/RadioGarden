import { motion } from "framer-motion";
import { Button, Badge, Title, Text } from "@mantine/core";
import { IconArrowLeft, IconBroadcast, IconMapPin } from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Country } from "~/types/radio";

type CountryOverviewProps = {
  selectedCountry: string;
  selectedCountryMeta: Country | null;
  stationCount: number;
  onBack: () => void;
  showQueue?: boolean;
  onToggleQueue?: () => void;
};

export function CountryOverview({
  selectedCountry,
  selectedCountryMeta,
  stationCount,
  onBack,
  showQueue,
  onToggleQueue,
}: CountryOverviewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hero-surface px-6 py-8 md:px-10 md:py-10"
    >
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="subtle"
            radius="xl"
            leftSection={<IconArrowLeft size={18} />}
            onClick={onBack}
            style={{
              color: "#fefae0",
            }}
          >
            Back to world view
          </Button>
          <div className="flex items-center gap-3">
            <Badge
              radius="xl"
              size="lg"
              leftSection={<IconBroadcast size={16} />}
              style={{
                background: "rgba(199,158,73,0.2)",
                border: "1px solid rgba(199,158,73,0.45)",
                color: "#fefae0",
              }}
            >
              {stationCount.toLocaleString()} stations catalogued
            </Badge>
            {typeof onToggleQueue === "function" && (
              <Button
                radius="xl"
                variant="light"
                onClick={onToggleQueue}
                aria-pressed={!!showQueue}
                style={{
                  background: showQueue
                    ? "rgba(199,158,73,0.22)"
                    : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(148,163,184,0.25)",
                  color: "#fefae0",
                }}
              >
                {showQueue ? "Hide queue" : "Show queue"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <CountryFlag
              iso={selectedCountryMeta?.iso_3166_1}
              title={`${selectedCountry} flag`}
              size={64}
            />
            <div>
              <Title order={1} style={{ fontSize: "2.25rem", fontWeight: 700 }}>
                {selectedCountry}
              </Title>
              <Text size="sm" c="rgba(226,232,240,0.7)">
                Explore this nation's airwaves and discover local voices in real time.
              </Text>
            </div>
          </div>

          {selectedCountryMeta && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200/80">
              <div className="flex items-center gap-2">
                <IconMapPin size={16} />
                Passport code: {selectedCountryMeta.iso_3166_1}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
