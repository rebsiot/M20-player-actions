# WoD20 Player Magick

**Module ID:** `wod20-player-actions`  
**Release:** v0.1.4 (2026-10-15)  
**Repository:** https://github.com/rebsiot/M20-player-actions

A focused, player-facing Mage: The Ascension 20th Anniversary casting interface for Foundry VTT v14 and the `worldofdarkness` (WoD20) system. The existing module ID is unchanged for compatibility.

## What the player sees

1. Open **Actors > Player Magick** or press **Shift+J**.
2. The panel defaults to the character assigned in Foundry User Configuration (`game.user.character`), whether or not a token is selected. If no usable assigned character exists, an owned selected token is used; otherwise the player can select from characters they own.
3. Click **Improvised Magick**, or choose a **Known Rote** and click Cast. A secondary **Change Character** control appears on the panel and in the casting header.
4. In the wider casting dialog, pick Sphere ranks using large 0-to-known-rating buttons. Rank-by-rank help is collapsed unless requested. Review the calculated difficulty and roll using WoD20's native dice roller.

The casting window scales up to 1020 px wide on a suitable desktop and shrinks with the viewport. Sphere cards display in 3 columns on wide screens, 2 on medium screens, and 1 on narrow screens. The spell details, Arete, Quintessence, and live difficulty preview are kept together and readable.

## Macros and hotbar

**No macro creation or hotbar installation is performed in v0.1.4.** The panel no longer exposes Macro buttons, sheet pin controls, or drag-to-hotbar shortcuts. Existing hotbar layouts are untouched. Previous macros created by v0.1.3 are **not deleted** and can continue to call the stable module API `game.modules.get('wod20-player-actions').api.execute(...)`, but new macros are not offered from the UI. Hotbar workflows may return in a separate later enhancement.

## Independent of Paradox

Player Magick does not read or update Paradox, register a Paradox hook, call the separate Paradox module, or enforce Paradox effects. It casts through WoD20's existing `DiceRollContainer` / `DiceRoller` and produces the native `magic` roll-card type; any other enabled module's reaction to native chat events is outside this module's ownership. We have not changed the native roll/chat contract from v0.1.3.

## Requirements

- Foundry VTT v14 (module also declares minimum v13; v13 has not been live-tested)
- WoD20 system `worldofdarkness` 7.3.1 or later (live compatibility must be verified on your specific installation)
- Player access to an owned Mage PC Actor, including Arete and at least one Sphere

## Install / upgrade

1. Back up the Foundry world, and copy the installed `Z:\Data\modules\wod20-player-actions` directory before replacing it. This update does not run data migrations or modify Actors on load.
2. Stop Foundry before replacing server files.
3. Extract the release ZIP so that `Z:\Data\modules\wod20-player-actions\module.json` exists immediately inside the module directory. Do **not** create a second nested `wod20-player-actions` directory.
4. Restart Foundry. Enable the existing **WoD20 Player Magick** module in the desired world and hard-refresh connected browsers.
5. From a player's account, open Actors > Player Magick; confirm the correct default character and test a basic improvised cast in a test world or copied character.

## Roll and resource behavior

- The module does **not** implement a new dice engine or calculate Paradox.
- Spell rolls use the WoD20 native roller, action origin `magic`, and current Arete. Configured native Willpower spending remains handled by WoD20.
- Casting difficulty continues to use the v0.1.3 formula: highest selected Sphere +3 coincidental, +4 vulgar without Sleepers, +5 vulgar with Sleepers; user situational modifier and optional Quintessence reduction; final difficulty clamped to 3–10.
- If specified, Quintessence is deducted **after** the native roll finishes, using the supported Advantage/Actor data location; no deduction occurs simply by opening the interface.
- Rote Sphere requirements are suggested when the source Item contains recognizable fields, but the player/Storyteller must confirm combinations, scale, and effect requirements.
- Manual Power activation is still available under the collapsed **Other Powers** section for backwards compatibility, without replacing native Item use methods.

## Rollback

Restore your backup of the `wod20-player-actions` module directory or the original `wod20-player-actions-0.1.3.zip`, then restart Foundry and refresh browsers. This release performs no automatic Actor migration or hotbar modifications. Any cast a player actually makes may spend in-game resources; restoring module code does not reverse those in-world changes.

## Testing and known limits

Tests run: JS syntax verification; source-level mock tests for assigned-character resolution, explicit Actor binding for previous macros, casting UI, native roll routing, Power delegation, and no automatic hotbar changes; responsive Chromium rendering at 1440px and 820px viewport widths.

**Live Foundry v14: not yet tested.** The screenshots/render checks are browser fixtures rather than an installed Foundry UI. No independent Paradox test was performed (nor required to test this UI-only release).

See `CHANGELOG.md`, `TEST-REPORT.md`, and `05-HANDOFF-UPDATE-0.1.4.md`.

Fan-made Storyteller tools. Not affiliated with or endorsed by Paradox Interactive. This package includes no paid creator artwork.
