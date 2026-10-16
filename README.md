# WoD20 Player Actions

**Quick native WoD20 checks, Use Magick and optional attack workflow from Foundry VTT.**

**Current version:** v0.1.16 (four new gameplay utilities and first-login Quick Tutorial)  
**Requires:** Foundry VTT v14 and `worldofdarkness` (WoD20) v7.3.1 or later in the verified system series.  
**Optional for targeted combat:** [STL Combat Workflow](https://github.com/rebsiot/combat-workflow) v0.1.4+.

[What's in this release](RELEASE-NOTES.md) | [Full version history](CHANGELOG.md) | [Technical details](docs/README-TECHNICAL-THROUGH-v0.1.14.md)

## Start here

1. Back up the world and installed module, then install the full versioned ZIP into `Z:\Data\modules\wod20-player-actions`; restart Foundry and enable the module for the desired world.
2. A GM enters the world once to add new, optional shortcuts to the existing **Player Actions - Hotbar Macros** world compendium. The module does not assign or replace hotbar slots.
3. Players can drag individual macros from Compendium Packs or open the existing **Player Basic Actions** and **Use Magick** launchers.
4. The **Actors** sidebar offers Use Magick; Shift+J opens it. Player Basic Actions opens the standalone dashboard.
5. On the first login after this update, each user is offered a **four-step Quick Tutorial** about rolling, Magick, combat and optional hotbar shortcuts. No character needs to be selected to read it.

### First-login Quick Tutorial

Use **Next** and **Back** to move through the four short pages. On the last page, **Don't show again** saves a private per-user preference for this world, so the walkthrough does not pop up on later logins. Closing it without choosing that option will offer it again on the next login.

The tutorial remains available at any time through the small **Quick Tutorial** link in **Basic Actions** (under the roll controls) and **Use Magick** (beside Change Character). Reopening it does not clear the saved preference. The tutorial is informational only: it does not roll dice, spend resources, modify characters, change world content or assign hotbar shortcuts.

## Available actions

| Feature | What players can do |
|---|---|
| **Basic Actions** | Roll 25 presets in Awareness, Movement, Social, Knowledge and Modern Scenes, with computed native dice pools. |
| **My Custom Actions** | Configure five personal Attribute/Ability buttons, separately per player and character. |
| **Willpower / Resistance** | Select a standalone Willpower, Virtue or Attribute rating and an adjustable difficulty. No Willpower spending. |
| **Countermagick** | For a Mage, make a defensive Arete roll (default difficulty 7) and record a relevant Sphere for Storyteller adjudication. Not a spell cast. |
| **Use Magick** | Improvised Mage Effects and Quick Rote casting; stars mark favorite Rotes in a separate section. |
| **Favorite Rotes** | One optional hotbar macro opens favorites for the current character, directly quick-casting when only one favorite exists. |
| **Raw Attack** | Perform a single Brawl/Melee/Firearms check without applying damage or requiring a target. |
| **Standard Attack (Targeted)** | Target exactly one token to hand off to the independent STL Combat Workflow module. |
| **Dodge / Block / Parry and Initiative** | Native defensive checks and WoD20's own initiative behavior. |

**48 draggable Script Macros** are supplied (25 preset actions, five custom slots and 18 other actions/utilities). The 162 bundled Game Icons and [attribution](ICONS-CREDITS.md) remain intact. No macros are automatically assigned to your hotbar.

### Modern scene actions

**Drive / Pursue**, **Pick Lock**, **Tail Someone**, **Street Information** and **Repair Equipment** appear as a fifth preset group. They use actual Ability Items on the character, accepting available alternatives for a few actions (e.g. Security or Larceny for Pick Lock). If the character lacks the required Ability, the button is unavailable rather than silently adding dots.

The Storyteller may request another Attribute/Ability pairing or adjust difficulty. Existing custom slots and the native character sheet remain available.

### Willpower, resistance and countermagick

Standalone resistance rolls read the character's rated Willpower, Virtues and Attributes; they **do not consume Willpower**, apply armor/soak, or replace combat defenses. If a character has no recorded rating, that trait will not be offered. Use the appropriate difficulty according to Storyteller ruling.

Basic Countermagick requires a Mage with Arete. It uses the native WoD20 general roll type rather than the `magic` cast origin, so it is not submitted as an ordinary Effect to the separate Paradox listener. It does not spend resources, automatically cancel the attacker's successes, or determine whether the Mage knows enough Spheres; the Storyteller decides. Live integration testing with the actual Paradox module is still required.

### Favorite Rotes

In **Use Magick**, click a star next to a Rote to add/remove it from **Favorite Rotes**. Favorites are saved by the logged-in user and character; they do not change the Actor, Rote or any world Macro. Drag the **Favorite Rotes** shortcut from Compendium Packs to your hotbar to access your own selection. Missing/deleted Rotes are ignored.

### Raw Attack vs. Standard Attack

Raw Attack is a simple native dice check, with no targeting or automatic damage. Standard Attack requires exactly one targeted defender, enabled **STL Combat Workflow v0.1.4+**, and a GM online. Player Actions passes the current Actor to Combat Workflow, which owns weapon selection, defense, damage, soak and GM Apply/Undo. If the prerequisites are missing, the shortcut warns instead of rolling a substitute attack.

### Which character is used?

Players use their selected/remembered eligible Actor. When a GM opens an unbound action, the module uses the current token and then the last selected token (including unlinked NPC token Actors). Explicitly Actor-bound Rote macros keep their original binding.

## Permissions, backups, upgrade and rollback

- Players need Foundry permission to run Script Macros and to control the Actor being rolled.
- The GM provisions the existing native world Macro pack and its new entries; players can read/drag reference macros but not edit masters.
- Existing world compendiums, user hotbars, characters, customization and local preferences are not reset.
- Back up the entire world (the Macro compendium is world data) and `Z:\Data\modules\wod20-player-actions`. Stop Foundry for file replacement through Samba, restart, enable in the intended world and hard-refresh clients.
- To return to the current live baseline, restore the last known working v0.1.14 installation (or your exact backed-up v0.1.15 files) and the matching world backup if you need to undo newly added world Macro documents. Code rollback alone does not delete new compendium entries or reverse gameplay resource changes.

## Verification and references

Automated tests and archive checks are documented in [TEST-REPORT.md](TEST-REPORT.md); full live Foundry/Paradox/Combat Workflow testing is **not yet confirmed**. The installation has not been changed by generating this ZIP.

Historical technical details: [technical README](docs/README-TECHNICAL-THROUGH-v0.1.14.md), [technical changelog](docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md), and [developer handoffs](05-HANDOFF-UPDATE-0.1.16.md).

This is an unofficial personal-use World of Darkness utility, not an official WoD20/Foundry product.
