# Game Vision

## High concept
**Waste Tycoon** is an **endless sandbox** strategy/management game set in the UK.
You build a waste & logistics company by:
- buying sites (starting with a transport depot)
- growing facilities and staff
- buying/leasing vehicles, trailers, and containers
- running contracts and dispatch jobs
- selling materials and earning passive income from certain sites

## Core pillars
1. **Map-first**: the UK map is the main hub. Sites are bought from the map.
2. **Operational realism, simplified UX**: enough realism to feel authentic (fleet condition, repairs, depots, staff) without heavy simulation micromanagement.
3. **Clear gating**: first depot purchase unlocks the rest of the game.
4. **Stable procedural world**: site mix is seeded per save slot.

## Global decisions / rules (authoritative)
- Mode: **Endless sandbox**.
- Start date: **1 Jan 2026**.
- Map: **full UK Leaflet map** with OSM tiles.
- Site generation:
  - industrial estates yield **Depot OR Yard (never both)**, seeded per save.
  - mechanic garages appear in industrial estates.
  - quarries are buyable.
  - retail parks can have building supply stores.
  - offices do **not** spawn in housing.
- First base requirement:
  - player must buy **Transport Depot (Small)** from an industrial‑estate depot site.
  - price: **£50,000**.
- Pages locked until first depot is owned.
- Contracts:
  - **no deadlines**.
  - may cancel/fail: causes **reputation hit + cash penalty**.
- Staff:
  - **driver required** for jobs.
  - no license gating.
  - wages paid monthly.
  - max 15h/day, 10h rest after.
- Fleet:
  - vehicle condition wears per mile.
  - cannot dispatch vehicles below **10% condition**.
  - repairs require mechanic access (mechanic garages and depot upgrades later) and take time.
  - containers tracked as individual units; no condition.
- Economy:
  - running costs billed monthly using real calendar months.
  - bills trigger at midnight on the 1st.
  - first bill: **1 Feb 2026**.
- Loans:
  - single credit line.
  - weekly flexible payments with **£500 minimum**.
  - interest monthly.
  - missed min payment causes rep hit + higher interest until caught up.
- Materials:
  - materials measured in tonnes.
  - quarry outputs Sandstone/6F2/Type1/Type2.
  - quarries produce **500 t/day**, evenly split.
  - building supplies stores pay **£90k/week fixed**.
  - selling materials requires dispatch delivery.
  - material prices are global fixed.
- Offices:
  - use the Facilities pack “office points/caps/overhead” system.

## Page order (fixed)
1. Map
2. Contracts
3. Dispatch
4. Fleet
5. Shop
6. Facilities
7. Marketplace
8. Help

