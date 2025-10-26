# 🌍 Radio Passport

**Tune into the world, one passport stamp at a time.**

Radio Passport is a beautiful, web-based radio player that lets you explore and discover radio stations from around the globe. With a curated, passport-stamp-style interface, you can travel the world through sound without leaving your browser.

> Documentation: See the docs index at [docs/README.md](./docs/README.md) for guides, plans, and testing.

![Radio Passport Interface](https://via.placeholder.com/800x400/1a1a1a/ffd700?text=Radio+Passport+Interface)

## ✨ Features

- **🌍 Global Radio Atlas**: Explore radio stations from 80+ countries across 7 continents
- **📻 Massive Station Database**: Access to 50,000+ verified radio stations
- **🎨 Beautiful Interface**: Dark theme with golden accents, inspired by travel and discovery
- **🔍 Smart Search**: Find countries and stations quickly with built-in search
- **⭐ Favorites**: Save your favorite stations for easy access
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **⚡ Fast & Free**: No ads, no subscriptions, just pure radio discovery

## 🚀 Quick Start

### Live Version

**🟡 LIVE BETA** - **[Radio Passport](https://your-deployment-url.com)**

Currently deployed on Vercel and running in live beta with full functionality.

### Local Development

```bash
# Clone the repository
git clone https://github.com/umshere/RadioGarden.git
cd RadioGarden

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 📖 How to Use

1. **Browse Countries**: Scroll through the passport stamp grid or use the search bar to find countries
2. **Select a Country**: Click on any country stamp to see available radio stations
3. **Choose a Station**: Browse through the list of stations and click play on any station
4. **Enjoy**: Listen to live radio from around the world!

### Navigation

- **Home**: Main passport stamp interface
- **Explore**: Discover new stations and countries
- **Favorites**: Your saved stations (coming soon)
- **About**: Learn more about the project

## 🛠️ Technical Details

Built with modern web technologies:

- **Framework**: [Remix](https://remix.run/) - Full-stack React framework
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Mantine](https://mantine.dev/) - React component library
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- **Data Source**: [Radio Browser API](https://www.radio-browser.info/) - Free, community-maintained radio directory
- **TypeScript**: Full type safety across the application
- **Component Architecture**: Modular, reusable component design

### 🏗️ Project Structure

The application follows a clean, modular architecture with **DRY principles** applied throughout:

```
app/
├── components/          # Shared UI components
│   ├── CountryFlag.tsx
│   └── PassportStampIcon.tsx
├── constants/          # App constants and configuration
│   └── brand.ts
├── hooks/              # Custom React hooks (state management)
│   ├── useRadioPlayer.ts        # Audio playback & controls
│   ├── useListeningMode.ts      # World/Local mode toggle
│   ├── useFavorites.ts          # Favorite stations management
│   ├── useRecentStations.ts     # Recently played tracking
│   ├── useHoverAudio.ts         # Preview sound effects
│   ├── useAtlasState.ts         # Country/continent filtering
│   ├── usePlayerCards.ts        # Card stack logic
│   ├── useStationNavigation.ts  # Next/previous controls
│   ├── useAtlasNavigation.ts    # Atlas continent selection
│   ├── useDerivedData.ts        # Computed/memoized data
│   └── useEventHandlers.ts      # Consolidated event handlers
├── routes/             # Route components
│   ├── components/     # Route-specific components
│   │   ├── HeroSection.tsx
│   │   ├── AtlasFilters.tsx
│   │   ├── AtlasGrid.tsx
│   │   ├── CountryOverview.tsx
│   │   ├── PlayerCardStack.tsx
│   │   ├── PassportPlayerFooter.tsx
│   │   ├── QuickRetuneWidget.tsx
│   │   ├── StationCard.tsx
│   │   ├── StationGrid.tsx
│   │   ├── CollapsibleSection.tsx
│   │   └── LoadingView.tsx
│   └── _index.tsx      # Main route (393 lines, down from 1200+)
├── types/              # TypeScript type definitions
│   └── radio.ts
└── utils/              # Utility functions
    ├── geography.ts       # Continent/country mapping
    ├── haptics.ts         # Vibration feedback
    ├── radioBrowser.ts    # API client with fallback
    └── scrollHelpers.ts   # Scroll utilities
```

**Code Quality Improvements (Oct 2025):**

- ✅ **67% reduction** in main route file (1200+ → 393 lines)
- ✅ **11 custom hooks** extract all state management logic
- ✅ **Separated concerns**: UI, state, effects, handlers, derived data
- ✅ **DRY principles** eliminate code duplication
- ✅ **Clean architecture** with clear separation of responsibilities

## 🎯 Implementation Status (Updated Oct 24, 2025)

### ✅ Completed Features

**Radio Browser API Connection Fix**

- Resilient `rbFetchJson` utility with automatic mirror fallback
- Tries multiple servers (de2, fi1, de1, fr1, nl1, gb1, us1)
- Caches working server for performance
- All API calls updated

**Player ↔ Atlas Synchronisation**

- Play controls update continent/country context
- Debounced scrolling (200ms)
- Smooth transitions with `preventScrollReset`

**Shuffle Mode & Scrolling**

- Fixed page jump bugs
- Smooth centering with guards
- Proper null checks

**Quick Retune Improvements**

- No page jumping during selections
- Smooth scroll to station grid
- Consistent navigation behavior

**Listening Mode Toggle**

- Header placement for visibility
- World/Local mode switching
- Visual feedback animations

**Skeleton UI & Loading States**

- Shimmer animations
- Request-state driven
- Prevents layout shifts

**User Journey Revamp**

- Streamlined from 6 to 4 buttons
- Hero: "Start Your Journey" + "Quick Retune"
- Mission Card: "Explore World" + "Explore [Country]"
- Clear, contextual flow

### 📋 Next Steps

**E2E Tests:** Skeleton states, mode toggle, scroll behavior, cross-browser  
**UX Polish:** Tooltips, ARIA labels, copy refinement

## 🌟 Key Statistics

- **80** Countries Featured
- **50,520** Stations Tracked
- **7** Continents Covered
- **24/7** Live Streaming

- **80** Countries Featured
- **50,520** Stations Tracked
- **7** Continents Covered
- **24/7** Live Streaming
- **50,520** Stations Tracked
- **7** Continents Covered
- **24/7** Live Streaming

## 🤝 Contributing

Radio Passport is an open-source project. Contributions are welcome!

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/RadioGarden.git
cd RadioGarden

# Install dependencies
npm install

# Start development
npm run dev
```

### Areas for Contribution

New UI themes and designs
Additional station sources
Mobile app development
Performance optimizations
Localization support
Unit tests for components
End-to-end testing improvements
Accessibility enhancements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚖️ Legal Considerations

**Radio Passport** uses publicly available radio streams and the free Radio Browser API. However, be aware of:

- **Radio Station Content**: Individual radio stations own their content and may have geographic restrictions
- **Name Trademark**: "Radio Passport" should be checked for trademark availability in your jurisdiction
- **Fair Use**: This application provides access to public streams but doesn't host or redistribute content
- **API Terms**: Radio Browser API is free for non-commercial use; check their terms for commercial deployment

**Recommendation**: Consult with a legal professional before commercial deployment to ensure compliance with local regulations and copyright laws.

## 🙏 Acknowledgments

- **Radio Browser**: Free API providing radio station data
- **Remix Team**: Amazing full-stack framework
- **Open Source Community**: For the incredible tools and libraries

---

**Made with ❤️ for radio lovers everywhere**
