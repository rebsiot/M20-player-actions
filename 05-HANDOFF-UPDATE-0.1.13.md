# 05 — Player Actions handoff update v0.1.13

**Owning component:** `wod20-player-actions` (Player Actions). **Repository:** `https://github.com/rebsiot/M20-player-actions`.

## Baseline / source

Built from user-provided source ZIP `wod20-player-magick-0.1.12.zip` and matched published GitHub `main` v0.1.12 merge `c0198e71f39599f163190b4b6365771ef3303119`. All prior v0.1.12 Player Magick and Basic Actions features remain. The user's current request was a draggable player Macro compendium containing the 20 Basic Actions, custom slots, Dodge, Attack, Player Magick and useful additional shortcuts.

## Implementation

- On the **first GM ready** event in a world with v0.1.13 enabled, native Foundry `CompendiumCollection.createCompendium` creates world Macro compendium **Player Actions — Hotbar Macros** (`world.wod20-player-actions-macros`) and `Macro.createDocuments` writes **39** stable Script Macro definitions. World compendium, not a static module LevelDB asset; it persists if the module is disabled. No automatic hotbar assignment.
- 20 predefined Basic Actions are exactly the dashboard actions and reference shared public `rollPresetAction` API, so any fix or changes to the central roll code flows to all shortcuts. Five custom macro slots call `rollCustomShortcut`, reading **per-player per-Actor** saved definitions at execution (and opening config editor for an empty slot). The Macro uses no hardcoded Actor UUID.
- Includes **Basic Actions**, **Roll Any Check**, **Player Magick**, **Improvised Magick**, **Rotes & Powers**, **Attack (Choose Type)**, direct **Brawl Attack/Melee Attack/Firearms Attack**, **Dodge**, **Block**, **Parry**, **Initiative** and **Character Sheet (Weapon / Soak)**. Standard direct checks default difficulty 6. Attack chooser selects method/difficulty/Willpower but doesn't handle damage. Initiative uses native WoD20 `CombatHelper.RollInitiative`. Sheet shortcut delegates weapon-specific damage/soak rather than inventing equipment rules.
- GM token-first/last token Actor choice and player saved/assigned default remain unchanged; explicit older actor-bound Rote macros untouched. Actual rolls go through existing native WoD20 `DiceRoller` (except native Initiative helper); separate Dice Improvements/Paradox ownership preserved.
- Create-once and safe-upgrade ledger: hidden `macroCatalogInstalledIds` world setting records shipped macro IDs. Previously created macros aren't renamed, rewritten, duplicated, or automatically restored if deleted; new versions may add **new** IDs. Existing unrelated compendium using the reserved ID is untouched; existing Macro Directory launchers are not touched.
- Pack ownership is PLAYER/TRUSTED **OBSERVER**, GM **OWNER** and initially locked. Script Macro execution depends on Foundry core `MACRO_SCRIPT` permission. Players can drag from Compendium Packs onto their own hotbars.

## Testing / release

- Module-source syntax and existing Node regression tests plus new `tests/macro-compendium.cjs` mock test cover all macro ID uniqueness, syntax/paths, compendium creation, permissions, idempotence, GM removals, player non-creation, no hotbar assignments, and native roll API. These are mocks, **not live Foundry**.
- All 162 SVG icon files are included, same CC BY artist attribution and custom icon selection. Release ZIP path remains `wod20-player-magick-0.1.13.zip`; manifest stable URL remains main's raw `module.json`.
- Initial live smoke test: GM loads world, checks `Player Actions — Hotbar Macros` visible; player sees pack, drags **Notice**, **Dodge**, **Attack (Choose Type)** and **Player Magick** to their own hotbar, rolls with their assigned PC, confirms chat headings/one native roll, tests GM last unlinked token, and confirms all original hotbar slots untouched. Test after world backup.
- Backup **world data and** `Z:\Data\modules\wod20-player-actions`. Roll back module code by reinstalling v0.1.12. The world Macro compendium deliberately persists across code rollback, and deleting it is an independent GM operation.
- Owns only module 05; no shared dice, compendium reference, or Actor schema change. Review `GLOBAL-03` for deployment procedures. Do not merge/publish until user approves.
