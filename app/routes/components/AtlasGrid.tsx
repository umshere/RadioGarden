import { Link, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { Text, Title, Badge, ThemeIcon, ActionIcon, Tooltip, Loader } from "@mantine/core";
import {
  IconBroadcast,
  IconMapPin,
  IconGlobe,
  IconCompass,
  IconHeadphones,
  IconWorld,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Country } from "~/types/radio";

type AtlasGridProps = {
  displaySections: Array<[string, Country[]]>;
  onPreviewCountry?: (countryName: string) => void;
};

const continentIcons: Record<string, JSX.Element> = {
  "North America": <IconGlobe size={20} />,
  "South America": <IconGlobe size={20} />,
  Europe: <IconCompass size={20} />,
  Asia: <IconMapPin size={20} />,
  Africa: <IconGlobe size={20} />,
  Oceania: <IconHeadphones size={20} />,
  Other: <IconWorld size={20} />,
};

export function AtlasGrid({ displaySections, onPreviewCountry }: AtlasGridProps) {
  const navigation = useNavigation();
  const pendingSearch = navigation.location?.search ?? "";
  const pendingCountry = (() => {
    try {
      const url = new URL(pendingSearch, "https://example.com");
      return url.searchParams.get("country");
    } catch {
      return null;
    }
  })();

  if (displaySections.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <Text size="md" c="rgba(244,237,224,0.65)">
          No countries match your search. Try a different name or clear the filters to see all regions.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displaySections.map(([continent, continentCountries]) => {
        const total = continentCountries.reduce(
          (sum, country) => sum + country.stationcount,
          0
        );

        return (
          <motion.section
            key={continent}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(8,22,42,0.85)] to-[rgba(4,16,32,0.85)] p-4 backdrop-blur-md md:p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-2.5">
                <ThemeIcon
                  size={40}
                  radius="lg"
                  style={{
                    background:
                      "linear-gradient(140deg, rgba(18,29,52,0.9) 0%, rgba(10,18,36,0.9) 100%)",
                    border: "1px solid rgba(199,158,73,0.35)",
                    color: "#fefae0",
                  }}
                >
                  {continentIcons[continent] ?? <IconWorld size={20} />}
                </ThemeIcon>
                <div>
                  <Title order={3} style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                    {continent}
                  </Title>
                  <Text size="xs" c="rgba(226,232,240,0.6)">
                    {continentCountries.length} countries • {total.toLocaleString()} stations
                  </Text>
                </div>
              </div>
              <Badge
                radius="xl"
                size="md"
                leftSection={<IconBroadcast size={14} />}
                style={{
                  background: "rgba(199,158,73,0.2)",
                  border: "1px solid rgba(199,158,73,0.45)",
                  color: "#fefae0",
                }}
              >
                {total.toLocaleString()} tuned-in listeners
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continentCountries.map((country, index) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -6 }}
                >
                  <Link
                    to={`/?country=${encodeURIComponent(country.name)}`}
                    className="country-card"
                    prefetch="intent"
                  >
                    {/* Preview play button (mobile/tablet only) */}
                    {onPreviewCountry && (
                      <div className="absolute right-3 top-3 z-[2] md:hidden">
                        <Tooltip label={`Preview top station in ${country.name}`} withArrow>
                          <ActionIcon
                            radius="xl"
                            size="lg"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onPreviewCountry(country.name);
                            }}
                            style={{
                              background: "rgba(15,23,42,0.9)",
                              border: "1px solid rgba(148,163,184,0.4)",
                              color: "rgba(248,250,252,0.95)",
                              boxShadow: "0 4px 12px -4px rgba(1,10,22,0.8)",
                              backdropFilter: "blur(4px)",
                            }}
                            aria-label={`Preview ${country.name}`}
                          >
                            <IconPlayerPlayFilled size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </div>
                    )}
                      <span className="country-card__stamp" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CountryFlag
                            iso={country.iso_3166_1}
                            title={`${country.name} flag`}
                            size={44}
                          />
                          <div>
                            <Text fw={600} size="sm" c="#f8fafc">
                              {country.name}
                            </Text>
                            <Text size="xs" c="rgba(226,232,240,0.55)" className="text-[0.7rem]">
                              Passport stamp ready
                            </Text>
                          </div>
                        </div>
                        <Badge
                          radius="xl"
                          size="sm"
                          leftSection={<IconBroadcast size={12} />}
                          style={{
                            background: "rgba(199,158,73,0.14)",
                            border: "1px solid rgba(199,158,73,0.45)",
                            color: "#fefae0",
                          }}
                        >
                          {country.stationcount.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wide text-slate-300/60">
                        <span className="inline-flex items-center gap-1">
                          <IconMapPin size={14} /> Visit detail
                        </span>
                        <span>Open atlas</span>
                      </div>
                    {/* Pending overlay when navigating to this country */}
                    {navigation.state !== "idle" && pendingCountry === country.name && (
                      <div
                        className="absolute inset-0 z-[1] grid place-items-center"
                        style={{
                          background: "rgba(2,10,20,0.45)",
                          backdropFilter: "blur(2px)",
                        }}
                        aria-hidden="true"
                      >
                        <Loader size="sm" color="yellow" />
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
