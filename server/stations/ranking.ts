import type { Station } from "~/types/radio";

export type IntentMeta = {
  prompt?: string | null;
  mood?: string | null;
};

const LANGUAGE_ALIASES: Record<string, string[]> = {
  portuguese: ["pt", "brazil"],
  spanish: ["es", "latin"],
  english: ["en", "uk", "us"],
  french: ["fr", "paris"],
  japanese: ["ja", "tokyo"],
  arabic: ["ar", "dubai", "doha", "cairo"],
  german: ["de", "berlin"],
  italian: ["it", "rome"],
  chinese: ["zh", "mandarin", "hong kong"]
};

const WEIGHTS = {
  tagMatch: 5,
  countryMatch: 4,
  languageMatch: 3,
  bitrate: 0.02,
  vote: 0.01,
};

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function tokenize(...values: Array<string | null | undefined>) {
  return values
    .filter(Boolean)
    .map((value) => value!.toLowerCase())
    .join(" ")
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1);
}

function scoreStation(station: Station, tokens: string[]): number {
  let score = 0;

  const tags = new Set<string>();
  if (station.tagList) {
    for (const tag of station.tagList) {
      if (tag) tags.add(tag.toLowerCase());
    }
  }
  if (station.tags) {
    station.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .forEach((tag) => tags.add(tag));
  }

  const country = normalize(station.country);
  const language = normalize(station.language);

  for (const token of tokens) {
    if (tags.has(token)) {
      score += WEIGHTS.tagMatch;
    }
    if (country && country.includes(token)) {
      score += WEIGHTS.countryMatch;
    }
    if (language && language.includes(token)) {
      score += WEIGHTS.languageMatch;
    }

    for (const [lang, aliases] of Object.entries(LANGUAGE_ALIASES)) {
      if (aliases.includes(token) && language.includes(lang)) {
        score += WEIGHTS.languageMatch;
      }
    }
  }

  if (typeof station.bitrate === "number") {
    score += station.bitrate * WEIGHTS.bitrate;
  }
  if (typeof station.votes === "number") {
    score += station.votes * WEIGHTS.vote;
  }

  return score;
}

export function rankStations(stations: Station[], intentMeta: IntentMeta = {}): Station[] {
  if (!Array.isArray(stations)) {
    return [];
  }

  const tokens = tokenize(intentMeta.prompt, intentMeta.mood);

  return [...stations]
    .map((station) => ({ station, score: scoreStation(station, tokens) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.station);
}
