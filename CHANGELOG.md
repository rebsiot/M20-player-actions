# Changes — WoD20 Player Magick

## v0.1.4 — 2026-10-15

- Renamed Actors sidebar and Shift+J action to **Player Magick**. The **module ID remains `wod20-player-actions`**.
- The assigned Foundry user character is used by default, ahead of any selected token. Explicit Actor UUID bindings in existing macros continue to override this default. Character selection remains accessible as a secondary option.
- Redesigned the guided casting dialog as a wider, viewport-sensitive layout: three/two/one-column Sphere cards; larger clickable Sphere-rank buttons; collapsed dot-level explanations; consolidated character/Arete/Quintessence header and casting settings; live difficulty preview; optional character change.
- Removed player-facing macro generation, Macro buttons, embedded Item pins, drag-to-hotbar creation, and the hotbarDrop hook. **No user's hotbar is populated, changed or cleared.** Existing macros remain usable through `api.execute`.
- Kept the native WoD20 dice engine, `magic` chat origin, rules/math, Rote handling, native Power delegation, and delayed Quintessence deduction. This module has **no Paradox module dependency or Paradox state changes**.
- Added mock tests for character default, no hotbar side effects, legacy macro execution, and new dialog. No live Foundry test claimed.

## v0.1.3 — 2026-10-12

- Fixed blank Mage chat cards by selecting the supported native WoD20 roll origin `magic` instead of unsupported `arete`.
- Power rolls use native roll origin `power` rather than an unsupported identifier.

## v0.1.2 — 2026-10-12

- Restricted Sphere pickers to the character's known Sphere levels; added expandable per-dot capability guides.
- Added dynamic highlight of selected Sphere tiers and optional effect/focus description.

## v0.1.1 — 2026-10-12

- Fixed Actors sidebar action registration during Foundry v14 startup; registered Shift+J at init and backfilled already-rendered sidebar.
- Added initial character picker/change option when no selected token or assigned character existed.

## v0.1.0 — 2026-10-12

- Initial Player Actions panel, guided Mage/Rote casting, native WoD20 dice bridge, optional Power activation, and explicit hotbar shortcut creation (now paused in v0.1.4).
