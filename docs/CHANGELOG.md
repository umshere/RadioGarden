# Changelog

All notable changes in this iteration (Oct 2025).

## Added

- Collapsible panels for Player queue and Stations list (mobile & desktop)
- Country card inline preview (play top station without navigation)
- Atlas navigation spinner overlay while country page is loading
- Station favorites: heart toggle, persistent via localStorage, favorites highlight
- Subtle haptic feedback for play/favorite on supported devices

## Improved

- Sticky header search and listening mode visibility
- Player footer accessibility labels (Next/Previous)
- Country grid and station grid visual polish

## Docs

- Consolidated docs under `docs/` with an index and this changelog
- Updated root README links to documentation

## Notes

- Playwright tests updated areas require alignment (see TESTING_GUIDE for running locally). Before merging to main, run tests and update snapshots if UI changes are intentional.
