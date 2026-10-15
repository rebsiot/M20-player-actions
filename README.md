# WoD20 Player Magick

**Module ID:** `wod20-player-actions`  
**Release:** v0.1.7 (2026-10-15)  
**Repository:** https://github.com/rebsiot/M20-player-actions

A focused, player-facing Mage: The Ascension 20th Anniversary casting interface for Foundry VTT v14 and the `worldofdarkness` (WoD20) system. The existing module ID is unchanged for compatibility.

## What the player sees

1. Open **Actors > Player Magick** or press **Shift+J**.
2. **First launch:** use the character assigned in Foundry User Configuration (`game.user.character`), regardless of token selection. **After Change Character:** remember the player's manually selected Actor across future opens and reconnects, using a hidden Foundry v14 `user`-scope setting (per user, per world). If that Actor is deleted or the player loses ownership, fall back to the assigned character, then an owned selected token, or the chooser.
3. Click **Improvised Magick**, or choose a **Known Rote** and click Cast. A secondary **Change Character** control appears on the panel and in the casting header.
4. In the wider casting dialog, pick Sphere ranks using large 0-to-known-rating buttons. Rank-by-rank help is collapsed unless requested. Review the calculated difficulty and roll using WoD20's native dice roller.

The casting window scales up to 1020 px wide on a suitable desktop and shrinks with the viewport. Sphere cards display in 3 columns on wide screens, 2 on medium screens, and 1 on narrow screens. The spell details, Arete, Quintessence, and live difficulty preview are kept together and readable.

## Macros and hotbar

**One world Macro called `Player Magick` is created once by the GM, available in the Macro Directory. No hotbar installation is performed.** Players can drag that launcher Macro onto their hotbars if they want. The panel no longer exposes per-Rote Macro buttons, sheet pin controls, or drag-to-hotbar shortcuts. Existing hotbar layouts are untouched. Previous macros created by v0.1.3 are **not deleted** and can continue to call the stable module API `game.modules.get('wod20-player-actions').api.execute(...)`, but no new per-Rote macros are offered from the UI. Hotbar workflows may return in a separate later enhancement.

## Cleaner native roll cards (v0.1.7)

The native WoD20 chat card now displays the casting title **once**, a compact **Arete dice pool**, the **localized reality classification**, the selected **Spheres**, and the **one final difficulty automatically added by WoD20**, followed by the native success/dice display. The previous redundant `Reality: ...`, duplicate title, and repeated difficulty-breakdown lines are removed. A brief **Modifiers** line appears only for nonzero situational adjustments or Quintessence expenditure. Extended casting keeps its note when selected.

This is a formatting-only change to the existing `DiceRollContainer` payload: no separate chat renderer or dice engine. The localized Coincidental/Vulgar spell classification stays in the card for the Dice Improvements Paradox-die listener. Rote casting and all existing per-player character preferences are preserved. No hotbar slots are altered.

## Paradox-die detection compatibility (separate ownership)

Player Magick **does not** read, roll, update, or account for Paradox and does not register a Paradox hook or depend on a Paradox module. It uses WoD20's native `DiceRollContainer` and `DiceRoller` for one Arete roll per cast. In **v0.1.6+**, the resulting native `magic` chat card includes the WoD20 localized spell label `wod.spheres.coincidentalspell`, `wod.spheres.vulgarspell`, or `wod.spheres.vulgarspellwitness`, matching the native spell labels detected by `wod20-dice-improvements` v0.2.0 (and the earlier original Paradox listener). v0.1.5 used only `Reality: coincidental/vulgar/witnessed`, which those listeners did not recognize.

**To use the Dice Improvements Paradox-die feature:** enable `wod20-dice-improvements` v0.2.0 or later and disable the old `wod20-paradox` module, per Dice Improvements' documented migration instructions. Its listener reads the native chat message and existing temporary Paradox; **0 Paradox means no Paradox dice**, and Paradox resolution remains entirely in that separate module. No additional Paradox dice are rolled by Player Magick. This interaction has been contract/mock-tested, not live-tested.

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

- The module does **not** implement a new dice engine or calculate Paradox; it supplies WoD20 spell classification text for external listeners.
- Spell rolls use the WoD20 native roller, action origin `magic`, and current Arete. Configured native Willpower spending remains handled by WoD20.
- Casting difficulty continues to use the v0.1.3 formula: highest selected Sphere +3 coincidental, +4 vulgar without Sleepers, +5 vulgar with Sleepers; user situational modifier and optional Quintessence reduction; final difficulty clamped to 3–10.
- If specified, Quintessence is deducted **after** the native roll finishes, using the supported Advantage/Actor data location; no deduction occurs simply by opening the interface.
- Rote Sphere requirements are suggested when the source Item contains recognizable fields, but the player/Storyteller must confirm combinations, scale, and effect requirements.
- Manual Power activation is still available under the collapsed **Other Powers** section for backwards compatibility, without replacing native Item use methods.

## Rollback

Restore your backup of the `wod20-player-actions` module directory or the original `wod20-player-actions-0.1.3.zip`, then restart Foundry and refresh browsers. This release performs no automatic Actor migration or hotbar modifications. It creates one world Macro for optional manual drag-and-drop. Any cast a player actually makes may spend in-game resources; restoring module code does not reverse those in-world changes.

## Testing and known limits

Tests run: JS syntax verification and seven Node-based mock/contract tests including native roll-card deduplication and per-user preference persistence, three WoD20 localized spell-label matches, native roll routing, Power delegation, launcher idempotency, and no automatic hotbar changes. Layout carried forward from v0.1.5 (Chromium fixture previously checked at 1440px and 820px).

**Live Foundry v14 of v0.1.7: not yet tested.** The user provided a live screenshot of the earlier card containing repeated fields; the redesigned card has not yet been observed in Foundry. The screenshots/render checks are browser fixtures rather than an installed Foundry UI. The external Dice Improvements/Paradox module was not installed or executed live; behavior is based on its published v0.2.0 listener contract.

See `CHANGELOG.md`, `TEST-REPORT.md`, and `05-HANDOFF-UPDATE-0.1.4.md`.

Fan-made Storyteller tools. Not affiliated with or endorsed by Paradox Interactive. This package includes no paid creator artwork.

## GitHub release and Foundry manifest

Install from the Foundry **Install Module** dialog using this manifest URL:

`https://raw.githubusercontent.com/rebsiot/M20-player-actions/main/module.json`

The manifest's `download` field points at the matching versioned GitHub Release ZIP. To upgrade an existing installation, back up the module folder and your Foundry world before installing or replacing files; modules are enabled separately in each world. A release tag is published by the repository workflow after its packaging, syntax, and mock tests pass. Live Foundry functionality is **not** established by a successful publishing workflow.