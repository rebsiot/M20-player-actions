# WoD20 Player Actions

**Quick native WoD20 checks, Use Magick and optional attack workflow from Foundry VTT.**

**Current version:** v0.1.19 (Quick Resources: native, immediate resource and health adjustments)  
**Requires:** Foundry VTT v14 and `worldofdarkness` (WoD20) v7.3.1 or later in the verified system series.  
**Optional for targeted combat:** [STL Combat Workflow](https://github.com/rebsiot/combat-workflow) v0.1.4+.

[What's in this release](RELEASE-NOTES.md) | [Full version history](CHANGELOG.md) | [Technical details](docs/README-TECHNICAL-THROUGH-v0.1.14.md)

## Start here

1. Back up the world and installed module, then install the full versioned ZIP into `Z:\Data\modules\wod20-player-actions`; restart Foundry and enable the module for the desired world.
2. A GM enters the world once to provision the protected **Player Actions - Hotbar Macros** compendium and four world launchers (Use Magick, Player Basic Actions, Player Combat, Player Quick Resources). Nothing is put on players' hotbars during login.
3. Players can either select optional hotbar shortcuts from the Quick Tutorial or drag individual macros from Compendium Packs. The tutorial's shortcut setup uses only available hotbar slots, never replacing player or GM assignments.
4. The **Actors** sidebar offers Use Magick; Shift+J opens it. Player Basic Actions opens the standalone dashboard.
5. On a first login without the saved opt-out, each user is offered a **four-step Quick Tutorial** about rolling, Magick, combat and optional hotbar shortcuts. No character needs to be selected to read it.

### First-login Quick Tutorial

Use **Next** and **Back** to move through four short pages. The final screen asks what, if anything, you would like to add to **your** hotbar. All five checkboxes start unchecked:

- **Use Magick** — add the existing Magick launcher.
- **Combat — Standard Attack (Targeted)** — add the targeted Combat launcher; it still requires STL Combat Workflow, a single target and an online GM to actually start combat.
- **Basic Actions** — add the dashboard launcher.
- **Quick Resources** — add a standalone dialog to adjust consumable pools and all three health damage types immediately.
- **Open the Player Actions Macro Compendium** — open the reference collection after finishing, to browse the rest of the 49 optional shortcuts.

Choose **Finish** to apply the checked choices while letting the tutorial return next login, or **Don't show again** to apply them and save a per-user opt-out. Closing the window without either choice does **not** modify hotbars or suppress the tutorial. A completed tutorial with no boxes checked leaves the hotbar unchanged. Reopening the tutorial is always possible through **Quick Tutorial** in Basic Actions or Use Magick.

The macro options require the GM to have logged in once after updating. The module uses the native Foundry `assignHotbarMacro` operation and the existing player-visible world launcher macros. Existing hotbar slots, Actor data and world compendium masters are not overwritten. If a shortcut is already on the hotbar, it is skipped; if there are no empty slots, the player is told. The Macro Compendium remains player-readable and GM-controlled.

## Available actions

| Feature | What players can do |
|---|---|
| **Basic Actions** | Roll 25 presets in Awareness, Movement, Social, Knowledge and Modern Scenes, with computed native dice pools. |
| **My Custom Actions** | Configure five personal Attribute/Ability buttons, separately per player and character. |
| **Quick Resources** | Change temporary Willpower, Quintessence, Paradox, Blood Pool and supported pools on the Actor with immediate + / - actions, and adjust Bashing, Lethal and Aggravated damage separately. Optional Chimerical damage, Refresh and guarded Undo Last are included. |
| **Willpower / Resistance** | Select a standalone Willpower, Virtue or Attribute rating and an adjustable difficulty. No Willpower spending. |
| **Countermagick** | For a Mage, make a defensive Arete roll (default difficulty 7) and record a relevant Sphere for Storyteller adjudication. Not a spell cast. |
| **Use Magick** | Improvised Mage Effects and Quick Rote casting; stars mark favorite Rotes in a separate section. |
| **Favorite Rotes** | One optional hotbar macro opens favorites for the current character, directly quick-casting when only one favorite exists. |
| **Raw Attack** | Perform a single Brawl/Melee/Firearms check without applying damage or requiring a target. |
| **Standard Attack (Targeted)** | Target exactly one token to hand off to the independent STL Combat Workflow module. |
| **Dodge / Block / Parry and Initiative** | Native defensive checks and WoD20's own initiative behavior. |

**49 draggable Script Macros** are supplied (25 preset actions, five custom slots and 19 other actions/utilities). The 162 bundled Game Icons and [attribution](ICONS-CREDITS.md) remain intact. Hotbar assignments are **only made when an individual player explicitly checks boxes and finishes the tutorial**; ordinary login does not assign anything.

### Quick Resources: live consumable adjustments

Drag **Quick Resources** from the Macro Compendium to your hotbar, select it in the last Quick Tutorial screen, or open it from **Basic Actions**. A GM must enter the world once after upgrading to provision the fourth player-readable world launcher. It does **not** assign itself to players' hotbars automatically.

Each `+` or `-` press **saves immediately**; there is no Save/Apply step. The window shows only tracked pools actually on the selected Actor. Available pools include **temporary Willpower** (never permanent Willpower), Quintessence, **temporary Paradox** (never permanent Paradox), Blood Pool and other supported existing pools such as Rage, Gnosis or Glamour. The Mage Quintessence/Paradox controls account for the shared wheel capacity and permanent Paradox. Players may only update Actors they own; the GM can use the normal token-first selection, including synthetic NPC token Actors.

**Health** shows independent **Bashing**, **Lethal**, and **Aggravated** rows. If the Actor has a separate Chimerical damage track, that is shown separately. Changes write directly to WoD20's `system.health.damage` values and leave the system responsible for wound levels and penalties. Once health is full, use the character sheet and Storyteller ruling for damage overflow or severity upgrades rather than having this window automatically convert types. Resource totals and health counts cannot be raised above their applicable limits; an existing out-of-range value is not silently rewritten.

**Undo Last** reverses only the last adjustment made in that open window, and only if the current value still matches the recorded result and the old value remains legal. If another player or module changed it, the action refuses to overwrite their update. **Refresh** reads the current sheet values. Undo does not attempt to reverse automatic combat damage, spell effects or Paradox accounting; the independent owning modules are unchanged.

If a resource Item is absent or hidden, the window does not create it or fabricate a value. Newer WoD20 PC characters use their native embedded Advantage Items, while older character types use the appropriate Actor fields. No migration, extra consumable collection or duplicate combat engine is introduced.

### Modern scene actions

**Drive / Pursue**, **Pick Lock**, **Tail Someone**, **Street Information** and **Repair Equipment** appear as a fifth preset group. They read the character's actual Ability Items. For a physical **Pick Lock** check, the preset prefers **Dexterity + Larceny** (the standard Vampire V20 Skill), accepts **Security** when that optional Skill exists, and falls back to **Dexterity + Crafts** (the standard Mage M20 Skill, stored internally as `craft`). The chosen Ability and actual dice pool appear on the button; no missing Skill is invented. Other approaches, such as bypassing electronic security with Technology or Computer, are Storyteller decisions using **Roll Any Check**.

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
- Existing world compendiums, hotbar assignments, characters, customization and local preferences are not reset. The optional tutorial setup fills only empty slots on the logged-in user's hotbar and never creates a character or changes another player's shortcuts.
- Back up the entire world (the Macro compendium is world data) and `Z:\Data\modules\wod20-player-actions`. Stop Foundry for file replacement through Samba, restart, enable in the intended world and hard-refresh clients.
- Roll back the code to your backed-up v0.1.18 installation. No data migration is performed in v0.1.19; reverting module files does not undo gameplay changes or prior hotbar assignments.

## Verification and references

Automated tests and archive checks are documented in [TEST-REPORT.md](TEST-REPORT.md); full live Foundry/Paradox/Combat Workflow testing is **not yet confirmed**. The installation has not been changed by generating this ZIP.

Historical technical details: [technical README](docs/README-TECHNICAL-THROUGH-v0.1.14.md), [technical changelog](docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md), and [archived chat handoffs](docs/handoffs/05-HANDOFF-UPDATE-0.1.17.md).

This is an unofficial personal-use World of Darkness utility, not an official WoD20/Foundry product.
