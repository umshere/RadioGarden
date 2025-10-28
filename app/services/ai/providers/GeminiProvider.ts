import { parseSceneDescriptor } from "./sceneDescriptorParser";
import type { AiProvider } from "./BaseProvider";
import type { SceneDescriptor } from "~/scenes/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-pro";

export class GeminiProvider implements AiProvider {
  constructor(private readonly apiKey: string, private readonly fetchImpl: typeof fetch = fetch) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required when using the Gemini provider");
    }
  }

  async getSceneDescriptor(prompt: string): Promise<SceneDescriptor> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`;
    const response = await this.fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Return JSON for a SceneDescriptor responding to: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const candidates = payload?.candidates ?? [];
    const text = candidates[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini response did not include JSON output");
    }

    return parseSceneDescriptor(text);
  }
}
