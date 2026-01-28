# Acceptance Tests

A dev must pass these before calling the build “done”.

## Setup & gating
1. Start a fresh save slot.
2. Only Map is usable; other pages are locked/hidden.
3. Map shows setup help message.
4. Buy first facility:
   - must be Transport Depot (Small)
   - cost £50,000
5. After buying depot, all pages unlock.

## Map
- Clusters appear and expand.
- Clicking a site opens details.
- Focus selected zooms/pans.

## Facilities
- Facility list shows depot.
- Facility details loads.
- Renaming works.
- Staff hire/fire works.

## Shop
- Depot dropdown shows the owned depot.
- Can buy a vehicle into depot (storage decreases).
- Can lease a vehicle (deposit deducted).

## Contracts & Dispatch
- Can accept a contract.
- Dispatch requires driver and eligible vehicle.
- Vehicle with condition <10% is blocked.
- Completing job pays out and reduces condition.

## Time-based systems
- Autosave triggers every in‑game hour.
- Monthly billing triggers at 00:00 on the 1st.
- First bill occurs 1 Feb 2026.

## Save/Load
- Save slot shows timestamp.
- Load restores game state.
- Delete requires typing GONE.

