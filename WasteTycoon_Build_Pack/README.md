# Waste Tycoon — Build Pack (Send-to-Dev Folder)

This folder is a **complete, self-contained specification + build guide** for creating the Waste Tycoon game (UK waste & logistics tycoon) exactly as defined so far.

## What this pack contains
- **Game Vision & Rules**: the full gameplay spec, page-by-page behavior, economy rules, gating, and progression.
- **Technical Architecture**: React+TS app structure, store design, routing, simulation loop, save system.
- **Data Schema**: authoritative TypeScript shapes for save files and runtime state.
- **Checklists**: build order and acceptance tests.
- **Assets notes**: icon paths and conventions (do not move folders).

## Quick start for a dev
1. Read `spec/01_Game_Vision.md` and `spec/02_Pages_and_UX.md`.
2. Read `tech/01_Architecture.md` and `tech/02_Save_System.md`.
3. Use `spec/04_Data_Schema.ts` as the source of truth.
4. Follow `checklists/Build_Order_Checklist.md`.
5. Validate against `checklists/Acceptance_Tests.md`.

## Non-negotiables (must match)
- **Endless sandbox**.
- Menu order: **Map / Contracts / Dispatch / Fleet / Shop / Facilities / Marketplace / Help**.
- **New game starts 1 Jan 2026**.
- **First base must be a Small Transport Depot** purchased from **industrial-estate depot sites** for **£50,000**.
- Pages hidden/locked until first depot is purchased.
- UK map uses Leaflet + OSM tiles, marker clustering, click → details panel.
- Save system: **5 slots**, **autosave every in‑game hour**, delete requires typing **GONE**.

