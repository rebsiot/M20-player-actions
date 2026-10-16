# Player Actions v0.1.17

**A faster first login: choose your Player Actions shortcuts directly from the Quick Tutorial.**

## What's new

The last Quick Tutorial screen offers four optional, initially unchecked choices:

- **Use Magick** — put the Magick launcher in your hotbar.
- **Combat — Standard Attack (Targeted)** — put the targeted Combat launcher in your hotbar.
- **Basic Actions** — put the dice/action dashboard in your hotbar.
- **Open the Player Actions Macro Compendium** — open the collection to explore all 48 optional macros.

**Finish** applies the checked choices. **Don't show again** applies them and hides the tutorial on future logins. Players can reopen Quick Tutorial later from Basic Actions or Use Magick.

## Your hotbar stays yours

- Nothing is assigned without your selection. Existing occupied slots are never replaced; duplicate shortcuts are skipped.
- Empty slots on your currently selected hotbar page are filled first, then other empty slots if necessary. No space? You'll be told.
- Each player decides separately. Players do not need to edit the shared reference compendium; the GM seeds three world launcher macros once.
- The standard attack shortcut still needs a target, online GM and STL Combat Workflow v0.1.4+ when used.

All v0.1.16 Magick, Rotes, custom action, native WoD20 rolling and Paradox separation behavior is retained.

## Installation and verification

Back up both your Foundry world and `Z:\Data\modules\wod20-player-actions`; install the complete versioned ZIP, restart Foundry, and have the GM enter the world before players choose new hotbar shortcuts. To roll back, restore the backed-up module folder and, if needed, the matching world snapshot for user hotbars and newly created launcher Macros.

**Automated tests:** see `TEST-REPORT.md`. **Live Foundry v14, player hotbar, and Combat Workflow end-to-end verification:** pending.

[Full history](https://github.com/rebsiot/M20-player-actions/blob/main/CHANGELOG.md) | [Setup guide](https://github.com/rebsiot/M20-player-actions/blob/main/README.md)
