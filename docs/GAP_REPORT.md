# Gap Report

## Implemented
- Provider-driven `/api/ai/recommend` with OpenAI, Gemini, Ollama, and mock fallbacks.
- Ranking and health annotation pipeline before descriptors are returned to the client.
- Scene descriptor orchestration through `SceneManager`, player store integration, and explainability chip.
- Voice input component for browsers that support the Web Speech API.
- Unit tests covering provider switching, ranking heuristics, and player-store descriptor handling.
- Documentation set describing architecture, contracts, environment, and orchestration.

## Outstanding
- End-to-end validation of provider responses (stream URL fallbacks, malformed payload handling, retries).
- Real uptime checks for station health instead of heuristic scoring.
- UI polish and analytics around the new World Mode prompt/voice surfaces.
- Broader test coverage for API routes, scene loading, and queue persistence during navigation.
- Package installation in CI/dev environments (current environment blocked registry access, so Vitest is not installed yet).
