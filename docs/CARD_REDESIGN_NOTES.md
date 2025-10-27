# Card Redesign Notes

## Design Reference
Redesigned travel log cards to match the reference layout with better visual hierarchy and flexible content handling.

## New Layout Structure

### Three-Row Design:

#### 1. **Top Row** (`.travel-stack__top-row`)
- **Left**: Badge with card number (`#1`, `#2`, etc.)
  - Larger badge: 2.75rem min-width × 2rem height
  - Golden accent: `rgba(199, 158, 73, 0.22)` background
  - Prominent border and shadow
- **Right**: Large country flag (56px size)

#### 2. **Center Section** (`.travel-stack__title-section`)
- **Large centered station name**
  - Font size: 1.35rem (desktop), 1.05rem (mobile)
  - Text centered, supports dynamic length with 2-line clamp
  - Uses flexbox centering for vertical alignment
  - Color: `rgba(254, 250, 226, 0.98)` for prominence

#### 3. **Bottom Row** (`.travel-stack__bottom-row`)
- **Left**: Station disc/globe icon
  - Spinning animation preserved
  - Shows favicon or initials
- **Right**: Metadata stack (`.travel-stack__metadata`)
  - Country name (medium, prominent)
  - Language (small)
  - Codec · Bitrate (golden accent)
  - All right-aligned for clean layout
  - Uses `flex-end` alignment

## Flexible Content Handling

### Dynamic Length Support:
- **Station name**: Uses `word-break: break-word` and `-webkit-line-clamp: 2` to handle long names gracefully
- **Metadata**: Each item uses `lineClamp={1}` to prevent overflow
- **Flexbox layout**: `justify-content: space-between` ensures consistent spacing regardless of content size
- **Min-width: 0**: Applied to flex children to prevent overflow issues

### Responsive Adjustments:
```css
@media (max-width: 768px) {
  - Card: 280px × 95px (smaller but still readable)
  - Title: 1.05rem font size
  - Badge: 2.25rem × 1.65rem
  - Deck height: 100px
}
```

## Files Changed

### `/app/routes/components/PlayerCardStack.tsx`
- Replaced `.travel-stack__header` + `.travel-stack__station` + `.travel-stack__info`
- Added `.travel-stack__top-row`, `.travel-stack__title-section`, `.travel-stack__bottom-row`
- Increased flag size: 40px → 56px
- Simplified metadata rendering (no inline dots, cleaner Text components)

### `/app/tailwind.css`
- New badge styling with larger size and better visual weight
- Centered title section with line clamping
- Bottom metadata stack with right alignment
- Updated responsive breakpoints for mobile

## Visual Improvements

1. **Better Hierarchy**: Badge → Title → Metadata creates clear visual flow
2. **More Readable**: Larger title font (1.35rem vs 0.xs) makes station names prominent
3. **Cleaner Layout**: Three distinct zones prevent visual clutter
4. **Flexible**: Handles short and long content gracefully without breaking layout
5. **Professional**: Matches reference card design with polished spacing

## Testing Checklist

- [ ] Verify cards render correctly with short station names (< 10 chars)
- [ ] Test with very long station names (> 50 chars) to ensure line clamping works
- [ ] Check flag positioning stays top-right regardless of content
- [ ] Confirm disc stays bottom-left and doesn't shift
- [ ] Test metadata alignment with missing fields (no language, no bitrate)
- [ ] Verify hover animation still works smoothly
- [ ] Check stamp animation doesn't interfere with layout
- [ ] Test responsive layout on mobile (< 768px width)
