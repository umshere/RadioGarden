# Card Layout Fixes - Issues & Solutions

## Problems Identified (from screenshot)

### 1. **Cramped Content** ❌
- **Issue**: Card content squeezed with insufficient spacing
- **Root Cause**: `gap: 0.4rem` too small, padding unbalanced
- **Fix**: 
  - Reduced top padding: `0.85rem` → `0.5rem` (gives flag more room)
  - Increased bottom padding to `0.85rem` (gives metadata breathing space)
  - Reduced gap: `0.4rem` → `0.3rem` (tighter vertical rhythm)

### 2. **Title Too Small** ❌
- **Issue**: Station name "Radio BollyFm" not prominent enough
- **Root Cause**: Font size `1.35rem` too conservative
- **Fix**: 
  - Increased to `1.5rem` (more prominent like reference)
  - Tightened line-height: `1.3` → `1.25` (better vertical space)
  - Added `padding: 0.2rem 0` to title section

### 3. **Flag Too Small** ❌
- **Issue**: Country flag not prominent in top-right
- **Root Cause**: Size `64px` may need more space
- **Fix**: 
  - Added `min-height: 32px` to top row (ensures flag has room)
  - Flag stays at 64px (already increased from 56px earlier)

### 4. **Bottom Metadata Cramped** ❌
- **Issue**: Disc and metadata competing for space, appearing overlapped
- **Root Cause**: 
  - Gap too small (`0.75rem`)
  - Max-width too restrictive (`200px`)
  - Insufficient min-height for bottom row
- **Fix**: 
  - Increased gap: `0.75rem` → `1rem`
  - Increased max-width: `200px` → `220px`
  - Added `min-height: 36px` for consistent bottom spacing
  - Increased metadata gap: `0.15rem` → `0.2rem`

### 5. **Disc Overlapping Issues** ❌
- **Issue**: Multiple disc icons appearing (RB, VB badges visible in screenshot)
- **Root Cause**: This might be from OTHER cards in the stack showing through
- **Note**: The disc itself is fine at 52px. The overlap is likely from:
  - Cards too close in the stack (34px offset may show backgrounds)
  - Other UI elements bleeding through
  - Needs testing to confirm if it's a z-index or opacity issue

## CSS Changes Applied

### `.travel-stack__content`
```css
/* Before */
padding: 0.85rem 1rem;
gap: 0.4rem;

/* After */
padding: 0.5rem 1.15rem 0.85rem 1.15rem; /* asymmetric: less top, more bottom */
gap: 0.3rem; /* tighter rhythm */
```

### `.travel-stack__top-row`
```css
/* Added */
min-height: 32px; /* ensures flag has space */
```

### `.travel-stack__title-section`
```css
/* Added */
padding: 0.2rem 0; /* breathing room around title */
```

### `.travel-stack__station-name`
```css
/* Before */
font-size: 1.35rem;
line-height: 1.3;

/* After */
font-size: 1.5rem; /* more prominent */
line-height: 1.25; /* tighter, better vertical space */
```

### `.travel-stack__bottom-row`
```css
/* Before */
gap: 0.75rem;
/* no min-height */

/* After */
gap: 1rem; /* more space between disc and metadata */
min-height: 36px; /* consistent bottom area */
```

### `.travel-stack__metadata`
```css
/* Before */
max-width: 200px;
gap: 0.15rem;

/* After */
max-width: 220px; /* more room for text */
gap: 0.2rem; /* better line spacing */
```

## Visual Hierarchy Achieved

```
                [#1]  ← Tab badge (centered, prominent)
┌──────────────────────────────────┐
│                             🇮🇳   │  ← Flag (64px, top-right, has room)
│         (0.5rem padding)         │
│                                  │
│      Radio BollyFm              │  ← Large title (1.5rem, centered)
│         (flex: 1)                │
│                                  │
│  🌍              India           │  ← Disc (52px) + Metadata (right-aligned)
│                  hindi           │     Gap: 1rem, max-width: 220px
│                  MP3 · 128 kbps  │
│         (0.85rem padding)        │
└──────────────────────────────────┘
```

## Responsive Considerations

Mobile adjustments remain in place:
- Title: `1.5rem` → `1.05rem` on mobile
- Card: 380px → 280px width
- All spacing scales proportionally

## Testing Checklist

- [x] Increased title size to 1.5rem for prominence
- [x] Added asymmetric padding (less top, more bottom)
- [x] Increased gap between disc and metadata
- [x] Increased metadata max-width for better text flow
- [x] Added min-heights to ensure consistent spacing
- [ ] Test card stacking to verify no disc overlap from other cards
- [ ] Test with very long station names
- [ ] Test with missing metadata fields
- [ ] Verify on mobile breakpoint

## Next Steps (if overlap persists)

If the disc overlap issue continues:
1. Check if it's from **adjacent cards in stack** showing through
2. May need to adjust card `z-index` or `opacity` during stacking
3. Consider increasing card offset from `34px` to `40px+`
4. Verify `overflow: visible` on card isn't causing adjacent card content to show

## Files Modified

- `/app/tailwind.css` - Updated spacing, sizing, and layout constraints
