import { describe, expect, it } from "vitest";

import { extractPromptIntent } from "~/services/ai/intent/promptIntent";

describe("extractPromptIntent", () => {
  it("detects india and hindi from prompt", () => {
    const intent = extractPromptIntent("hindi lo-fi vibes from Mumbai");
    expect(intent.countries).toContain("India");
    expect(intent.languages).toContain("Hindi");
    expect(intent.tags).toContain("Lofi");
    expect(intent.confidence).toBe("high");
  });

  it("returns none when prompt empty", () => {
    const intent = extractPromptIntent("");
    expect(intent.countries).toHaveLength(0);
    expect(intent.confidence).toBe("none");
  });
});
