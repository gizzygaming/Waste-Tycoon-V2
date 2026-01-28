# Save System

## Requirements
- 5 slots.
- Autosave every in-game hour to active slot.
- Manual save button.
- Slot list shows name + timestamp.
- No “wipe all”.
- Deleting a slot requires typing exactly: **GONE**.

## Storage
- Use localStorage or indexedDB.
- Each slot stores:
  - `SaveSlotMeta`
  - `SaveGame`
- Schema is in `spec/04_Data_Schema.ts`.

## Autosave rules
- Autosave should not interrupt gameplay.
- If active slot is null (new session), prompt the user to pick a slot.

