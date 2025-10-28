# Changelog

All notable changes in this iteration (Oct 2025).

## Fixed

- **SceneManager Module Resolution**: Fixed AtlasScene loading error by replacing dynamic string interpolation with explicit scene registry to ensure Vite alias resolution works properly
- **SSR Hydration Issues**: Resolved infinite loops, hydration mismatches, and client/server rendering differences through comprehensive fixes including Zustand SSR stability, deterministic animations, and client-only rendering utilities
- **Card Layout Improvements**: Enhanced travel log card layouts with better spacing, typography, and visual hierarchy including folder tab badges, metadata optimization, and responsive design
- **Travel Log Simplification**: Streamlined travel log from complex interactive player to clean roadmap view, removing redundant controls and excessive animations for better performance and UX

## Added

- Travel Trail player: horizontal strip with inline controls and journey line
- Station normalisation layer (`utils/stations.ts`) for consistent Radio Browser ingestion
- Docs refresh describing the new player lifecycle and API hygiene
- Reliability badges and trending chips on travel trail + station cards

## Improved

- Quick Retune and atlas transitions updated for the always-on travel trail
- Country/station fetches now pass through the normaliser (country loader, explore, surprise, preview)
- README now highlights stream health opportunities and the new architecture
- Station sorting now prioritises healthy/trending streams across recent, explore, and quick-retune flows
- Travel trail integrates the active card into the strip with dotted progress and keyboard access

## Docs

- Consolidated docs under `docs/` with an index and this changelog
- Updated root README links to documentation

## Notes

- Playwright tests updated areas require alignment (see TESTING_GUIDE for running locally). Before merging to main, run tests and update snapshots if UI changes are intentional.
