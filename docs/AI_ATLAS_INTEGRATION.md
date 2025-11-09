# AI Atlas Integration - Implementation Guide

## Overview

The `/world/atlas` route now uses **real AI-powered curation** with Google Gemini to dynamically select and present radio stations from the Radio Browser API based on user prompts and moods.

## What Changed

### Before

- Mock data with hardcoded stations (Aurora Trails, Desert Nocturne, Harbor Dawn)
- Static responses regardless of user input
- No real Radio Browser integration in World Mode

### After

- **Real-time station fetching** from Radio Browser API
- **AI-powered curation** using Google Gemini to select relevant stations
- **Dynamic responses** tailored to user prompts
- **Intelligent filtering** based on genre, country, language, mood, and quality metrics

## Architecture

### Flow

```
User enters prompt → /world/atlas route → /api/ai/recommend → GeminiProvider
                                                                    ↓
                                              Fetch stations from Radio Browser
                                                                    ↓
                                              Build context for AI (station metadata)
                                                                    ↓
                                              Gemini AI curates best matches
                                                                    ↓
                                              Return SceneDescriptor with stations
                                                                    ↓
                                              SceneManager renders visual
```

### Key Components

#### 1. **GeminiProvider** (`app/services/ai/providers/GeminiProvider.ts`)

- Fetches up to 200 popular, healthy stations from Radio Browser
- Filters for quality (bitrate ≥ 64kbps, healthy streams)
- Builds context with station metadata (country, tags, language, bitrate)
- Sends structured prompt to Gemini with available stations
- Maps AI-selected station IDs back to full station objects
- Returns properly formatted `SceneDescriptor`

#### 2. **System Prompt**

The AI is given:

- Available visual modes (atlas, 3d_globe, card_stack)
- Playback strategies
- Station selection rules (4-8 stations, prioritize quality)
- Response format requirements

#### 3. **Radio Browser Integration**

- Fetches from: `/json/stations/search?limit=200&hidebroken=true&order=clickcount&reverse=true&has_geo_info=true`
- Filters for healthy streams
- Normalizes Radio Browser format to internal Station type

## Configuration

### Environment Variables (`.env`)

```bash
AI_PROVIDER=gemini          # Use Gemini instead of mock
USE_MOCK=false              # Disable mock responses
GEMINI_API_KEY=AIzaSy...   # Your Gemini API key
GEMINI_MODEL=gemini-1.5-flash-latest  # Default cheap model (auto-fallbacks enabled)
GEMINI_API_VERSION=v1beta            # Preferred API version (auto-fallback to v1)
```

### Models Available

- `gemini-1.5-flash-latest` - Fastest, cheapest, recommended default
- `gemini-1.5-pro-latest` - More capable (used automatically as fallback)
- `gemini-1.5-flash` - Legacy flash model for regions where `-latest` is gated
- `gemini-1.5-pro` - Legacy pro model if newer variants are unavailable
- `gemini-1.5-flash-8b` - Lightweight 8B parameter tier for tighter budgets
- `gemini-1.0-pro` - Older v1 model if v1.5 endpoints are restricted in a region

> The Gemini provider automatically cascades through the list above whenever
> Google returns `NOT_FOUND`/404 so `/world/atlas` keeps working even when a
> regional model alias disappears. We now also try the `v1` REST API if the
> default `v1beta` endpoint claims a model is unavailable.

## Usage Examples

### Example Prompts

1. **Genre-based**: "psychedelic jazz from Brazil"
   - AI will filter Brazilian stations with jazz/psychedelic tags
2. **Mood-based**: "relaxing ambient music for late night"
   - AI selects ambient/chill stations, suggests night-time visuals
3. **Geographic**: "electronic music from Berlin"
   - AI filters German stations with electronic tags
4. **Language**: "French chanson and cafe music"
   - AI selects French-language stations with appropriate genres

### Visual Modes

The AI chooses the best visual for the experience:

- **atlas** - Grid view, good for browsing multiple countries
- **3d_globe** - Geographic exploration, highlighting locations
- **card_stack** - Swipeable discovery, genre-focused

## AI Curation Logic

### Station Selection Criteria

1. **Relevance**: Matches user prompt via tags, country, language
2. **Quality**: Bitrate ≥ 64kbps, healthy stream status
3. **Diversity**: Mix of countries/genres when appropriate
4. **Quantity**: 4-8 stations (expandable to 12)

### Response Structure

```json
{
  "visual": "atlas",
  "mood": "Psychedelic Jazz from South America",
  "animation": "slow-orbit",
  "play": {
    "strategy": "autoplay_first",
    "crossfadeMs": 4000
  },
  "reason": "High-bitrate jazz stations with psychedelic vibes from Brazil",
  "selectedStationIds": ["uuid1", "uuid2", "uuid3"]
}
```

## Testing

### Quick Test

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/world/atlas`
3. Enter prompt: "jazz from New York"
4. Click "Curate" button
5. Verify:
   - Stations appear in the scene
   - Stations match the prompt
   - Visual mode is appropriate
   - Playback works

### Manual Testing Checklist

- [ ] Default load (no prompt) shows curated stations
- [ ] Genre-specific prompts return relevant stations
- [ ] Geographic prompts filter by country
- [ ] Language prompts work correctly
- [ ] Mood-based prompts adapt visual and stations
- [ ] Voice input integration works
- [ ] Error handling for API failures
- [ ] Loading states show properly

## API Costs (Gemini)

### Free Tier

- 15 requests/minute
- 1500 requests/day
- More than sufficient for testing

### Paid Tier

- `gemini-1.5-flash-latest`: ~$0.00001 per request
- `gemini-1.5-flash-8b`: Similar cost, best when you need tighter budgets
- `gemini-1.5-pro-latest`: ~$0.00005 per request

### Optimization Tips

1. Use `gemini-1.5-flash-latest` for development
2. Cache AI responses client-side when possible
3. Implement request debouncing on input
4. Consider adding a local cache for popular prompts

## Troubleshooting

### "No stations available from Radio Browser"

- Radio Browser API may be down
- Check network connection
- Try different mirror in `radioBrowser.ts`

### "Gemini request failed"

- Verify `GEMINI_API_KEY` in `.env`
- Check API key has permissions
- Verify `AI_PROVIDER=gemini` is set
- Check rate limits (15/min, 1500/day)
- Try `GEMINI_API_VERSION=v1` if Google rolls out a region-specific alias

### AI selects wrong stations

- Review system prompt in `GeminiProvider.ts`
- Increase station context (more metadata)
- Try different model (`gemini-1.5-pro-latest` vs `flash-latest`)
- Adjust temperature parameter

### Mock data still showing

- Ensure `USE_MOCK=false` in `.env`
- Restart dev server
- Clear browser cache

## Future Enhancements

### Planned

1. **Caching Layer**: Cache AI responses for common prompts
2. **User Feedback**: Let users rate curation quality
3. **Personalization**: Learn from user preferences
4. **Multi-modal**: Add image generation for station artwork
5. **Real-time Filtering**: Filter stations as user types

### Advanced Features

- Genre classification using embeddings
- Collaborative filtering based on listening history
- Time-of-day aware recommendations
- Weather/season-based curation
- Social features (share curated lists)

## Contributing

When modifying the AI integration:

1. Test with various prompts (genre, mood, location)
2. Monitor AI response quality
3. Update system prompt if needed
4. Document prompt engineering changes
5. Test error cases (no matches, API failures)

## References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Radio Browser API](https://api.radio-browser.info/)
- [Scene Descriptor Contract](./SCENE_DESCRIPTOR.md)
- [AI Orchestration](./AI_ORCHESTRATION.md)
