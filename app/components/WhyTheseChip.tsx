import { memo, useMemo } from "react";
import { IconSparkles } from "@tabler/icons-react";
import type { SceneDescriptor } from "~/scenes/types";

type WhyTheseChipProps = {
  descriptor: SceneDescriptor | null;
  className?: string;
};

function buildReason(descriptor: SceneDescriptor | null): string | null {
  if (!descriptor) return null;
  if (descriptor.reason && descriptor.reason.trim().length > 0) {
    return descriptor.reason.trim();
  }

  const tags = new Set<string>();
  const countries = new Set<string>();
  const languages = new Set<string>();

  for (const station of descriptor.stations) {
    if (station.tagList) {
      for (const tag of station.tagList) {
        if (typeof tag === "string" && tag.trim()) {
          tags.add(tag.trim());
        }
      }
    } else if (typeof station.tags === "string") {
      station.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => tags.add(tag));
    }

    if (station.country) {
      countries.add(station.country);
    }

    if (station.language) {
      languages.add(station.language);
    }
  }

  const parts: string[] = [];
  if (descriptor.mood) {
    parts.push(descriptor.mood);
  }
  if (tags.size > 0) {
    parts.push(Array.from(tags).slice(0, 2).join(" · "));
  }
  if (countries.size > 0) {
    parts.push(Array.from(countries).slice(0, 2).join(" & "));
  } else if (languages.size > 0) {
    parts.push(Array.from(languages).slice(0, 2).join(" • "));
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function WhyTheseChip({ descriptor, className }: WhyTheseChipProps) {
  const reason = useMemo(() => buildReason(descriptor), [descriptor]);

  if (!reason) return null;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm backdrop-blur ${className ?? ""}`}
    >
      <IconSparkles size={16} aria-hidden="true" className="text-ocean-3" />
      <span className="leading-tight">Why these? {reason}</span>
    </span>
  );
}

export default memo(WhyTheseChip);
