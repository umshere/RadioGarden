export function getContinent(iso2?: string): string {
  if (!iso2) return "Other";

  const continentMap: Record<string, string> = {
    AT: "Europe",
    BE: "Europe",
    BG: "Europe",
    HR: "Europe",
    CY: "Europe",
    CZ: "Europe",
    DK: "Europe",
    EE: "Europe",
    FI: "Europe",
    FR: "Europe",
    DE: "Europe",
    GR: "Europe",
    HU: "Europe",
    IS: "Europe",
    IE: "Europe",
    IT: "Europe",
    LV: "Europe",
    LT: "Europe",
    LU: "Europe",
    MT: "Europe",
    NL: "Europe",
    NO: "Europe",
    PL: "Europe",
    PT: "Europe",
    RO: "Europe",
    SK: "Europe",
    SI: "Europe",
    ES: "Europe",
    SE: "Europe",
    CH: "Europe",
    GB: "Europe",
    UA: "Europe",
    RU: "Europe",
    BY: "Europe",
    MD: "Europe",
    RS: "Europe",
    AL: "Europe",
    BA: "Europe",
    MK: "Europe",
    ME: "Europe",
    US: "North America",
    CA: "North America",
    MX: "North America",
    GT: "North America",
    HN: "North America",
    SV: "North America",
    AR: "South America",
    BO: "South America",
    BR: "South America",
    CL: "South America",
    CO: "South America",
    EC: "South America",
    CN: "Asia",
    IN: "Asia",
    ID: "Asia",
    JP: "Asia",
    KR: "Asia",
    MY: "Asia",
    PH: "Asia",
    SG: "Asia",
    TH: "Asia",
    VN: "Asia",
    ZA: "Africa",
    EG: "Africa",
    NG: "Africa",
    KE: "Africa",
    GH: "Africa",
    AU: "Oceania",
    NZ: "Oceania",
    PG: "Oceania",
    FJ: "Oceania",
  };

  return continentMap[iso2.toUpperCase()] || "Other";
}

export type Country = {
  name: string;
  iso_3166_1: string;
  stationcount: number;
};

export type Station = {
  uuid: string;
  name: string;
  url: string;
  favicon: string;
  country: string;
  state: string | null;
  language: string | null;
  tags: string | null;
  bitrate: number;
  codec: string | null;
};

export function dedupeStations(stations: Station[]): Station[] {
  const seen = new Set<string>();
  const unique: Station[] = [];
  for (const station of stations) {
    if (!seen.has(station.uuid)) {
      seen.add(station.uuid);
      unique.push(station);
    }
  }
  return unique;
}
