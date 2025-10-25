# User Journey Revamp - Radio Passport

## Current Problems

### 1. **Button Redundancy**

- Hero has 4 CTAs (Start Listening, Explore Regions, Explore World, Stay Local)
- Mission Card duplicates Explore World & Stay Local
- Confusing for users - unclear what each does

### 2. **Unclear Entry Points**

- Multiple ways to do the same thing
- No clear primary action
- Journey feels fragmented

## Proposed Streamlined Journey

### **Phase 1: Hero (Landing)**

**Goal:** Clear, single primary action

- **PRIMARY CTA:** "Start Your Journey" → Auto-scrolls to atlas, gentle introduction
- **SECONDARY CTA:** "Quick Retune" → Opens country picker for experienced users
- **Remove:** Duplicate Explore World/Stay Local buttons (belong in player context)

### **Phase 2: Mission Card (First Time Experience)**

**Goal:** Help users choose their listening style

**Keep Mission Card with:**

- "Explore the World" → Switches to world mode + auto-plays first global station
- "Explore [Country]" → Switches to local mode for selected country (dynamic based on selection)

**Why it works:**

- Contextual: Appears when no station is playing
- Clear choice: World exploration vs local deep-dive
- Dynamic label shows selected country name

### **Phase 3: Atlas Interaction**

**Goal:** Browse and discover

- Continent filters
- Country cards
- Search functionality

### **Phase 4: Station Selection**

**Goal:** Play and enjoy

- Click station → plays immediately
- Player controls appear
- Swipe through recent stations

## Simplified Flow Diagram

```
1. LAND ON HERO
   └─→ "Start Your Journey" → scroll to atlas
   └─→ "Quick Retune" → pick specific country

2. VIEW ATLAS
   └─→ Browse by continent/search
   └─→ Click country → load stations

3. MISSION CARD (appears if nothing playing)
   └─→ "Explore the World" → world mode + auto-play
   └─→ "Explore [Country Name]" → local mode for that country

4. STATION GRID
   └─→ Click station → plays
   └─→ Station appears in player stack

5. PLAYER CONTROLS
   └─→ Play/Pause/Next
   └─→ Swipe through recent stations
   └─→ Quick Retune to change country
```

## Button Changes Summary

### Hero Section - REMOVE:

- ❌ "Explore the World" (move to mission card only)
- ❌ "Stay Local" (move to mission card only)

### Hero Section - KEEP & RENAME:

- ✅ "Start Listening" → **"Start Your Journey"** (clearer intent)
- ✅ "Explore Regions" → **"Quick Retune"** (consistent naming)

### Mission Card - UPDATE:

- ✅ "Explore the World" (keep as-is)
- ✅ "Stay Local" → **"Explore [Country]"** (dynamic based on selected country)

## Benefits

1. **Clearer Intent:** Each button has distinct purpose
2. **Less Confusion:** No duplicates between hero and mission card
3. **Better Context:** Mission card only shows when relevant
4. **Personalized:** Local button shows actual country name
5. **Faster Flow:** Primary action is obvious

## Implementation Priority

1. Update Hero Section buttons (remove duplicates, rename)
2. Update Mission Card "Stay Local" to be dynamic with country name
3. Update copy throughout for consistency
4. Update tests to match new flow
