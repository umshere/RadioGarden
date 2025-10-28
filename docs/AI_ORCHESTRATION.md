# AI Orchestration

`app/api/ai/recommend.ts` mediates between user intent and scene rendering:

1. Resolve which provider to use (`OpenAI`, `Gemini`, `Ollama`, or mock) based on env vars.
2. Call `provider.getSceneDescriptor(prompt)` to retrieve the structured response.
3. Apply ranking and health heuristics before sending results to the client.
4. Return the descriptor to Remix loaders, which hydrate `SceneManager` and the player store.

Providers live under `app/services/ai/providers/` and must implement the `SceneDescriptor` contract. They may include provider-specific metadata but should normalize station fields before returning.
