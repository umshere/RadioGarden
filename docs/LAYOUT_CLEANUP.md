# Layout Cleanup - Country Title & Icon Fix

## Changes Made

### 1. Removed Country Title from Card Content ✅
**Before:**
```
Bottom metadata showed:
- Country name (e.g., "India") 
- Language
- Codec · Bitrate
```

**After:**
```
Bottom metadata now shows only:
- Language
- Codec · Bitrate
```

**Rationale:**
- Country is already visible via the **flag in top-right**
- Flag has built-in tooltip showing country name on hover
- Removes redundant text, cleaner layout
- More space for other metadata

### 2. Fixed Radio Passport Icon ✅
**Before:**
```tsx
src="/icon.png"  // Broken/wrong icon
```

**After:**
```tsx
src="/radio-passport-icon.png"  // Correct icon
```

**Location:** Travel Log header (top-left, next to "Travel log" title)

### 3. Optimized Metadata Layout ✅
Since we removed the country title line, adjusted metadata container:

```css
/* Before */
max-width: 220px;
gap: 0.2rem;

/* After */
max-width: 180px;  /* Narrower, cleaner */
gap: 0.25rem;      /* Better line spacing with 2 lines instead of 3 */
```

## Visual Changes

### Card Layout (After)
```
                [#1]  ← Tab badge
┌──────────────────────────────────┐
│                             🇮🇳   │  ← Flag (hover shows "India" tooltip)
│                                  │
│      Goldy Evergreen            │  ← Station name (large, prominent)
│                                  │
│  GE                   Unknown    │  ← Disc + Language only
│                   AAC · 128 kbps │     (No redundant country text)
└──────────────────────────────────┘
```

### Header (After)
```
[🎫 Radio Passport Icon]  Travel log
                          Hover to preview • Click to play
```
- Now shows correct icon from `public/radio-passport-icon.png`

## Files Modified

1. **`/app/routes/components/PlayerCardStack.tsx`**
   - Removed country title `Text` component from metadata
   - Changed icon source: `/icon.png` → `/radio-passport-icon.png`

2. **`/app/tailwind.css`**
   - Updated `.travel-stack__metadata` max-width: 220px → 180px
   - Adjusted gap: 0.2rem → 0.25rem for 2-line layout

## Tooltip Behavior

The `CountryFlag` component already supports the `title` prop (native HTML tooltip):
- **Hover over flag** → Shows country name (e.g., "India")
- No extra code needed, already implemented in CountryFlag.tsx
- Works on all browsers

## Benefits

1. **Less Redundancy**: Country shown once (flag) instead of twice
2. **Cleaner Layout**: More breathing room, less text clutter
3. **Better Visual Hierarchy**: Focus on station name and technical specs
4. **Correct Branding**: Uses proper radio-passport-icon.png
5. **Progressive Disclosure**: Country name available on demand (hover)

## Testing Checklist

- [x] Removed country title from metadata
- [x] Updated icon path to radio-passport-icon.png
- [x] Adjusted metadata max-width for 2-line layout
- [ ] Verify flag tooltip shows country name on hover
- [ ] Confirm radio-passport-icon.png displays correctly
- [ ] Test with stations that have/don't have language metadata
- [ ] Check layout on mobile breakpoint
