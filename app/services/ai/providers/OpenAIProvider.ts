import { parseSceneDescriptor } from "./sceneDescriptorParser";
import type { AiProvider } from "./BaseProvider";
import type { SceneDescriptor } from "~/scenes/types";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export class OpenAIProvider implements AiProvider {
  constructor(private readonly apiKey: string, private readonly fetchImpl: typeof fetch = fetch) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required when using the OpenAI provider");
    }
  }

  async getSceneDescriptor(prompt: string): Promise<SceneDescriptor> {
    const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You curate immersive radio journeys. Return JSON that matches the SceneDescriptor contract and highlights stations relevant to the user's prompt.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const output = payload?.output ?? payload?.output_text ?? payload?.choices?.[0]?.message?.content;
    if (!output) {
      throw new Error("OpenAI response did not include output text");
    }

    return parseSceneDescriptor(output);
  }
}
