# Pages & UX

## Layout
- Left sidebar navigation with the fixed menu order.
- Main content panel.
- Top bar shows **Cash** (and later: Rep, day/date, pause).
- Dark UI theme.

## Gating (setup phase)
- On a fresh save, show a setup instruction on Map:
  - "Setup: Buy your first Transport Depot on the Map to unlock the game."
- Until first depot purchase:
  - Hide or disable other pages.
  - If user visits a locked page directly, show a locked screen with a button to go to Map.

## Map
- Leaflet map centered on UK.
- Uses OSM tiles.
- Markers are clustered.
- Click marker → details panel:
  - site name, type, price (if buyable), description
  - “Buy” button if allowed
  - “Focus selected” (zoom/pan to marker)
- Buying rules:
  - First purchase must be a Small Transport Depot at a depot site in an industrial estate.
  - After unlocking, allow buying other facility types if the site supports them.

## Facilities
- Shows owned facilities grouped by type.
- Office points banner at top.
- Facility details page:
  - rename
  - hire/fire staff (and auto-fill minimum staff)
  - compliance manager replacement
  - show compliance, overhead, capacity, requirements

## Shop
- Requires at least one Depot.
- Tabs: fleet / trailers / containers / upgrades.
- Buy or lease items into a selected depot.
- Enforce depot storage capacity.
- Upgrades are per-depot.

## Contracts
- List contracts (no deadlines).
- Contract card shows requirements and payout.
- Accept contract.
- Cancel/fail actions exist (with penalties).

## Dispatch
- Create a job from an accepted contract.
- Must assign:
  - driver
  - vehicle (>=10% condition)
  - container/trailer if required
- Job runs over time; completion triggers payout and inventory changes.

## Fleet
- List vehicles/trailers/containers.
- Condition, location (depot), leased/owned.
- Repair workflow (time-based) when mechanic access available.

## Marketplace
- Shows material prices and owned inventories.
- Dispatch deliveries are required to sell.

## Help
- Rules reference, tutorial notes, save manager.

