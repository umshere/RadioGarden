import { parseSceneDescriptor } from "./sceneDescriptorParser";
import type { AiProvider } from "./BaseProvider";
import type { SceneDescriptor } from "~/scenes/types";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "radio-passport";

export class OllamaProvider implements AiProvider {
  constructor(private readonly baseUrl: string, private readonly fetchImpl: typeof fetch = fetch) {
    if (!baseUrl) {
      throw new Error("OLLAMA_URL is required when using the Ollama provider");
    }
  }

  async getSceneDescriptor(prompt: string): Promise<SceneDescriptor> {
    const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `Return JSON for a SceneDescriptor responding to: ${prompt}`,
        format: "json",
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.response ?? payload?.output ?? payload;

    return parseSceneDescriptor(text);
  }
}
