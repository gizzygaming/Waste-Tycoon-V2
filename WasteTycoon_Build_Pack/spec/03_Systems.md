# Systems

## Time & Simulation
- Simulation runs in real time with an internal speed multiplier (optional).
- World time tracking:
  - start: 1 Jan 2026
  - monthly billing at 00:00 on the 1st
  - autosave every in-game hour

## Facilities economics
- Facilities have purchase price, overhead, capacity, staff requirements.
- Offices provide **office points** which modify:
  - costs
  - contract prices
  - compliance decay

## Compliance
- Facilities have compliance (0..100).
- Low compliance may close facility.
- Compliance manager impacts compliance behavior.

## Fleet condition & repairs
- Condition decreases with miles/jobs.
- Block dispatch when condition < 10%.
- Repairs require access (mechanic site or depot workshop upgrade).

## Loans
- Single credit line.
- Weekly minimum payment £500.
- Monthly interest. Penalty interest if minimum missed.

## Materials
- Tonnes-based.
- Quarries: 500 t/day evenly split across outputs.
- Building supplies stores: £90k/week passive income.
- Selling requires a dispatch delivery.
- Prices are fixed globally.

