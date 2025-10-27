export type Country = {
  name: string;
  iso_3166_1: string;
  stationcount: number;
};

export type Station = {
  uuid: string;
  name: string;
  url: string;
  streamUrl: string | null;
  favicon: string;
  country: string;
  countryCode?: string | null;
  state: string | null;
  language: string | null;
  languageCodes?: string[];
  tags: string | null;
  tagList?: string[];
  bitrate: number;
  codec: string | null;
  homepage?: string | null;
  hls?: boolean;
  lastCheckOk?: boolean;
  lastCheckOkTime?: string | null;
  lastCheckTime?: string | null;
  lastLocalCheckTime?: string | null;
  sslError?: boolean;
  clickCount?: number;
  clickTrend?: number;
  votes?: number;
  isStreamHealthy?: boolean;
  healthStatus?: "good" | "warning" | "error";
};

export type ListeningMode = "world" | "local";

export type PlayerCard =
  | { type: "mission" }
  | { type: "station"; station: Station };
