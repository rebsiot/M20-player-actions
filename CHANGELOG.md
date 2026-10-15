# Changes — WoD20 Player Magick

## v0.1.6 — 2026-10-15
- **Fixed:** Remember the last character explicitly chosen via **Change Character** in a Foundry v14 user-scoped setting (per player, per world; survives logout and changing devices). Before any explicit choice, use the assigned Foundry character as before. Validate ownership whenever restoring a saved character.
- **Fixed:** Native `magic` chat rolls include the exact localized WoD20 Coincidental/Vulgar casting label so the independent Dice Improvements v0.2.0 Paradox-die listener can recognize the casting roll. The v0.1.5 `Reality:` note is retained alongside the label.
- **Preserved:** Only one native WoD20 Arete roll per cast. No new Paradox engine, flags, accounting, or duplicate listeners. Explicitly bound macros still target their original Actor. The optional Player Magick launcher remains; no hotbar assignment is made.
- **Upgrade/rollback:** Safe module-only code update, no Actor or chat migration. Back up the module folder and world. To roll back, restore v0.1.5 files; existing per-user preferences remain harmless but are ignored by v0.1.5.
- **Automated tests:** Six Node mock/contract tests, JavaScript syntax, ZIP CRC and module metadata passed.
- **Live Foundry:** Not yet tested. Validate actor switching across reopen/relogin, then a native spell chat card on a Mage with existing Paradox using Dice Improvements v0.2.0 (old Paradox module disabled).

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

## v0.1.5 — 2026-10-15
- Create exactly one optional `Player Magick` launcher Macro in the world Macro Directory when a GM loads the module.
- Players may drag it to a hotbar manually; never automatically assign any hotbar slot.
- Existing macros and duplicate-name entries are preserved without overwrites.
- No changes to WoD20 native rolls or Paradox interaction.