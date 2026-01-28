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

## What's Been Implemented

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
- **MOBILE RESPONSIVE**: Hamburger menu, collapsible sidebar, responsive layouts

#### 3. Map Page (Full Implementation)
- UK Leaflet map with OSM tiles
- 200+ procedurally generated UK sites across 45+ cities
- Site types: Industrial estates, Quarries, Retail parks, etc.
- Quick site selector dropdown (fallback for marker clicks)
- Site filters (All/Depots/Industrial/Quarries/Owned)
- Facility purchase flow with size selection (Small/Medium/Large)
- **PNG ICONS for facilities** (transport depot, quarry, office, etc.)
- **PNG ICONS for vehicles** (small tipper, large tipper, skip truck, grab lorry, artic unit)
- **VEHICLE TRACKING**: Owned vehicles shown on map during active jobs
- **ROUTE POLYLINES**: Blue dashed lines showing vehicle routes
- **VEHICLE ANIMATION**: Vehicles move along routes as jobs progress

#### 4. Shop Page
- Buy outright or Lease toggle
- Vehicles: Small Tipper, Large Tipper, Skip Truck, Grab Lorry, Artic Unit
- Trailers: Flatbed, Tipper, Walking Floor
- Containers: Skips (8/12/16 yd), RoRo (20/40 yd)
- Depot storage capacity tracking
- Price display with "Need £X more" warning
- Mobile responsive grid layout

#### 5. Contracts Page
- Contract generation (Skip Hire, Grab Collection, Work Haulage)
- Accept/Cancel functionality with penalties
- Filter tabs (Available/Active/Completed)
- Stats: Available count, Active count, Pending Payment, Total Earned
- Requirements display (Driver, Vehicle type, Tonnes)
- Mobile responsive with 2-column stats grid

#### 6. Dispatch Page
- 3-step job creation: Contract → Driver → Vehicle
- Progress tracking with percentage bar
- Active Jobs panel with live updates
- Recent Completed panel
- Status indicators: "All drivers on jobs", "Vehicle in repair"
- **JOB PROGRESS SYSTEM**: Jobs progress through statuses:
  - en_route_pickup → loading → en_route_delivery → unloading → returning → completed
- **AUTOMATIC COMPLETION**: Jobs complete and pay out automatically

#### 7. Fleet Page
- Tabs: Vehicles / Trailers / Containers
- Vehicle condition bar with color coding
- Repair button (requires mechanic garage, £50/point)
- Sell button with confirmation (60% value × condition)
- Leased badge and On Job indicators
- Mobile responsive grid

#### 8. Facilities Page
- Facility list with selection
- Rename functionality
- Staff management (hire/fire)
- 11 staff roles with different hire costs and wages
- Compliance and Capacity bars
- Monthly costs calculation (overhead + wages)
- Mobile responsive layout

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
7. **Vehicle appears on map** with route polyline
8. **Job progresses through statuses** automatically
9. Job completes automatically → Get paid!
10. Vehicle condition degrades → Repair if needed
11. Monthly bills deducted → Manage cash flow
12. Expand empire: more depots, vehicles, staff, contracts!

## Test Results (iteration_3.json)
- **100% pass rate** (24/24 tests passed)
- Full end-to-end flow verified
- Mobile responsiveness verified at 375px
- PNG icons for vehicles and facilities working
- Vehicle markers on map during active jobs
- Route polylines visible
- Dispatch job completion working
- Cash properly deducted/added at each step

## Remaining P2 Features (Nice to Have)
- [ ] Driver fatigue system (15h max, 10h rest)
- [ ] Contract deadlines
- [ ] Weather effects
- [ ] Fuel costs
- [ ] Multiple regions unlock
- [ ] Real routing API integration (currently simulated)

## Latest Update: January 28, 2026
- Added mobile responsive design with hamburger menu
- Added PNG icons for all vehicle types
- Added PNG icons for all facility types  
- Fixed dispatch system - jobs now complete properly
- Added vehicle tracking on map during active jobs
- Added route visualization with polylines
- Added vehicle position animation along routes
