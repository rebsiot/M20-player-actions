# Player Actions v0.1.19

## Quick Resources: adjust pools and damage in one window

Open **Quick Resources** from Basic Actions, drag its Macro from **Player Actions - Hotbar Macros**, or select its unchecked box on the last page of the first-login Quick Tutorial. The Game Master must enter the world once after the upgrade to make the new optional launcher available. Nothing is automatically placed on player hotbars.

- Tap **+** or **-** to update the real WoD20 character **immediately**, with no Save button. Temporary Willpower, Quintessence, temporary Paradox, Blood Pool and other available consumable pools appear only when the character actually has them. Permanent traits remain unchanged.
- Record **Bashing, Lethal, and Aggravated** damage separately. Chimerical damage appears separately when the sheet contains it. WoD20 itself remains responsible for wound levels and penalties.
- **Undo Last** reverses a single previous click if the value has not been changed by something else; **Refresh** reads the latest sheet values. Existing maximums and Mage's shared Quintessence/Paradox wheel capacity are respected.
- The Quick Tutorial now offers a fifth independent checkbox for **Quick Resources**. Leaving it unchecked does nothing. Checked shortcuts fill only free slots, never overwriting or duplicating existing player hotbar entries.

The protected Macro Compendium now has **49 optional shortcuts**. Existing actions, characters, Rotes, world macros, hotbar assignments and the separate Combat Workflow and Paradox rules are preserved. No schema migration or additional resource storage is introduced.

## Install / upgrade

Back up the Foundry world and `Z:\Data\modules\wod20-player-actions`. Stop Foundry while replacing the existing module folder from the complete v0.1.19 ZIP, then restart Foundry, enable it in the intended world and hard-refresh browsers. Enter the world as GM once to seed the new Macro and world launcher. Older customized or intentionally removed entries will not be overwritten or silently reintroduced.

To roll back, restore the backed-up **v0.1.18** module folder and (if reversing a session's adjustments or new world Macros/hotbar assignments) the matching world backup. Restoring module code alone does not undo gameplay changes.

**Testing:** 21 Node/mock regression suites and five Chromium fixtures passed locally across desktop, tablet and mobile widths. Live Foundry v14, actual WoD20 7.3.x resources and cross-module Paradox/Combat integration remain **unverified** until tested in the user's game.

[Full version history](https://github.com/rebsiot/M20-player-actions/blob/main/CHANGELOG.md)
