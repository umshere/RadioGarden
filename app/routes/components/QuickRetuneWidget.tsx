import { motion, AnimatePresence } from "framer-motion";
import { Text, Button, ActionIcon, Input, Tooltip } from "@mantine/core";
import { IconMapPin, IconX, IconArrowsShuffle } from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Country } from "~/types/radio";

type QuickRetuneWidgetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  continents: string[];
  activeContinent: string | null;
  onContinentSelect: (continent: string | null) => void;
  countriesByContinent: Record<string, Country[]>;
  topCountries: Country[];
  onCountrySelect: (countryName: string) => void;
  onSurprise: () => void;
};

export function QuickRetuneWidget({
  isOpen,
  onOpenChange,
  continents,
  activeContinent,
  onContinentSelect,
  countriesByContinent,
  topCountries,
  onCountrySelect,
  onSurprise,
}: QuickRetuneWidgetProps) {
  const previewCountries = activeContinent
    ? (countriesByContinent[activeContinent] ?? []).slice(0, 6)
    : topCountries.slice(0, 6);

  return (
    <div className="quick-retune-container">
      <Tooltip label={isOpen ? "Close country picker" : "Open country picker"} position="top" withArrow>
        <motion.button
          type="button"
          className={`quick-retune-trigger ${isOpen ? "quick-retune-trigger--active" : ""}`}
          onClick={() => onOpenChange(!isOpen)}
          whileTap={{ scale: 0.96 }}
          aria-haspopup="dialog"
          aria-controls="quick-retune-panel"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close country picker" : "Open country picker"}
          title={isOpen ? "Close country picker" : "Open country picker"}
          style={{ visibility: isOpen ? "hidden" : "visible" }}
        >
          <IconMapPin size={18} />
        </motion.button>
      </Tooltip>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="quick-retune-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => onOpenChange(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2,10,20,0.6)",
                backdropFilter: "blur(2px)",
                zIndex: 49,
              }}
            />
            {/* Panel */}
            <motion.div
              key="quick-retune-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-retune-title"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="quick-retune-panel"
              id="quick-retune-panel"
              style={{ position: "fixed", right: 16, bottom: 84, zIndex: 50 }}
              onKeyDown={(e) => {
                if (e.key === "Escape") onOpenChange(false);
              }}
            >
          <div className="quick-retune-panel__header">
            <Text id="quick-retune-title" size="sm" fw={600} c="#f8fafc">
              Quick retune
            </Text>
            <Tooltip label="Close" position="left" withArrow>
              <ActionIcon
                size="sm"
                radius="xl"
                variant="subtle"
                onClick={() => onOpenChange(false)}
                style={{ color: "rgba(226,232,240,0.7)" }}
                aria-label="Close country picker"
              >
                <IconX size={14} />
              </ActionIcon>
            </Tooltip>
          </div>
          <div className="quick-retune-panel__row">
            {continents.map((continent) => {
              const isActive = activeContinent === continent;
              return (
                <button
                  key={continent}
                  type="button"
                  className={`quick-retune-chip ${
                    isActive ? "quick-retune-chip--active" : ""
                  }`}
                  onClick={() => onContinentSelect(isActive ? null : continent)}
                  aria-pressed={isActive}
                  aria-label={`${isActive ? "Disable" : "Enable"} ${continent} filter`}
                >
                  {continent}
                </button>
              );
            })}
          </div>
          <div className="quick-retune-panel__countries">
            {previewCountries.length === 0 ? (
              <Text size="xs" c="rgba(226,232,240,0.6)">
                No spotlight countries available.
              </Text>
            ) : (
              previewCountries.map((country) => (
                <button
                  key={country.name}
                  type="button"
                  className="quick-retune-country"
                  onClick={() => {
                    onOpenChange(false);
                    onCountrySelect(country.name);
                  }}
                  aria-label={`Retune to ${country.name}`}
                >
                  <div className="quick-retune-country__info">
                    <CountryFlag
                      iso={country.iso_3166_1}
                      title={`${country.name} flag`}
                      size={22}
                    />
                    <span>{country.name}</span>
                  </div>
                  <span className="quick-retune-country__meta">
                    {country.stationcount.toLocaleString()} stations
                  </span>
                </button>
              ))
            )}
          </div>
          <Tooltip label="Pick a random station" position="top" withArrow>
            <Button
              radius="xl"
              size="xs"
              variant="light"
              leftSection={<IconArrowsShuffle size={14} />}
              onClick={() => {
                onOpenChange(false);
                onSurprise();
              }}
              style={{
                width: "100%",
                color: "#0f172a",
                background: "rgba(254,250,226,0.9)",
                border: "1px solid rgba(148,163,184,0.25)",
                fontWeight: 600,
              }}
              aria-label="Surprise me with a random station"
            >
              Surprise me
            </Button>
          </Tooltip>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
  );
}
