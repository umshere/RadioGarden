// TODO: JourneyComposer – stubbed control used on home + world routes
import { useState } from "react";
import { Button, Group, TextInput } from "@mantine/core";
import { IconMicrophone, IconWand } from "@tabler/icons-react";
import type { ReactNode } from "react";

type JourneyComposerProps = {
  value?: string;
  onChange?: (next: string) => void;
  onSubmit?: (payload: { prompt?: string; mood?: string }) => void;
  loading?: boolean;
  placeholder?: string;
  ctaLabel?: string;
  showVoiceButton?: boolean;
  onVoice?: () => void;
  secondarySlot?: ReactNode;
  tone?: "light" | "dark";
};

export default function JourneyComposer({
  value,
  onChange,
  onSubmit,
  loading = false,
  placeholder = "Describe your mood or destination…",
  ctaLabel = "Quick Retune",
  showVoiceButton = false,
  onVoice,
  secondarySlot,
  compact = false,
  hero = false,
  tone = "light",
}: JourneyComposerProps & { compact?: boolean; hero?: boolean }) {
  const [internalPrompt, setInternalPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(!compact);
  const currentValue = value ?? internalPrompt;
  const isDarkTone = tone === "dark";

  const handleChange = (next: string) => {
    if (value === undefined) {
      setInternalPrompt(next);
    }
    onChange?.(next);
  };

  const handleSubmit = () => {
    const trimmed = currentValue.trim();
    onSubmit?.({ prompt: trimmed || undefined });
    if (compact) setIsExpanded(false);
  };

  if (compact && !isExpanded) {
    return (
      <div className="flex justify-end">
        <Button
          variant="subtle"
          color="dark"
          size="xs"
          radius="xl"
          leftSection={<IconWand size={14} />}
          onClick={() => setIsExpanded(true)}
          className={
            isDarkTone
              ? "bg-white/10 hover:bg-white/20 text-slate-100 transition-colors border border-white/15 shadow-[0_15px_40px_rgba(3,7,18,0.6)]"
              : "bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 shadow-sm"
          }
        >
          Refine Mix
        </Button>
      </div>
    );
  }

  if (hero) {
    const heroGlowClass = isDarkTone
      ? "absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-indigo-500/25 to-pink-500/20 rounded-3xl opacity-30 group-hover:opacity-60 blur transition duration-500"
      : "absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500";
    const heroShellClass = isDarkTone
      ? "relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/15 p-2 shadow-[0_35px_120px_rgba(3,7,18,0.85)]"
      : "relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 p-2 shadow-xl";
    const heroPrimaryButtonClass = isDarkTone
      ? "bg-white/90 text-slate-900 hover:bg-white shadow-[0_25px_55px_rgba(3,7,18,0.65)] px-8 h-12 text-base font-semibold border border-white/20"
      : "bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl px-8 h-12 text-base font-semibold";
    const heroVoiceButtonClass = isDarkTone
      ? "h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg"
      : "h-12 px-6 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 shadow-sm";

    return (
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
        <div className="w-full relative group">
          <div className={heroGlowClass} />
          <div className={heroShellClass}>
            <TextInput
              variant="unstyled"
              size="xl"
              radius="xl"
              placeholder={placeholder}
              value={currentValue}
              onChange={(e) => handleChange(e.currentTarget.value)}
              disabled={loading}
              className="w-full"
              classNames={{
                input: `text-center text-2xl md:text-3xl font-light ${
                  isDarkTone ? "text-slate-50 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
                } py-6 px-6 h-auto bg-transparent`,
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              rightSection={
                loading ? (
                  <div className="mr-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  </div>
                ) : null
              }
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Button
            size="lg"
            radius="xl"
            onClick={handleSubmit}
            loading={loading}
            className={heroPrimaryButtonClass}
            rightSection={<IconWand size={18} />}
          >
            {ctaLabel}
          </Button>
          {showVoiceButton && (
            <Button
              variant="light"
              radius="xl"
              size="lg"
              className={heroVoiceButtonClass}
              onClick={onVoice}
            >
              <IconMicrophone size={20} />
            </Button>
          )}
        </div>

        {secondarySlot && <div className="mt-6">{secondarySlot}</div>}
      </div>
    );
  }

  const baseContainerClass = isDarkTone
    ? "rounded-3xl border border-white/10 bg-white/10 p-4 shadow-[0_35px_90px_rgba(3,7,18,0.65)] backdrop-blur-xl"
    : "rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur-md";

  return (
    <div className={baseContainerClass}>
      <div className={`mb-3 flex items-center justify-between text-sm ${isDarkTone ? "text-slate-200" : "text-slate-500"}`}>
        <span className="font-medium">Compose your journey</span>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs uppercase tracking-[0.35em] font-bold ${
              isDarkTone ? "text-slate-300" : "text-slate-400"
            }`}
          >
            AI assistant
          </span>
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className={`transition-colors ${isDarkTone ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
              aria-label="Minimize"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <Group gap="xs" wrap="wrap">
        <TextInput
          aria-label="Describe your mood or destination"
          placeholder={placeholder}
          className="flex-1 min-w-[200px]"
          value={currentValue}
          onChange={(e) => handleChange(e.currentTarget.value)}
          disabled={loading}
          radius="xl"
          size="md"
          styles={{
            input: {
              background: isDarkTone ? "rgba(15,23,42,0.65)" : "#f1f5f9",
              borderColor: isDarkTone ? "rgba(248,250,252,0.2)" : "transparent",
              color: isDarkTone ? "#f8fafc" : "#0f172a",
              fontWeight: 500,
            },
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          leftSection={<IconWand size={16} />}
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
          radius="xl"
          size="md"
          className={
            isDarkTone
              ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold shadow-lg hover:shadow-xl hover:translate-y-[-1px]"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all"
          }
        >
          {ctaLabel}
        </Button>
        {secondarySlot}
        {showVoiceButton && (
          <Button
            variant="light"
            radius="xl"
            size="md"
            leftSection={<IconMicrophone size={16} />}
            onClick={onVoice}
            className={
              isDarkTone
                ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                : undefined
            }
          >
            Voice
          </Button>
        )}
      </Group>
    </div>
  );
}
