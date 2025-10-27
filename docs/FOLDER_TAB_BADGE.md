# Folder Tab Badge Update

## What Changed

### Badge Position (Key Change!)
- **Before**: Badge was inside the card in the top-left corner
- **After**: Badge is positioned **on the top edge** of the card (like a folder tab/sticker)
  - Centered horizontally on the card
  - Sits 12px above the card border
  - Cream/beige background with golden border
  - Larger and more prominent (3rem × 2.15rem)
  - Scales up slightly on hover (1.08x)

### Layout Improvements

#### Top Row
- Now contains **only the flag** (right-aligned)
- Flag increased to 64px for better visibility
- No badge competing for space

#### Content Spacing
- Better vertical distribution with more breathing room
- Padding increased: `0.85rem 1.15rem`
- Card overflow changed to `visible` to allow badge to sit outside

#### Metadata Clipping
- Added `max-width: 200px` to prevent long country names from pushing controls
- Added `overflow: hidden` on metadata container
- All metadata lines use `lineClamp={1}` to prevent wrapping
- Right-aligned for clean visual flow

### Visual Hierarchy

```
     [#1]  ← Tab badge (centered on top edge)
┌─────────────────────────┐
│                      🇺🇸 │  ← Flag (top-right)
│                         │
│   181.FM - The Beat     │  ← Large centered title
│    (HipHop/R&B)         │
│                         │
│  🌍          United...  │  ← Disc (left), Metadata (right, clipped)
│              english    │
│              MP3·128kbps│
└─────────────────────────┘
```

### CSS Classes Added/Modified

#### `.travel-stack__tab-badge` (NEW)
- `position: absolute; top: -12px; left: 50%`
- Cream gradient background
- Golden border (2px solid)
- Drop shadow for depth
- Centered with `transform: translateX(-50%)`
- Scales on hover

#### `.travel-stack__top-row` (MODIFIED)
- Removed `space-between` layout
- Now uses `flex-end` (right-align flag only)
- No gap needed

#### `.travel-stack__metadata` (MODIFIED)
- Added `max-width: 200px` for clipping
- Added `overflow: hidden`
- Prevents long text from pushing other elements

#### `.travel-stack__card` (MODIFIED)
- Changed `overflow: hidden` → `overflow: visible`
- Allows tab badge to extend above card

## Files Changed

1. **`/app/routes/components/PlayerCardStack.tsx`**
   - Moved badge outside `travel-stack__content`
   - Renamed from `.travel-stack__badge` → `.travel-stack__tab-badge`
   - Simplified top row (flag only)
   - Added `maxWidth: '100%'` and `lineClamp={1}` to all metadata

2. **`/app/tailwind.css`**
   - Added `.travel-stack__tab-badge` styles
   - Updated `.travel-stack__top-row` alignment
   - Updated `.travel-stack__metadata` with max-width and overflow
   - Changed card overflow behavior

## Responsive Behavior

Mobile adjustments in `@media (max-width: 768px)`:
- Tab badge scales proportionally
- Card and title sizes reduce
- Metadata max-width adjusts for smaller screens

## Testing Checklist

- [x] Badge appears centered on top edge
- [x] Badge doesn't interfere with stacking effect
- [x] Long country names clip properly (e.g., "The United States of America" → "The United...")
- [x] Flag stays in top-right regardless of content
- [x] Hover animation works smoothly with new badge position
- [x] Stamp animation doesn't conflict with tab badge
