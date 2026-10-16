# WoD20 Player Actions

**A faster way to make common rolls, cast Magick and launch combat from Foundry VTT.**

**Current version:** v0.1.15 (release-notes cleanup; gameplay unchanged from v0.1.14)  
**Requires:** Foundry VTT v14 and the `worldofdarkness` (WoD20) system v7.3.1  
**Optional for targeted combat:** [STL Combat Workflow](https://github.com/rebsiot/combat-workflow) v0.1.4 or later

[What's in this release](RELEASE-NOTES.md) · [Full version history](CHANGELOG.md) · [Technical details](docs/README-TECHNICAL-THROUGH-v0.1.14.md)

## Start here

1. Install the module in Foundry using its [manifest URL](https://raw.githubusercontent.com/rebsiot/M20-player-actions/main/module.json) or the [latest ZIP](https://github.com/rebsiot/M20-player-actions/releases/latest). Enable **WoD20 Player Actions** in your world.
2. Have a **GM enter the world once** to create the **Player Actions — Hotbar Macros** compendium. Existing player hotbars are not changed.
3. Open **Compendium Packs**, find **Player Actions — Hotbar Macros**, and drag the shortcuts you want onto your own hotbar.
4. Or use **Basic Actions** from the macro to open the 25-button dashboard. The **Use Magick** launcher is also available on the Actors sidebar; Shift+J opens it.

## What players can do

| Feature | What it does |
|---|---|
| **Basic Actions** | Opens 20 ready-to-roll checks for noticing, moving, social interactions and investigating |
| **My Custom Actions** | Adds five personal shortcuts with a label, Attribute, optional Ability and chosen icon |
| **Use Magick** | Opens improvised Mage casting and quick Rote casting with native WoD20 rolls |
| **Raw Attack** | Rolls Brawl, Melee or Firearms as a simple check; no target or automatic damage |
| **Standard Attack (Targeted)** | Requires one target and launches the separate STL Combat Workflow |
| **Dodge / Block / Parry** | Quickly rolls a defensive check; Storyteller rules still apply |
| **Initiative** | Invokes WoD20's native initiative handling |
| **Roll Any Check / Character Sheet** | Opens the broader Attribute + Ability picker or the native sheet |

There are **40 draggable macros** in the current compendium. They're optional: nothing is automatically assigned to a hotbar. The source icon selection includes **162 locally bundled Game Icons**, with [attribution](ICONS-CREDITS.md).

### Basic Actions and custom slots

The dashboard displays five buttons per row on wider screens and rearranges them on narrower screens. Each preset shows its actual base dice pool, with a light red-to-green tint to help scan relative strengths. A tint never affects dice, difficulty or successes.

The five custom slots are saved for **each player and character**. Select **Configure** to choose an Attribute, Ability, label and icon. Use the edit pencil to revise or clear a saved slot. Compendium shortcuts for Custom Actions 1–5 use the configuration for whichever character you're currently controlling.

### Raw Attack versus Standard Attack

**Raw Attack** is a quick native WoD20 Attribute + Ability check. It doesn't need a targeted token and **does not** start defenses, damage or soak. Use it when the Storyteller wants a single test.

**Standard Attack (Targeted)** is different:

1. Enable **STL Combat Workflow v0.1.4+** in the same world, and have an **online GM**.
2. Use Foundry targeting to target **exactly one defending token**.
3. Click the **Standard Attack (Targeted)** macro. Player Actions passes your current Actor to Combat Workflow.
4. Combat Workflow then handles weapon or unarmed selection, attack, defense, damage, soak and GM health Apply/Undo.

If Combat Workflow is missing or no single target is selected, the shortcut warns you. It does not silently roll Raw Attack instead. Combat Workflow owns its rules, chat stages and health updates; Player Actions does not duplicate them.

### Use Magick

**Use Magick** opens the existing Mage casting interface. Select Spheres and Reality, adjust Quintessence, Willpower and other available options, then use WoD20's native casting roll. Known Rotes can use the smaller Quick Rote dialog. The optional **Effect / Focus description** starts collapsed in the improvised editor.

Magick rolls preserve the localized labels required by the independent Dice Improvements / Paradox handling. Player Actions itself doesn't manage Paradox.

### Which character is used?

For a player, the module uses the chosen eligible character, remembering a deliberate change. When a GM opens an unbound launcher, it prefers the **currently selected token** and then the **previously selected token**, including unlinked NPC tokens. Explicitly Actor-bound shortcuts remain bound to their chosen Actor.

## Setup, permissions and safety

- The compendium is created on a GM's first login, not by every player. Its reference macros are **player-readable**, not player-editable.
- Players need Foundry permission to execute Script Macros and to control the characters they're rolling for.
- Existing hotbar positions and customized macro entries are preserved. A GM-deleted compendium shortcut is not automatically recreated.
- The module uses native WoD20 rolls; it doesn't introduce a second dice engine, weapon system or Paradox tracker.
- The **world compendium is persistent world data**, separate from the installed module's files.

## Install, update or roll back

**Before an update:** Back up both your **Foundry world** and the existing module folder `Z:\Data\modules\wod20-player-actions`. If replacing files manually through Samba, stop Foundry first, replace the complete module folder, then restart Foundry and hard-refresh clients.

**To roll back v0.1.15:** Restore the previous **v0.1.14** module installation. This documentation-only update does not change gameplay state or world data. However, an existing world Macro compendium remains when you roll back, and reverting code never undoes damage, spent resources or other actions taken during play. Restore a matching world backup if you must undo world-document changes.

**First live check:** As a player, drag **Notice** onto a hotbar and roll it. For targeted combat, have the GM online, select exactly one defender, and use **Standard Attack (Targeted)** with Combat Workflow enabled. Confirm that the resulting attack progresses through defense, damage, soak and optional GM Apply/Undo. That complete cross-module sequence still requires live Foundry verification.

## Documentation and licenses

- [Readable release history](CHANGELOG.md)
- [Latest release summary](RELEASE-NOTES.md)
- [Historic technical README](docs/README-TECHNICAL-THROUGH-v0.1.14.md) and [historic developer changelog](docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md)
- [Automated test report](TEST-REPORT.md)
- [Game Icons contributors and license](ICONS-CREDITS.md)
- [Development handoff v0.1.15](05-HANDOFF-UPDATE-0.1.15.md)

This is a personal-use, unofficial World of Darkness utility. Do not assume it is officially supported by the game publisher, Foundry or the WoD20 system author.
