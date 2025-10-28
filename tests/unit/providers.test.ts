import { describe, expect, it, beforeEach } from "vitest";

import { getProvider, resetProviderCache } from "~/services/ai/providers";
import { OpenAIProvider } from "~/services/ai/providers/OpenAIProvider";
import { GeminiProvider } from "~/services/ai/providers/GeminiProvider";
import { OllamaProvider } from "~/services/ai/providers/OllamaProvider";

const ORIGINAL_ENV = { ...process.env };

describe("AI provider switcher", () => {
  beforeEach(() => {
    resetProviderCache();
    Object.assign(process.env, ORIGINAL_ENV);
    process.env.OPENAI_API_KEY = "test-openai";
    process.env.GEMINI_API_KEY = "test-gemini";
    process.env.OLLAMA_URL = "http://localhost:11434";
  });

  it("returns OpenAI provider by default", () => {
    delete process.env.AI_PROVIDER;
    const provider = getProvider();
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("returns Gemini provider when configured", () => {
    process.env.AI_PROVIDER = "gemini";
    const provider = getProvider();
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it("returns Ollama provider when configured", () => {
    process.env.AI_PROVIDER = "ollama";
    const provider = getProvider();
    expect(provider).toBeInstanceOf(OllamaProvider);
  });

  it("caches provider instances", () => {
    process.env.AI_PROVIDER = "openai";
    const first = getProvider();
    const second = getProvider();
    expect(first).toBe(second);
  });
});
