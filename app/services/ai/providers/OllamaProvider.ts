import { parseSceneDescriptor } from "./sceneDescriptorParser";
import type { AiProvider } from "./BaseProvider";
import type { SceneDescriptor } from "~/scenes/types";
import type { Station } from "~/types/radio";
import { rbFetchJson } from "~/utils/radioBrowser";
import { normalizeStations } from "~/utils/stations";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "radio-passport";

const SYSTEM_PROMPT = `You are Radio Passport's music curator. Create a card_stack scene JSON.

Return JSON with:
- visual: "card_stack"
- mood: 2-4 evocative words (e.g. "Midnight Berber Reverie")
- animation: "slow_pan" | "slow_orbit" | "cascade_drop" (match energy)
- play: { strategy: "preview_on_hover" or "autoplay_first", crossfadeMs: 4000 }
- reason: 2 paragraphs (max 420 chars), cinematic with continents/instruments/decades
- selectedStationIds: ["uuid1", ...] - pick 6-8 from list, 3+ countries, 1+ non-US
- stationEnhancements: { "uuid1": { highlight: "why it fits (<=120 chars)", tagList: ["mood","instrument","decade","locale"], healthStatus: "good", healthScore: 85-100 } }

Make it feel like a bespoke mixtape. Return ONLY JSON.`;

export class OllamaProvider implements AiProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {
    if (!baseUrl) {
      throw new Error("OLLAMA_URL is required when using the Ollama provider");
    }
  }

  private async fetchAvailableStations(
    limit: number = 60 // Further reduced for speed
  ): Promise<Station[]> {
    try {
      const rawStations = await rbFetchJson<unknown>(
        `/json/stations/search?limit=${limit}&hidebroken=true&order=clickcount&reverse=true&has_geo_info=true`
      );

      const stations = normalizeStations(
        Array.isArray(rawStations) ? rawStations : []
      );

      return stations.filter(
        (station) =>
          station.isStreamHealthy !== false &&
          station.bitrate >= 64 &&
          station.streamUrl
      );
    } catch (error) {
      console.error("Failed to fetch stations from Radio Browser:", error);
      return [];
    }
  }

  private buildStationContext(stations: Station[]): string {
    // Ultra-compact format: minimal tokens for fastest response
    return stations
      .slice(0, 20) // Only 20 stations (AI needs 6-8, this gives 2.5x variety)
      .map((station, idx) => {
        const tags = station.tagList?.slice(0, 3).join(",") || "none";
        return `${idx + 1}. ${station.name} [${station.uuid}]|${
          station.country
        }|${tags}|${station.bitrate}k`;
      })
      .join("\n");
  }

  async getSceneDescriptor(prompt: string): Promise<SceneDescriptor> {
    const availableStations = await this.fetchAvailableStations();

    if (availableStations.length === 0) {
      throw new Error("No stations available from Radio Browser");
    }

    const stationContext = this.buildStationContext(availableStations);

    const fullPrompt = `${SYSTEM_PROMPT}

USER REQUEST: "${prompt}"

AVAILABLE STATIONS:
${stationContext}

Curate a SceneDescriptor that matches this request. Return ONLY valid JSON matching the schema.`;

    const response = await this.fetchImpl(
      `${this.baseUrl.replace(/\/$/, "")}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: fullPrompt,
          format: "json",
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.response ?? payload?.output ?? payload;

    const aiResponse = JSON.parse(
      typeof text === "string" ? text : JSON.stringify(text)
    );

    // Map selected station IDs to actual stations and apply enhancements
    const selectedIds = new Set(aiResponse.selectedStationIds || []);
    const stationEnhancements = aiResponse.stationEnhancements || {};

    const curatedStations = availableStations
      .filter((station) => selectedIds.has(station.uuid))
      .map((station) => {
        const enhancement = stationEnhancements[station.uuid];
        if (!enhancement) return station;

        return {
          ...station,
          highlight: enhancement.highlight || station.highlight,
          tagList: enhancement.tagList || station.tagList,
          healthStatus: enhancement.healthStatus || station.healthStatus,
          healthScore: enhancement.healthScore ?? station.healthScore,
        };
      });

    if (curatedStations.length < 6) {
      console.warn(
        "AI selected too few stations, falling back to top stations"
      );
      curatedStations.push(...availableStations.slice(0, 8));
    }

    const descriptor: SceneDescriptor = {
      visual: aiResponse.visual || "card_stack",
      mood: aiResponse.mood || "Sonic Journey",
      animation: aiResponse.animation || "slow_orbit",
      play: aiResponse.play || {
        strategy: "preview_on_hover",
        crossfadeMs: 4000,
      },
      stations: curatedStations.slice(0, 8),
      reason: aiResponse.reason,
    };

    return parseSceneDescriptor(descriptor);
  }
}
