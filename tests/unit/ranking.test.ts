import { describe, expect, it } from "vitest";

import { rankStations } from "~/server/stations/ranking";
import type { Station } from "~/types/radio";

const baseStation = (overrides: Partial<Station>): Station => ({
  uuid: "uuid-1",
  name: "Station One",
  url: "https://example.com",
  streamUrl: "https://example.com/stream",
  favicon: "",
  country: "Brazil",
  countryCode: "BR",
  state: null,
  language: "Portuguese",
  languageCodes: ["pt"],
  tags: null,
  tagList: [],
  bitrate: 192,
  codec: "mp3",
  homepage: null,
  hls: false,
  lastCheckOk: true,
  lastCheckOkTime: null,
  lastCheckTime: null,
  lastLocalCheckTime: null,
  sslError: false,
  clickCount: 0,
  clickTrend: 0,
  votes: 0,
  highlight: null,
  isStreamHealthy: undefined,
  healthStatus: undefined,
  isLikelyUp: null,
  healthScore: null,
  ...overrides,
});

describe("rankStations", () => {
  it("prioritizes stations matching prompt keywords", () => {
    const stations: Station[] = [
      baseStation({ uuid: "a", name: "Ambient North", tagList: ["ambient"], country: "Iceland" }),
      baseStation({ uuid: "b", name: "Rio Jazz", tagList: ["jazz", "psychedelic"], country: "Brazil" }),
      baseStation({ uuid: "c", name: "Doha Nights", country: "Qatar", language: "Arabic" }),
    ];

    const ranked = rankStations(stations, { prompt: "psychedelic jazz from Brazil" });
    expect(ranked[0]?.uuid).toBe("b");
  });

  it("falls back to bitrate when no tokens match", () => {
    const stations: Station[] = [
      baseStation({ uuid: "a", bitrate: 64 }),
      baseStation({ uuid: "b", bitrate: 320 }),
      baseStation({ uuid: "c", bitrate: 128 }),
    ];

    const ranked = rankStations(stations, { prompt: "classical" });
    expect(ranked[0]?.uuid).toBe("b");
  });

  it("boosts preferred countries and favorites", () => {
    const stations: Station[] = [
      baseStation({ uuid: "fav", country: "India", bitrate: 64, tagList: ["devotional"] }),
      baseStation({ uuid: "high", country: "France", bitrate: 320 }),
    ];

    const ranked = rankStations(stations, {
      preferredCountries: ["India"],
      favoriteStationIds: ["fav"],
      preferredTags: ["devotional"],
    });

    expect(ranked[0]?.uuid).toBe("fav");
  });
});
