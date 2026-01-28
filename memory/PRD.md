# Waste Tycoon - Product Requirements Document

## Original Problem Statement
Build Waste Tycoon - a UK waste & logistics tycoon game based on detailed spec from WasteTycoon_Build_Pack.zip. Industrial grey dark theme requested.

## User Personas
- **Strategy Gamers**: Players who enjoy logistics and business simulation games
- **Tycoon Enthusiasts**: Fans of building empires and managing resources
- **UK Geography Fans**: Players interested in realistic UK-based gameplay

## Core Requirements (Static)
- Endless sandbox mode (no campaign)
- UK map with Leaflet + OSM tiles
- 5 save slots with autosave every in-game hour
- First depot gating: must buy Small Transport Depot (£50,000) to unlock game
- Start date: 1 Jan 2026
- Monthly billing at midnight on 1st of each month
- Delete save requires typing "GONE"
- Menu order: Map / Contracts / Dispatch / Fleet / Shop / Facilities / Marketplace / Help

## Architecture
- **Frontend**: React 19 + Zustand (state management) + Immer + Leaflet/react-leaflet
- **Backend**: FastAPI (minimal - game state is client-side in localStorage)
- **Storage**: localStorage for save slots

## What's Been Implemented (Jan 28, 2026)

### Phase 1 MVP - Complete ✅
1. **Start Screen**
   - 5 save slot system
   - New Game / Continue buttons
   - Save preview (cash, day, year)

2. **Game Layout**
   - Dark industrial grey theme
   - Left sidebar navigation (8 items)
   - Top bar with cash, date, time, speed controls
   - Page locking until first depot purchased

3. **Map Page**
   - UK Leaflet map with OSM tiles
   - Clustered markers (200+ UK sites)
   - Site details panel on click
   - Buy facility functionality
   - Setup banner for first depot requirement

4. **Save System**
   - 5 slots with localStorage persistence
   - Save/Load functionality
   - Delete with "GONE" confirmation
   - Active slot tracking

5. **All 8 Pages**
   - Map (unlocked from start)
   - Contracts (locked until depot)
   - Dispatch (locked until depot)
   - Fleet (locked until depot)
   - Shop (locked until depot)
   - Facilities (locked until depot)
   - Marketplace (locked until depot)
   - Help (unlocked from start)

6. **Time System**
   - SimRunner game loop
   - Speed controls (1x, 2x, 5x)
   - Pause/Play
   - Date/time progression

7. **Procedural Site Generation**
   - Seeded UK locations (45+ cities)
   - Industrial estates, quarries, retail parks
   - Depot/yard availability per site

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Complete first depot purchase flow with cash deduction
- [ ] Unlock all pages after depot purchase
- [ ] Hire driver workflow
- [ ] Buy vehicle from Shop
- [ ] Accept and complete a contract

### P1 - Important
- [ ] Vehicle condition system
- [ ] Repair workflow
- [ ] Monthly billing implementation
- [ ] Staff wages
- [ ] Lease payment system

### P2 - Nice to Have
- [ ] Quarry material production
- [ ] Building supply passive income
- [ ] Loan system
- [ ] Material marketplace
- [ ] Office points system

## Next Tasks
1. Test first depot purchase flow end-to-end
2. Implement vehicle purchase → dispatch → contract completion flow
3. Add toast notifications for game events
4. Implement monthly billing trigger
