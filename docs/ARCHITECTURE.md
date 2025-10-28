# Architecture Overview

World Mode connects user intent to persistent playback through a thin Remix stack:

1. **Input surfaces** (text field, upcoming voice capture) collect prompts such as "psychedelic jazz from Brazil".
2. Prompts are sent to `POST /api/ai/recommend`, which resolves a `SceneDescriptor` either from mocks or a provider-backed model.
3. The API enriches the descriptor (ranking, health checks) and returns it to Remix loaders/actions on the World routes.
4. `SceneManager` receives the descriptor and lazy-loads the visual scene component specified by `descriptor.visual`.
5. The scene passes station metadata to the shared `playerStore`, which queues streams and applies playback strategies without interrupting the current audio session.
6. UI components (explainability chip, Passport stamp) react to the descriptor so the experience feels cohesive.

This flow keeps audio playback centralized while allowing new input surfaces and scenes to plug into the same orchestration.
