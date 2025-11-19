import type { ComponentType } from "react";
import { ThemeIcon } from "@mantine/core";
import { IconBroadcast } from "@tabler/icons-react";
import type { ReactCountryFlagProps } from "react-country-flag";
import * as ReactCountryFlagModule from "react-country-flag";

const fallbackReactCountryFlag: ComponentType<ReactCountryFlagProps> = ({
  countryCode,
  style,
  ...rest
}) => {
  if (typeof countryCode !== "string") return null;
  const emoji = countryCode.toUpperCase().replace(/./g, (char) =>
    String.fromCodePoint(char.charCodeAt(0) + 127397)
  );
  const { svg: _svg, ...restProps } = rest as Record<string, unknown>;
  return (
    <span
      role="img"
      {...restProps}
      style={{
        display: "inline-block",
        fontSize: "1em",
        lineHeight: "1em",
        verticalAlign: "middle",
        ...(style ?? {}),
      }}
    >
      {emoji}
    </span>
  );
};

function resolveReactCountryFlagExport(
  candidate: unknown,
  visited = new Set<unknown>()
): ComponentType<ReactCountryFlagProps> | null {
  if (candidate == null || visited.has(candidate)) {
    return null;
  }

  if (typeof candidate === "function") {
    return candidate as ComponentType<ReactCountryFlagProps>;
  }

  if (typeof candidate !== "object") {
    return null;
  }

  visited.add(candidate);

  const record = candidate as {
    default?: unknown;
    ReactCountryFlag?: unknown;
  };

  return (
    resolveReactCountryFlagExport(record.default, visited) ??
    resolveReactCountryFlagExport(record.ReactCountryFlag, visited)
  );
}

const ReactCountryFlagComponent =
  resolveReactCountryFlagExport(ReactCountryFlagModule) ?? fallbackReactCountryFlag;

type CountryFlagProps = {
  iso?: string;
  size?: number;
  title: string;
  width?: number;
  height?: number;
  className?: string;
};

export function CountryFlag({ iso, size = 48, title, width, height, className }: CountryFlagProps) {
  const flagWidth = width ?? size;
  const flagHeight = height ?? size;
  const flagRadius = Math.min(flagWidth, flagHeight) / 6;

  if (iso && iso.length === 2) {
    return (
      <ReactCountryFlagComponent
        svg
        countryCode={iso}
        title={title}
        className={className}
        style={{
          width: flagWidth,
          height: flagHeight,
          borderRadius: flagRadius,
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <ThemeIcon
      size={Math.max(flagWidth, flagHeight)}
      radius="md"
      variant="gradient"
      gradient={{ from: "cyan", to: "violet", deg: 135 }}
      aria-label="Global"
      className={className}
      style={{
        width: flagWidth,
        height: flagHeight,
        minWidth: flagWidth,
      }}
    >
      <IconBroadcast size={Math.min(flagWidth, flagHeight) * 0.6} stroke={1.5} />
    </ThemeIcon>
  );
}
