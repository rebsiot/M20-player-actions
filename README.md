# WoD20 Player Magick & Actions

**Cast Mage effects, make ordinary WoD20 checks, and adjust temporary character resources without repeatedly opening the character sheet.** Standard Attack connects to the separate, optional [STL Combat Workflow](https://github.com/rebsiot/combat-workflow), which is **not bundled**.

**Module Manager name:** WoD20 Player Magick & Actions  
**Internal module ID (unchanged):** `wod20-player-actions`  
**Current release:** v0.1.21 — a display-name and documentation update, with no gameplay changes.

## What you can do

- **Use Magick:** Cast improvised Mage effects and Rotes using native WoD20 rolls.
- **Basic Actions:** Make 25 common native checks or use five personal Attribute + Ability shortcuts.
- **Quick Resources:** Adjust temporary Willpower, Quintessence, Blood Pool and other supported pools with immediate +/- controls; record Bashing, Lethal and Aggravated damage separately. Chimerical damage appears only when enabled on the sheet.
- **Raw Attack:** Make a single Brawl/Melee/Firearms check without applying damage or requiring a target.
- **Standard Attack (Targeted):** Select one target to launch **STL Combat Workflow** (separately installed, with an online GM). It handles defense, soak and damage; Raw Attack does not.

## Requirements

- **Foundry VTT v14** and **`worldofdarkness` (WoD20) v7.3.1+**. The module manifest states Foundry 13 minimum and 14 verified compatibility; an actual v0.1.21 live Foundry test is not recorded.
- **Optional:** STL Combat Workflow v0.1.4+ for Standard Attack. It is not needed for Use Magick, Basic Actions, Raw Attack or Quick Resources.
- WoD20 only; not a system-independent dice module.

## Install and first use

1. **Back up your world** and any installed `Data/modules/wod20-player-actions` folder. In **Foundry Setup > Add-on Modules > Install Module**, paste the [module manifest URL](https://raw.githubusercontent.com/rebsiot/M20-player-actions/main/module.json) and install/update.
2. Start the world, open **Game Settings > Manage Modules**, and find **WoD20 Player Magick & Actions**. Enable it and reload if needed. The unchanged module ID preserves existing module settings and the prior enabled state on upgrade.
3. Have a GM enter the world once to provision the four optional world launchers and protected **49-macro** player-readable compendium. GM login never auto-populates anyone's hotbar.
4. In the **Actors** sidebar, open **Use Magick** (or press **Shift+J**). Player Actions selects your saved preferred character first when available, otherwise an assigned/controlled character; a GM's selected token takes priority. Use **Change Character** when necessary.
5. For a cast, select a Mage, choose **Improvised Magick**, specify the effect and permitted Spheres, and use the native WoD20 cast roll. Check that a usable **Foundry ChatMessage** appears, not merely dice animation. Use **Basic Actions** for routine checks or **Quick Resources** to adjust pools and damage immediately.

### Optional hotbar macros

The GM provisions **49 player-readable reference macros** plus four world launchers (Use Magick, Basic Actions, Standard Attack and Quick Resources). Drag your chosen macros to the hotbar or use the Quick Tutorial's final screen. Its five checkboxes start **unchecked**, and checked launchers are assigned only to **empty hotbar slots**. Existing user/GM macros and occupied slots are never silently overwritten.

### Dice and Paradox ownership

This module uses **native WoD20 rolls and chat messages** and does **not** maintain a second Paradox counter. Use **one** Paradox processor only; the Dice Improvements integration (08) and standalone legacy Paradox module (09) must not both process a cast. A real two-client exactly-once test is still required.

## Documentation and support

[Detailed player guide](docs/PLAYER-GUIDE.md) · [Current release notes](RELEASE-NOTES.md) · [Changelog](CHANGELOG.md) · [Technical reference](docs/README-TECHNICAL-THROUGH-v0.1.14.md) · [Report an issue](https://github.com/rebsiot/M20-player-actions/issues)

**Known verification gap:** No v0.1.21 live Foundry GM/player cast, usable chat card, tutorial hotbar assignment or exactly-once Paradox result has been recorded. Automated/mock tests do not establish live behavior.

**License and attribution:** Bundled Game Icons retain their license in [icons/LICENSE.txt](icons/LICENSE.txt) and [creator credits](ICONS-CREDITS.md). The repository has no separate top-level software license; a public GitHub repository is not necessarily an open-source grant.
