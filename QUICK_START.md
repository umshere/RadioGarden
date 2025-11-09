# Quick Start Guide - AI Atlas

## 🚀 Getting Started

### 1. Start the Server

```bash
cd /Users/umeshmc/Code/SG2
npm run dev
```

Server will start at: **http://localhost:5173**

### 2. Navigate to Atlas

Open in your browser: **http://localhost:5173/world/atlas**

### 3. Try It Out!

#### Example Prompts to Test:

**Genre-Based:**

- "psychedelic jazz from Brazil"
- "electronic music from Berlin"
- "indie rock from Seattle"

**Mood-Based:**

- "relaxing ambient music for late night"
- "energetic dance music"
- "chill lo-fi beats"

**Geographic:**

- "music from Tokyo"
- "French radio stations"
- "Latin music from Colombia"

**Language:**

- "Spanish language radio"
- "Portuguese music"
- "Japanese city pop"

### 4. What to Expect

1. **Initial Load**: You'll see a loading state while AI curates stations
2. **Scene Appears**: Visual representation (atlas/globe/cards)
3. **Stations Loaded**: 4-12 stations matching your prompt
4. **Playback**: Auto-starts first station (if strategy is "autoplay_first")

### 5. UI Elements

- **Text Input**: Enter your prompt
- **Curate Button**: Trigger AI curation
- **Voice Button**: Use voice input (if supported)
- **Why These?**: Chip showing curation reasoning
- **Passport Stamp**: Visual confirmation of new curation

### 6. Verify It's Working

✅ **Check for real stations**:

- Station names should vary based on prompt
- Countries should match geography requests
- Genres/tags should align with prompt

✅ **Check for AI reasoning**:

- "Why These?" chip should show relevant explanation
- Mood field should reflect your prompt

❌ **Signs it's NOT working**:

- Same 4 stations every time (Aurora Trails, Desert Nocturne, etc.)
- Stations don't match prompt at all
- Error messages about API keys

### 7. Debug Issues

**If you see mock data:**

```bash
# Check .env file
cat .env | grep USE_MOCK
# Should show: USE_MOCK=false

cat .env | grep AI_PROVIDER
# Should show: AI_PROVIDER=gemini
```

**If API errors:**

```bash
# Check Gemini key
cat .env | grep GEMINI_API_KEY
# Should show your key
```

**Restart server:**

```bash
# Kill current server
lsof -ti:5173 | xargs kill -9

# Start fresh
npm run dev
```

### 8. Run Tests

```bash
# Automated test suite
node test-ai-atlas.js
```

Expected output:

- ✅ All tests passing
- Stations relevant to prompts
- No API errors

## 🎯 Success Indicators

When everything is working correctly:

1. **Different stations for different prompts**

   - "jazz from New York" ≠ "electronic from Berlin"

2. **Geographic accuracy**

   - Country filter works (Brazil, Germany, etc.)

3. **Genre matching**

   - Tags align with prompt (jazz, electronic, ambient)

4. **Quality metrics**

   - Bitrate ≥ 64kbps
   - Healthy streams only

5. **AI reasoning visible**
   - "Why These?" chip explains selection
   - Mood matches prompt vibe

## 🔧 Advanced Usage

### Custom Visual Mode

Add `?visual=3d_globe` to URL:

```
http://localhost:5173/world/atlas?visual=3d_globe
```

### Voice Input

1. Click microphone button
2. Allow microphone access
3. Speak your prompt
4. Watch it curate!

### Keyboard Shortcuts

- `Enter` in text field → Trigger curation
- `Esc` → Cancel loading

## 📊 Monitor API Usage

Gemini Free Tier Limits:

- 15 requests/minute
- 1500 requests/day

Check usage at: https://aistudio.google.com/

## 🎨 Customization

### Change AI Model

Edit `.env`:

```bash
# Faster, cheapest (recommended for testing)
GEMINI_MODEL=gemini-1.5-flash-latest

# Higher fidelity fallback
GEMINI_MODEL=gemini-1.5-pro-latest

# Force a specific API version (defaults to v1beta, auto-fallback to v1)
GEMINI_API_VERSION=v1beta
```

### Adjust Station Count

Edit `GeminiProvider.ts`, line with:

```typescript
stations: curatedStations.slice(0, 12);
// Change 12 to your preferred count
```

### Modify Curation Logic

Edit `SYSTEM_PROMPT` in `GeminiProvider.ts` to adjust:

- Selection criteria
- Visual mode preferences
- Playback strategies

## 📚 Next Steps

1. ✅ Verify basic functionality works
2. ✅ Test various prompt types
3. ✅ Try voice input
4. ✅ Run automated tests
5. 📝 Customize for your use case
6. 🚀 Deploy to production

## 🆘 Getting Help

- Check docs: `docs/AI_ATLAS_INTEGRATION.md`
- Review architecture: `docs/ARCHITECTURE.md`
- See examples: `test-ai-atlas.js`
- Read summary: `docs/IMPLEMENTATION_SUMMARY.md`

---

**Ready to explore the world through AI-curated radio!** 🌍📻✨
