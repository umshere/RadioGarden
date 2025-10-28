import { OpenAIProvider } from "./OpenAIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";
import type { AiProvider } from "./BaseProvider";

const providerCache: { instance: AiProvider | null } = { instance: null };

export function getProvider(): AiProvider {
  if (providerCache.instance) {
    return providerCache.instance;
  }

  const providerName = (process.env.AI_PROVIDER ?? "openai").toLowerCase();

  switch (providerName) {
    case "gemini": {
      providerCache.instance = new GeminiProvider(process.env.GEMINI_API_KEY ?? "");
      break;
    }
    case "ollama": {
      providerCache.instance = new OllamaProvider(process.env.OLLAMA_URL ?? "");
      break;
    }
    case "openai":
    default: {
      providerCache.instance = new OpenAIProvider(process.env.OPENAI_API_KEY ?? "");
      break;
    }
  }

  return providerCache.instance;
}

export function resetProviderCache() {
  providerCache.instance = null;
}
