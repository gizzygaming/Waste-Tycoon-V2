# Waste Tycoon - Product Requirements Document

## Original Problem Statement
Build Waste Tycoon - complete UK waste & logistics tycoon game based on detailed spec from WasteTycoon_Build_Pack.zip. Industrial grey dark theme. Endless sandbox mode.

## User Personas
- **Strategy Gamers**: Players who enjoy logistics and business simulation games
- **Tycoon Enthusiasts**: Fans of building empires and managing resources
- **UK Geography Fans**: Players interested in realistic UK-based gameplay

## Core Requirements (Static)
- Endless sandbox mode (no campaign)
- UK map with Leaflet + OSM tiles
- 5 save slots with autosave every in-game hour
- First depot gating: must buy Small Transport Depot (£50,000) to unlock game
- Start date: 1 Jan 2026, 08:00
- Monthly billing at midnight on 1st of each month (first bill Feb 2026)
- Delete save requires typing "GONE"
- Menu order: Map / Contracts / Dispatch / Fleet / Shop / Facilities / Marketplace / Help

## Architecture
- **Frontend**: React 19 + Zustand (state management) + Immer + Leaflet/react-leaflet
- **Backend**: FastAPI (minimal - game state is client-side in localStorage)
- **Storage**: localStorage for save slots

## What's Been Implemented (Jan 28, 2026)

### COMPLETE GAME - ALL FEATURES ✅

#### 1. Start Screen & Save System
- 5 save slot system with preview (cash, day, year)
- New Game / Continue buttons
- Delete requires typing "GONE"
- Autosave every in-game hour

#### 2. Game Layout
- Dark industrial grey theme (Barlow Condensed / JetBrains Mono fonts)
- Left sidebar with 8 navigation items
- Top bar: Cash display, Date/Time, Speed controls (1x/2x/5x/10x), Save button
- Page locking until first depot purchased
- Real-time notifications system

#### 3. Map Page (Full Implementation)
- UK Leaflet map with OSM tiles
- 200+ procedurally generated UK sites across 45+ cities
- Site types: Industrial estates, Quarries, Retail parks, etc.
- Quick site selector dropdown (fallback for marker clicks)
- Site filters (All/Depots/Industrial/Quarries/Owned)
- Facility purchase flow with size selection (Small/Medium/Large)

#### 4. Shop Page
- Buy outright or Lease toggle
- Vehicles: Small Tipper, Large Tipper, Skip Truck, Grab Lorry, Artic Unit
- Trailers: Flatbed, Tipper, Walking Floor
- Containers: Skips (8/12/16 yd), RoRo (20/40 yd)
- Depot storage capacity tracking
- Price display with "Need £X more" warning

#### 5. Contracts Page
- Contract generation (Skip Hire, Grab Collection, Work Haulage)
- Accept/Cancel functionality with penalties
- Filter tabs (Available/Active/Completed)
- Stats: Available count, Active count, Pending Payment, Total Earned
- Requirements display (Driver, Vehicle type, Tonnes)

#### 6. Dispatch Page
- 3-step job creation: Contract → Driver → Vehicle
- Progress tracking with percentage bar
- Active Jobs panel with live updates
- Recent Completed panel
- Status indicators: "All drivers on jobs", "Vehicle in repair"

#### 7. Fleet Page
- Tabs: Vehicles / Trailers / Containers
- Vehicle condition bar with color coding
- Repair button (requires mechanic garage, £50/point)
- Sell button with confirmation (60% value × condition)
- Leased badge and On Job indicators

#### 8. Facilities Page
- Facility list with selection
- Rename functionality
- Staff management (hire/fire)
- 11 staff roles with different hire costs and wages
- Compliance and Capacity bars
- Monthly costs calculation (overhead + wages)

#### 9. Marketplace Page
- Material prices table (Buy/Sell per tonne)
- Inventory by facility with sell functionality
- Total inventory value display
- Quarry production info

#### 10. Help Page
- Save Manager with all slot operations
- Loan System (take/repay, £10k-£500k, 2% monthly)
- Game Rules reference (Getting Started, Time & Billing, Fleet, Contracts, Passive Income, Loans)

#### 11. Time System
- SimRunner game loop with requestAnimationFrame
- Speed multipliers: 1x, 2x, 5x, 10x
- Pause/Play toggle
- Day/Year progression
- Monthly billing (overhead + staff wages)
- Weekly processes (lease payments, passive income)

#### 12. Business Systems
- Vehicle condition wear (0.15%/km)
- Repair system (requires mechanic garage)
- Staff wages (monthly)
- Facility overhead (weekly × 4 for monthly)
- Loan system with interest (2% normal, 5% penalty)
- Reputation system (gains on job completion, losses on cancellation)

#### 13. Passive Income
- Quarries: 500t/day (125t each: Sandstone, 6F2, Type1, Type2)
- Building Supply Stores: £90,000/week

## Complete Game Flow (Tested & Working)
1. Start new game (£100,000 starting cash)
2. Buy Transport Depot (£50,000) → Game unlocks
3. Buy Vehicle (e.g., Small Tipper £35,000)
4. Hire Driver (£2,000 hire cost)
5. Accept Contract (e.g., Work Haulage £850)
6. Dispatch Job (assign driver + vehicle)
7. Job completes automatically → Get paid!
8. Vehicle condition degrades → Repair if needed
9. Monthly bills deducted → Manage cash flow
10. Expand empire: more depots, vehicles, staff, contracts!

## Test Results
- Full end-to-end flow verified
- Cash properly deducted/added at each step
- Notifications appear for all actions
- Vehicle condition wears and can be repaired
- Job progress tracking works
- Time controls function correctly

## Remaining P2 Features (Nice to Have)
- [ ] Driver fatigue system (15h max, 10h rest)
- [ ] Contract deadlines
- [ ] Weather effects
- [ ] Fuel costs
- [ ] Multiple regions unlock

## Date: January 28, 2026
