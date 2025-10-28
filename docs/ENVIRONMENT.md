# Environment Variables

Configure the AI layer and playback helpers through the following environment variables:

| Variable | Description |
| --- | --- |
| `AI_PROVIDER` | One of `openai`, `gemini`, or `ollama`. Selects the backing model. |
| `USE_MOCK` | `true` or `false`. When `true`, the API returns the bundled mock descriptor. |
| `OPENAI_API_KEY` | Required when `AI_PROVIDER=openai`. |
| `OPENAI_MODEL` | Optional OpenAI model name (defaults to `gpt-4o-mini`). |
| `GEMINI_API_KEY` | Required when `AI_PROVIDER=gemini`. |
| `GEMINI_MODEL` | Optional Gemini model name (defaults to `gemini-1.5-pro`). |
| `OLLAMA_URL` | Base URL (e.g. `http://localhost:11434`) for the Ollama server when `AI_PROVIDER=ollama`. |
| `OLLAMA_MODEL` | Optional Ollama model identifier (defaults to `radio-passport`). |

Place these variables in `.env` or your deployment platform's secrets manager. Do not commit real keys to the repository.
