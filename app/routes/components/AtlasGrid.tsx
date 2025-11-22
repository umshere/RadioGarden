import { Link, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { Text, Title, Badge, ThemeIcon, ActionIcon, Tooltip, Loader, Button } from "@mantine/core";
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
      <div className="rounded-3xl border border-slate-200/30 bg-[#e0e5ec] p-12 text-center shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]">
        <Text size="md" c="dimmed">
          No countries match your search. Try a different name or clear the filters to see all regions.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-slate-200/30 bg-[#e0e5ec] p-5 shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] md:p-6"
          >
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <ThemeIcon
                  size={44}
                  radius="lg"
                  style={{
                    background: "#e0e5ec",
                    border: "none",
                    color: "#64748b",
                    boxShadow: "2px 2px 4px #b8b9be, -2px -2px 4px #ffffff",
                  }}
                >
                  {continentIcons[continent] ?? <IconWorld size={22} />}
                </ThemeIcon>
                <div>
                  <Title order={3} style={{ fontSize: "1.35rem", fontWeight: 700, color: "#334155" }}>
                    {continent}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {continentCountries.length} countries • {total.toLocaleString()} stations
                  </Text>
                </div>
              </div>
              <Badge
                radius="xl"
                size="md"
                variant="light"
                color="gray"
                leftSection={<IconBroadcast size={14} />}
                className="bg-[#e0e5ec] text-slate-600 border-0 shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
              >
                {total.toLocaleString()} tuned-in listeners
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {continentCountries.map((country, index) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to={`/?country=${encodeURIComponent(country.name)}`}
                    className="group flex flex-col h-full relative overflow-hidden rounded-2xl border border-slate-200/30 bg-[#e0e5ec] p-4 shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] transition-all hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]"
                    prefetch="intent"
                  >
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <CountryFlag
                          iso={country.iso_3166_1}
                          title={`${country.name} flag`}
                          size={32}
                          className="rounded-md shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] border border-slate-200/20"
                        />
                        <Badge
                          radius="xl"
                          size="xs"
                          variant="light"
                          color="gray"
                          className="px-1.5 h-5 font-mono bg-[#e0e5ec] shadow-[inset_1px_1px_2px_#b8b9be,inset_-1px_-1px_2px_#ffffff]"
                        >
                          {country.stationcount}
                        </Badge>
                      </div>

                      <div>
                        <Text fw={700} size="sm" c="slate.9" className="leading-tight line-clamp-2 mb-0.5">
                          {country.name}
                        </Text>
                        <Text size="xs" c="dimmed" className="text-[10px] font-medium">
                          Passport ready
                        </Text>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-300/30">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                          Explore
                        </span>
                        {onPreviewCountry && (
                          <ActionIcon
                            size="sm"
                            radius="xl"
                            variant="subtle"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onPreviewCountry(country.name);
                            }}
                            className="text-slate-500 hover:text-slate-700 bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
                            aria-label={`Preview ${country.name}`}
                          >
                            <IconPlayerPlayFilled size={12} />
                          </ActionIcon>
                        )}
                      </div>
                    </div>

                    {/* Pending overlay when navigating to this country */}
                    {navigation.state !== "idle" && pendingCountry === country.name && (
                      <div
                        className="absolute inset-0 z-[1] grid place-items-center bg-[#e0e5ec]/80 backdrop-blur-[1px]"
                        aria-hidden="true"
                      >
                        <Loader size="sm" color="dark" />
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
