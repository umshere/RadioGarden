# AI Prompt Enhancement for Card Stack Experience

## Overview

Enhanced all AI providers (OpenAI, Gemini, OpenRouter, Ollama) with a comprehensive prompt that delivers rich, tactile card stack experiences with cinematic storytelling.

## What Changed

### Previous Issues

1. **Cards never surface** - Static summary instead of interactive stack
2. **Thin storytelling** - Generic reason paragraphs without narrative depth
3. **No progressive reveal** - Static layout with no entrance motion
4. **Metadata underused** - Missing mood microstories and per-station hooks

### New Prompt Requirements

#### 1. **Evocative Mood Labels** (2-4 words)

- ✅ "Solar Soul Drift", "Luminous Nocturne", "Analog Desert Bloom"
- ❌ "Chill Vibes", "Great Music"

#### 2. **Rich Storytelling** (max 420 chars)

- Two short paragraphs describing the sonic journey
- Sensory language with continents/decades/instruments
- Cinematic and adventurous tone

#### 3. **Per-Station Highlights**

Each station now includes:

- `highlight` - 1 sentence (≤120 chars) explaining why it fits
- Enhanced `tagList` - 4-6 focused tags (moods, instruments, decades, locales)
- `healthStatus` and `healthScore` for quality signals
- Geographic diversity (3+ countries, 1+ non-US region)

#### 4. **Animation Cues**

- `slow_pan` - Mellow, contemplative moods
- `slow_orbit` - Balanced, flowing vibes
- `cascade_drop` - High-energy, dynamic sets

#### 5. **Smart Playback Strategy**

- `preview_on_hover` - Default for most moods (tactile exploration)
- `autoplay_first` - Only for high-energy sets

#### 6. **Card Stack Visual**

- Always returns `visual: "card_stack"` for swipeable experience
- Targets 6-8 stations (sweet spot for card browsing)

## Technical Implementation

### Response Format

```json
{
  "visual": "card_stack",
  "mood": "Midnight Berber Reverie",
  "animation": "slow_orbit",
  "play": {
    "strategy": "preview_on_hover",
    "crossfadeMs": 4000
  },
  "reason": "Journey from Marrakech rooftop cafés to Cairo's underground electronic scene. Hand-picked stations weave North African instrumentation with modern production, creating a sonic tapestry that honors tradition while pushing boundaries.",
  "selectedStationIds": ["uuid1", "uuid2", "uuid3", ...],
  "stationEnhancements": {
    "uuid1": {
      "highlight": "Gnawa rhythms meet ambient dub in this Casablanca collective's midnight sessions",
      "tagList": ["gnawa", "ambient", "morocco", "electronic", "traditional-fusion", "late-night"],
      "healthStatus": "good",
      "healthScore": 95
    }
  }
}
```

### Processing Logic

1. Fetch top 200 stations from Radio Browser
2. AI curates 6-8 stations with enhancements
3. Apply `stationEnhancements` to selected stations:
   - Inject `highlight` text
   - Replace/enhance `tagList`
   - Update `healthStatus` and `healthScore`
4. Fallback to top 8 stations if AI selects fewer than 6
5. Build final `SceneDescriptor` with enriched metadata

## Updated Files

- `/app/services/ai/providers/OpenAIProvider.ts`
- `/app/services/ai/providers/GeminiProvider.ts`
- `/app/services/ai/providers/OpenRouterProvider.ts`
- `/app/services/ai/providers/OllamaProvider.ts`

## Expected User Experience

### Before

- Hero panel with generic mood
- Brief explanation
- Stations without context
- No visual hierarchy

### After

- **Evocative mood badge** - "Twilight Balkan Groove"
- **Rich storytelling** - Two paragraphs of sensory narrative
- **Per-card highlights** - Why each station matters
- **Enhanced metadata** - Curated tags showing the AI's intelligence
- **Animation cues** - Visual flow matching sonic vibe
- **Tactile interaction** - Preview on hover for exploration

## Testing Recommendations

Test prompts to verify richness:

```
- "Upbeat Latin jazz from coastal cities"
- "Melancholic Nordic folk for rainy afternoons"
- "High-energy African electronic fusion"
- "Vintage French chanson meets modern indie"
```

Look for:

1. Mood labels with personality
2. Multi-paragraph `reason` with geographic/instrument references
3. Each station has unique `highlight` text
4. Tags reflect both genre AND geography/era
5. Animation matches energy (cascade_drop for upbeat, slow_pan for mellow)
6. Preview-on-hover for most sets

## Station Selection Criteria

The AI now prioritizes:

- **Geographic diversity** - Min 3 countries, 1+ non-US
- **Audio quality** - Bitrate ≥ 128 kbps preferred
- **Health signals** - `healthStatus: "good"` preferred
- **Playability** - Valid HTTPS `streamUrl`
- **Narrative fit** - Stations that tell a cohesive story

## Future Enhancements

Potential additions:

- Visual theme hints (color palettes based on mood)
- Per-card animation delays for cascading reveals
- Listening time estimates
- Decade/era distribution metadata
- Cultural context snippets for each region
