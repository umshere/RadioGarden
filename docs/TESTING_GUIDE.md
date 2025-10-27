# Radio Passport - UX Testing Guide

## Quick Start

The development server is running at: **http://localhost:5174/**

## Testing Checklist

### ✅ Navigation & Layout

#### Sticky Navigation Bar

- [ ] **Load the homepage** - Navigation bar should be visible at the top
- [ ] **Scroll down** - Navigation bar stays fixed at the top with backdrop blur
- [ ] **Click "Home"** - Returns to top of page
- [ ] **Click "Explore"** - Smooth scrolls to atlas section
- [ ] **Hover over "Favorites"** - Shows disabled state with tooltip "Coming soon"
- [ ] **Hover over "About"** - Shows disabled state with tooltip "Coming soon"
- [ ] **Click logo** - Returns to world view (resets country selection)
- [ ] **Toggle listening mode** - Switch between Local/World modes smoothly

#### Mobile Navigation (Resize to <640px)

- [ ] Nav links (Home/Explore/Favorites/About) are hidden
- [ ] Listening mode toggle remains visible
- [ ] Logo scales properly
- [ ] "Live beta" badge hidden on mobile

---

### ✅ Hero Section & Search

#### Hero Display

- [ ] **Hero section displays** with animated stamp icons floating
- [ ] **Tagline rotates** every ~6 seconds
- [ ] **Ticker updates** with station info
- [ ] **Metrics cards** show correct counts (Countries, Stations, Continents)
- [ ] **Preview station card** displays with equalizer animation

#### Primary Actions

- [ ] **"Start Your Journey"** button - Smooth scrolls to atlas section
- [ ] **"Quick Retune"** button - Opens country picker modal
- [ ] ❌ No duplicate "Explore World" or "Explore Local" buttons (should be removed)

#### Search Bar

- [ ] **Type in search field** - Results filter instantly
- [ ] **Active search shows** "Filtering active" badge
- [ ] **Border color changes** when search is active (more vibrant teal)
- [ ] **Clear search** - Results reset to show all countries
- [ ] **Search placeholder** reads "Search countries (instant results)"
- [ ] Focus state shows proper shadow and border transition

---

### ✅ Atlas & Country Selection

#### Continent Filters

- [ ] **Click continent filter** - Countries list updates instantly
- [ ] **Visual feedback** - Active filter is highlighted
- [ ] **Click "All Regions"** - Shows all countries again
- [ ] Continent icons display correctly

#### Country Cards

- [ ] **Hover over card** - Card lifts slightly (y: -6px)
- [ ] **Click anywhere on card** - Navigates to country detail
- [ ] **Country flag displays** properly
- [ ] **Station count badge** shows correct number
- [ ] Cards display in responsive grid (1→2→3 columns)

#### Country Grid Layout

- [ ] Mobile: 1 column
- [ ] Tablet (640px+): 2 columns
- [ ] Desktop (1024px+): 3 columns

---

### ✅ Travel Trail & Player

#### Travel Trail (Desktop & Mobile)

- [ ] Trail is always visible beneath the country overview (no collapsible queue)
- [ ] Active card is larger, shows Resume/Next CTA buttons
- [ ] Non-active cards show station name, index chip, and "Tap to tune" hint
- [ ] Dotted journey line animates across the trail
- [ ] Hovering/focusing a card previews it without auto-playing
- [ ] Clicking a card tunes the station and keeps the trail centered on it
- [ ] Favorite icon highlights when station is saved
- [ ] Reliability badge (green/amber/red) appears when Radio Browser provides health info
- [ ] Trending badge appears for stations with positive click trend

#### Travel Trail Overflow

- [ ] Trail scrolls horizontally when >4 stations are present
- [ ] Active card auto-centers during playback changes
- [ ] Keyboard arrow keys (left/right) move between cards when trail is focused
- [ ] Cards without streams show "Visit homepage" footers instead of play prompts

#### Minimal Player Card (Small screens)

- [ ] Resume/Next buttons remain accessible inside each active card
- [ ] Trail cards retain 44px minimum tap targets and respond to touch scrolling

---

### ✅ Station Grid & Playback

#### Station Selection

- [ ] **Click station** - Starts playing immediately when stream is available
- [ ] **Travel trail** adds the station (or reorders it to the front)
- [ ] **Stations without streams** show “Visit station” cta instead of play
- [ ] **Now playing** updates in player footer

#### Station Grid Display

- [ ] Stations display in responsive grid
- [ ] Station metadata (bitrate, codec, country) visible
- [ ] Country flags render correctly
- [ ] Skeleton loading states show while fetching

---

### ✅ Player Footer (Sticky)

#### Desktop Player (> 768px)

- [ ] **Player footer** sticks to bottom of viewport
- [ ] **All controls visible** in single row
- [ ] **Avatar size** is 86x86px
- [ ] **Equalizer bars** animate when playing
- [ ] **Controls layout**: Back | Shuffle | Prev | Play/Pause | Next | Close

#### Mobile Player (< 768px)

- [ ] **Player footer** adjusts padding (p-4)
- [ ] **Avatar size** is 72x72px
- [ ] **Controls wrap** and center properly
- [ ] **All buttons** have 44px minimum touch target
- [ ] **Play/Pause button** is larger (52x52px minimum)
- [ ] **Quick Retune** button easily accessible

#### Player Controls

- [ ] **Play/Pause** - Toggles playback smoothly
- [ ] **Next** - Skips to next station
- [ ] **Previous** - Goes to previous station
- [ ] **Shuffle** - Toggles random mode (visual indicator)
- [ ] **Quick Retune** - Opens country picker
- [ ] **Back to World** - Exits country view
- [ ] **Close (X)** - Dismisses player
- [ ] All controls have proper tooltips

#### Player States

- [ ] **Playing state** - Equalizer animates, pause button shows
- [ ] **Paused state** - Equalizer static, play button shows
- [ ] **No stations** - Next/Prev disabled appropriately
- [ ] **Shuffle mode** - Button highlighted with gold tint

---

### ✅ Quick Retune Modal

#### Modal Behavior

- [ ] **Click "Quick Retune"** - Modal opens with smooth animation
- [ ] **Backdrop** appears and blurs background
- [ ] **Click backdrop** - Closes modal
- [ ] **Click X button** - Closes modal
- [ ] **ESC key** - Closes modal (if implemented)

#### Country Selection

- [ ] **Continent filters** work in modal
- [ ] **Top countries** display with flags
- [ ] **Click country** - Navigates to country + closes modal
- [ ] **"Surprise Me"** - Picks random country
- [ ] Modal scrolls properly if many countries

---

### ✅ Touch & Mobile Interactions

#### Touch Targets (44px minimum - WCAG AAA)

- [ ] All buttons meet 44x44px minimum
- [ ] Primary play button is 52x52px
- [ ] Navigation links have proper spacing
- [ ] Country cards are easily tappable
- [ ] Player controls are thumb-reachable

#### Swipe Gestures

- [ ] **Swipe left on player** - Next station
- [ ] **Swipe right on player** - Dismiss player (or previous)
- [ ] **Swipe on card stack** - Navigate cards
- [ ] Gestures feel responsive with visual feedback

#### Responsive Breakpoints

- [ ] **< 640px (mobile)**: Single column layouts, simplified nav
- [ ] **640px-1024px (tablet)**: 2-column grids, fuller nav
- [ ] **> 1024px (desktop)**: 3-column grids, full experience

---

### ✅ Accessibility Testing

#### Keyboard Navigation

- [ ] **Tab through all controls** - Proper focus order
- [ ] **Enter/Space activates** buttons and links
- [ ] **Focus indicators** visible on all interactive elements
- [ ] **Arrow keys** work in appropriate contexts

#### Screen Reader Testing (VoiceOver/NVDA)

- [ ] **Navigation links** announced correctly
- [ ] **Buttons** have descriptive labels
- [ ] **Player state** announced (playing/paused)
- [ ] **Modal** announced as dialog
- [ ] **Live regions** update appropriately
- [ ] **Images** have alt text

#### ARIA Attributes

- [ ] aria-label on buttons without visible text
- [ ] aria-pressed on toggle buttons (shuffle, listening mode)
- [ ] aria-expanded on dropdowns/modals
- [ ] aria-current on active nav links
- [ ] aria-live for status updates

---

### ✅ Visual Feedback & Animations

#### Hover States

- [ ] **Buttons scale/glow** on hover
- [ ] **Country cards lift** on hover
- [ ] **Links** show underline animation
- [ ] **Player controls** show scale effect

#### Loading States

- [ ] **Navigation indicator** shows when changing routes
- [ ] **Skeleton screens** appear when loading stations
- [ ] **Spinner/progress** on data fetching
- [ ] **Smooth transitions** between states

#### Animations

- [ ] **Hero section** fades in on load
- [ ] **Cards** stagger in on scroll
- [ ] **Modal** slides in smoothly
- [ ] **Player** springs up from bottom
- [ ] **Equalizer bars** animate realistically
- [ ] No janky or jumpy animations

---

### ✅ Content & Copy

#### Button Text Clarity

- [ ] "Start Your Journey" (not just "Start")
- [ ] "Quick Retune" (clear purpose)
- [ ] Travel trail footer shows "Explore world" toggle
- [ ] Travel trail footer shows "Stay local" toggle with current country context
- [ ] "Play now" / "Pause" / "Resume" (contextual)

#### Tooltips & Help Text

- [ ] All icon-only buttons have tooltips
- [ ] Tooltips appear on hover/focus
- [ ] Help text is concise and clear
- [ ] Disabled elements explain why

---

### ✅ Error Handling

#### Empty States

- [ ] **No search results** - Helpful message + clear filters option
- [ ] **No stations** - Appropriate fallback
- [ ] **Failed to load** - Error message with retry

#### Network Issues

- [ ] **API errors** handled gracefully
- [ ] **Timeout errors** show retry option
- [ ] **Broken images** have fallback placeholders

---

### ✅ Performance

#### Load Times

- [ ] **Initial page load** < 3 seconds
- [ ] **Route transitions** feel instant
- [ ] **Search results** update immediately
- [ ] **Images** lazy load where appropriate

#### Smooth Scrolling

- [ ] **Scroll to sections** is smooth
- [ ] **No layout shifts** during load
- [ ] **Animations at 60fps** (no jank)
- [ ] **Player footer** doesn't cause reflows

---

## Device-Specific Testing

### iPhone (Safari)

- [ ] All touch targets work
- [ ] Player controls accessible
- [ ] Swipes feel natural
- [ ] Viewport scaling correct
- [ ] No bounce scrolling issues

### Android (Chrome)

- [ ] All touch targets work
- [ ] Player controls accessible
- [ ] Swipes feel natural
- [ ] Viewport scaling correct

### iPad/Tablet

- [ ] Layout uses 2-column grids
- [ ] Touch targets adequate
- [ ] Player size appropriate
- [ ] Landscape/portrait both work

### Desktop (Chrome/Firefox/Safari)

- [ ] Hover states work
- [ ] Keyboard navigation functional
- [ ] Mouse interactions smooth
- [ ] Window resizing doesn't break layout

---

## Bug Reporting Template

If you find issues, report them with:

```markdown
**Issue:** [Brief description]
**Location:** [Page/component]
**Device:** [iPhone/Android/Desktop, etc.]
**Browser:** [Safari/Chrome/Firefox]
**Steps to Reproduce:**

1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** [If applicable]
```

---

## Success Criteria

The app passes testing if:

- ✅ All primary user journeys complete without friction
- ✅ Navigation is always accessible and clear
- ✅ Touch targets meet WCAG AAA standards (44px)
- ✅ Animations are smooth (60fps)
- ✅ Search and filters work instantly
- ✅ Player is always accessible and functional
- ✅ Mobile experience is optimized
- ✅ Accessibility features work with screen readers
- ✅ No critical errors in console
- ✅ Loading states provide clear feedback

---

## Notes

- Development server: http://localhost:5174/
- The app is already running - just open the URL above
- Use browser dev tools to simulate mobile devices
- Test with keyboard only (no mouse) for accessibility
- Try different screen sizes from 320px to 1920px
- Check console for any errors or warnings

Happy testing! 🎧🌍
