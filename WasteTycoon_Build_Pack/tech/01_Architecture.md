# Technical Architecture

## Tech stack
- Vite + React + TypeScript
- Zustand store + Immer middleware
- React Router
- Leaflet + react-leaflet (+ marker clustering)

## App structure (recommended)
- `src/components/Layout.tsx` — sidebar + top bar + outlet
- `src/components/SimRunner.tsx` — simulation tick + billing + autosave
- `src/game/store/useGameStore.ts` — single root store
- `src/game/save/*` — save/load per slot
- `src/pages/*` — Map/Contracts/Dispatch/Fleet/Shop/Facilities/Marketplace/Help

## Store design
- **One root store** containing all slices.
- Slices should map into the schema defined in `spec/04_Data_Schema.ts`.
- Avoid adding top-level keys that clash across packs.

## Simulation loop
- Tick runs when not paused.
- Adds dt seconds to `world.totalGameSeconds` and `world.secondsToday`.
- Rolls day/year forward when exceeding 86400.
- Monthly bills:
  - detect month boundary at 00:00 on the 1st
  - charge monthly overhead
  - first bill must occur 1 Feb 2026
- Autosave every in-game hour:
  - if `world.totalGameSeconds - lastAutosaveGameSeconds >= 3600` → autosave active slot

