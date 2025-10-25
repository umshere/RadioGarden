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

export type ListeningMode = "world" | "local";

export type PlayerCard =
  | { type: "mission" }
  | { type: "station"; station: Station };
