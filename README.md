# WoD20 Player Actions v0.1.14 (test build)

**Module:** `wod20-player-actions` | **Foundry:** v14 | **System:** WoD20 7.3.1 | **Published baseline:** v0.1.13.

**New:** **Standard Attack (Targeted)** launches the *independent* STL Combat Workflow **v0.1.4+** (`stl-combat-workflow`) and requires **exactly one targeted defender token**. It passes the current Actor using the published `game.modules.get("stl-combat-workflow").api.open({attackerActor: actor})` interface. Combat Workflow owns its attack, defense, damage, soak, GM health application and Undo; Player Actions does not roll separate attack dice or duplicate its mechanics. Combat Workflow must be **enabled in the same world**, with an online GM for its multiplayer flow. If it is unavailable, Standard Attack warns and does not start a substitute combat procedure.

**Raw Attack (Choose Type)**, plus **Raw Brawl/Melee/Firearms Attack** shortcuts, make only an ordinary Dexterity + Ability check and require no target. They do not do weapon damage. **Use Magick** replaces the shipped default Player Magick label on the Actors sidebar, Shift+J action, the world launcher and the catalog; it does not change Magick API identifiers or delete customized shortcuts.

**UI:** The Basic Actions dashboard is approximately 15% wider (770 to 885 px maximum) with higher-contrast action names and slightly larger Attribute/Ability and pool text. No extra rows or permanent controls. Improvised Magick's optional **Effect / Focus description** starts collapsed in a small expander like the Rote editor. Existing difficulty, Sphere rules, Paradox markers and casting rolls are unchanged.

**Compendium:** This version offers **40 macro catalog entries** (up from 39). On GM login, the new Standard Attack shortcut is added once. Only unchanged original module-provided macro names are updated to **Use Magick** and **Raw Attack** wording; renamed, re-scripted and re-iconed GM macros stay as they are. Existing hotbars are never assigned, replaced or relabeled. A GM-deleted shortcut is not recreated. Back up the **world data** along with the module folder before testing the compendium upgrade.

**First test:** As GM in a backed-up test world, enable *STL Combat Workflow v0.1.4+* and *Player Actions*. Target exactly one defender; drag **Standard Attack (Targeted)** from **Player Actions - Hotbar Macros** to the hotbar and run it. Verify Combat Workflow's weapon dialog and then the defender/soak/health chat stages, including Apply/Undo. Without a target, Standard Attack should warn and never roll. **Raw Attack** should still work without a target. Test Use Magick and the collapsed optional description. This release is automated/mock-tested, not verified live in Foundry.

**Upgrade:** Back up the world and `Z:\Data\modules\wod20-player-actions`; stop Foundry; replace the entire module folder with the v0.1.14 ZIP; restart and hard-refresh all clients. **Rollback:** restore v0.1.13 module folder and a matching world backup if you need to reverse world compendium changes. Neither rolling back a module nor disabling it undoes wounds/resources already changed by a completed combat.

---


## Draggable player Macro compendium (v0.1.13)

The GM's **first GM login with v0.1.13 or later enabled** provisions a new native **world** Macro compendium named **Player Actions — Hotbar Macros**. It contains **40 ready-to-drag Script Macros in v0.1.14**, with artwork from the bundled licensed SVG icons. Open **Compendium Packs**, locate that name and drag any desired Macro to your own Hotbar. Foundry also supports importing individual Macros from a compendium. The module **never assigns a hotbar slot**, deletes prior world Macros, modifies Actors or changes existing hotbar settings.

| Category | Macros | Use |
|---|---|---|
| Basic Awareness (5) | Notice, Sense Magick, Search, Read Someone, React | Native Attribute + Ability checks |
| Basic Movement (5) | Sneak, Climb, Run, Jump, Track | Same native Basic Actions check |
| Basic Social (5) | Charm, Deceive, Intimidate, Negotiate, Lead | Same native Basic Actions check |
| Basic Knowledge (5) | Occult, Research, Investigate, Computer, First Aid | Same native Basic Actions check |
| Custom (5) | Custom Action 1–5 | Roll that player's saved slot for the *current* Actor. A blank slot opens its Configure editor. |
| Dashboards (2) | Basic Actions, Roll Any Check | Open the 25-button panel or choose any sheet Attribute and Ability |
| Magick (3) | Use Magick, Improvised Magick, Rotes & Powers | Existing Mage casting tools; Rotes & Powers opens the Use Magick panel |
| Combat and sheet (10) | Standard Attack (Targeted), Raw Attack (Choose Type), Raw Brawl/Melee/Firearms Attack, Dodge, Block, Parry, Initiative, Character Sheet (Weapon / Soak) | Standard Attack delegates to STL Combat Workflow; Raw actions are simple checks |

**Raw Attack (Choose Type)** opens a small menu (Brawl / Melee / Firearms, difficulty, optional Willpower) and makes **one** native WoD20 *attack check*, not damage or soak. The dedicated Raw Brawl/Melee/Firearms buttons make the listed Dexterity + Ability check immediately at default difficulty 6. **Dodge** uses Dexterity + Athletics, **Block** Dexterity + Brawl, and **Parry** Dexterity + Melee; these are check shortcuts only, subject to Storyteller rulings. **Initiative** calls WoD20's own `CombatHelper.RollInitiative` rather than inventing a roll. The **Character Sheet (Weapon / Soak)** macro opens the native sheet for equipment-specific rolls rather than guessing weapon damage, armor, or soak.

The presets, direct combat checks and Custom slots use the **current Actor every time**: players use their assigned/remembered character; GMs use the selected token or last selected token, including unlinked NPCs. Shortcut rolls default to difficulty **6**, with situational adjustments via the Basic Actions dashboard or the freeform/Attack picker. Native WoD20 wounds, specialty rules and Willpower apply to these checks. There is no automatic damage or Paradox handling.

**Permissions and persistence:** The world compendium is player/Trusted Player **OBSERVER** (read/drag), GM **OWNER** and locked after initial seeding. The GM can unlock/customize its masters if desired; this module **never overwrites existing macro documents** or restores individual macros that the GM deleted. Its world setting records previously shipped identifiers; future updates may add new identifiers only. The compendium **persists with the world** if the module is later disabled or removed. Back up the **world data**, not just the module directory, before upgrading. Foundry's global **Use Script Macros** permission must allow player Script Macros (a standard core permission, not a new module gate). Players cannot edit the reference compendium.

If another pack already uses the reserved world ID `world.wod20-player-actions-macros`, the module leaves it untouched and logs a warning rather than replacing anything. **No world pack is created by player logins**; the GM must enter the world once after upgrading. The original unmodified Macro Directory `Player Magick` launcher may be renamed to `Use Magick`; user-edited macros are left intact. The Basic Actions launcher remains unchanged. **Live Foundry v14 testing of new compendium creation and drag-and-roll remains pending.**

# WoD20 Player Actions (Use Magick + Basic Actions)

**Module ID:** `wod20-player-actions`  
**Release:** v0.1.14 test build (2026-10-15)  
**Repository:** https://github.com/rebsiot/M20-player-actions

A focused, player-facing Mage: The Ascension 20th Anniversary casting interface for Foundry VTT v14 and the `worldofdarkness` (WoD20) system. The existing module ID is unchanged for compatibility.

## Basic Actions dashboard (v0.1.12 improvements)

From the **Macro Directory**, run **Player Basic Actions**, or drag that optional launcher Macro to your own hotbar. The module creates it once for GM-run worlds, but **never populates anyone's hotbar**. The launcher and Actors sidebar action are now labeled **Use Magick**; **Shift+J** is unchanged. You can also invoke `game.modules.get("wod20-player-actions").api.openBasicActions()` from an existing macro.

The Basic Actions window shows **four rows of five illustrated preset actions** and a **fifth row of five configurable buttons**. The 20 presets use these suggested Attribute + Ability combinations (the Storyteller may choose different combinations as circumstances warrant):

| Row | Action | Attribute + Ability |
| --- | --- | --- |
| Awareness | Notice, Sense Magick, Search, Read Someone, React | Perception + Alertness; Perception + Awareness; Perception + Investigation; Perception + Empathy; Wits + Alertness |
| Movement | Sneak, Climb, Run, Jump, Track | Dexterity + Stealth; Strength + Athletics; Stamina + Athletics; Strength + Athletics; Perception + Survival |
| Social | Charm, Deceive, Intimidate, Negotiate, Lead | Charisma + Expression; Manipulation + Subterfuge; Manipulation + Intimidation; Manipulation + Etiquette; Charisma + Leadership |
| Knowledge | Occult, Research, Investigate, Computer, First Aid | Intelligence + Occult; Intelligence + Academics; Intelligence + Investigation; Intelligence + Computer; Intelligence + Medicine |

Each compact preset button shows a **19px Game Icons SVG**, its action name, an abbreviated **Attribute + Ability** pairing (such as `Per + Alert`), and the character's computed pool (`5d10`). Hover for the full Attribute/Ability names. The dashboard is up to 885px wide on desktop, with reduced padding, gaps and button height; it remains responsive. **Click the button to roll immediately** through the same native WoD20 `DiceRollContainer`/`DiceRoller` used by the system. WoD20's Actor `rollAbility` method labels the chat card with the Ability (e.g. **Alertness**); this version supplies the **dashboard button name** (e.g. **Notice**) as the action title while retaining the native Attribute/Ability detail, wound penalty, specialty, difficulty, Willpower and dice results. No second chat message or dice engine is introduced. Standard actions requiring an Ability absent from the sheet are labeled **Not on sheet** and disabled rather than silently substituting another Ability. **Sense Magick** here is the basic Perception + Awareness roll; it does not cast Sphere magick.

**Custom buttons:** Click **Configure** in any of the five empty slots; choose a label, a real Attribute from the selected character, an Ability from that character (or Attribute only), and an icon from the curated set. Save. Click the resulting button to roll; use the small **pencil** on the button to reconfigure or **Clear Slot**. Your custom settings are stored **per player and per Actor UUID**, in the hidden user-scoped Foundry setting `basicActionsByActor`, not in the Actor. Five custom slots for Eli won't overwrite five for Chloe. Changing a character's sheet Traits can make an existing custom action unavailable until edited.

**Difficulty / Willpower:** The footer offers a 2-10 difficulty rocker, default 6, and an optional **Spend 1 Willpower** checkbox. WoD20 handles Willpower using its native rolling mechanism; the checkbox resets after rolling. This module does not run another success or resource engine. GM Basic Actions use the same selected-token / previous-token priority as Player Magick. Multiple selected GM tokens must be narrowed to one rather than selecting an arbitrary Actor.

**Game Icons:** The release bundles **162 curated SVGs** from the supplied `game-icons.net.svg.zip`, NOT the entire 4,180-SVG archive. The custom icon chooser supports **name search** and **category filtering** with a scrollable gallery; existing icon selections remain valid. Attribution and license are included in `ICONS-CREDITS.md` and `icons/LICENSE.txt`; the original authors are credited as required by the archive's CC BY 3.0 license terms. Only the five custom actions have editable icons; presets use fixed, legible defaults. Each action button has a **very light** dice-pool tint from red (0 dice) through yellow (4 dice) to green (7+ dice); the numeric dice count remains the authoritative cue. The tint is based on the raw Attribute + Ability pool, before situational wound penalties.

## What the player sees

1. Open **Actors > Use Magick** or press **Shift+J**.
2. **Players:** Start with the character assigned in Foundry User Configuration (`game.user.character`). After manually choosing another, remember that Actor with the existing per-user preference until changed again, including across reconnects. **GMs:** Use a *single currently selected token* first; if none is selected, use the most recently controlled token (including an unlinked NPC token). Only if that token is no longer available fall back to the remembered/assigned Actor or character chooser. Do not guess when multiple tokens are selected.
3. Click **Improvised Magick**, or choose a **Known Rote** and click Cast. The panel retains its existing **Change Character** control, but the casting window now presents **Casting as [character dropdown]**, so you can switch directly without a second dialog.
4. In the wider casting dialog, pick Sphere ranks using large 0-to-known-rating buttons. Rank-by-rank help is collapsed unless requested. Review the **live Difficulty displayed in the top header** and roll using WoD20's native dice roller.

The casting window scales up to 1020 px wide on a suitable desktop and shrinks with the viewport. Sphere cards display in 3 columns on wide screens, 2 on medium screens, and 1 on narrow screens. The caster dropdown, Arete, current Difficulty and available Quintessence share a compact strip on desktop; they wrap responsively on narrow screens.

## GM token-first casting (v0.1.10)

For a **GM** opening the Player Magick panel from the Actors sidebar, Shift+J, or the optional launcher Macro, caster selection now follows this order:

1. **Exactly one selected token** on the current canvas: use that token's Actor, not the GM's assigned or remembered Actor.
2. **No selected token:** use the **last token the GM selected** (`controlToken`), even if it was deselected before opening Player Magick. The selection is saved as a Foundry TokenDocument UUID in a hidden **user-scoped** world setting, so an unlinked NPC's synthetic Actor is preserved and the choice can survive a reconnect.
3. **No valid recent token (deleted/scene unavailable):** fall back to the existing manually remembered character, assigned character, then normal chooser.
4. **Multiple selected tokens:** warn instead of choosing one silently. Deselect down to one token and reopen.

This rule is for GMs only. **Players still use their own saved/assigned character preference** (selected tokens remain a fallback), and existing Rote macros explicitly bound to an Actor UUID keep that binding. A manually chosen different character remains available in the casting dropdown, but the GM's next *unbound* launch follows token-first priority again. A non-Mage token can still open its Power actions, but **Mage casting requires a Mage Actor**. Neither token selection nor opening an interface spends Quintessence, Willpower, or Paradox.

## Character dropdown and current difficulty (v0.1.9)

- The caster dropdown defaults to the currently resolved Mage and lists **only Mages owned by the player** (or accessible Mages for a GM). Players' existing per-user preference continues to determine subsequent launches; for GMs, token-first selection takes priority over the preference.
- Switching characters via that dropdown persists the new choice and opens the chosen Mage's **fresh improvised casting screen** immediately. Previously selected Rotes and Sphere choices from the previous Actor are not carried over; this prevents mixing two Actors' magical data. If a selected Actor becomes unavailable, the selection is rejected rather than casting with the wrong character.
- The top header now displays a **large, high-contrast Difficulty —** until at least one Sphere is selected. Once a Sphere level is chosen, Difficulty displays the same clamped value sent to WoD20, updating with Sphere ranks, Reality, Quintessence spent, and GM modifier. The supporting metrics are Arete dice, highest Sphere, Quintessence deduction, and the Willpower option. The old redundant lower dice-pool preview is removed. Willpower shows its native bonus as +1 success or +3 dice according to the installed WoD20 setting when checked; no new rules are applied.
- Reality classification option wording is explicit: **Coincidental (+3 to highest Sphere)**, **Vulgar, no witnesses (+4 to highest Sphere)**, **Vulgar, witnessed (+5 to highest Sphere)**. Only the labels changed; the underlying rules/difficulty calculation are unchanged.


## Compact casting controls (v0.1.8)

Below the Sphere cards, casting details now use this order:

1. **One row:** Reality classification dropdown, **Quintessence (N remaining)** minus/value/plus rocker, and **GM modifier** minus/value/plus rocker. The user sees and changes these without typing numbers. Quintessence stays within **0 to min(3, currently available)**; GM modifier stays within **-3 to +3**. Both disable their buttons when a limit is reached. At narrow widths, the two rockers sit together below the reality selector.
2. **One row of checkboxes:** Use Focus, Spend 1 Willpower, Extended casting / ritual. These are optional and unchecked on open.
3. **Live roll summary:** Prominent final Difficulty at the upper right, with supporting Arete dice, highest Sphere, Quintessence reduction, and Willpower option. Quintessence remaining updates as the rocker changes. No duplicated lower roll summary.
4. **Effect / focus description:** Optional single-line text field.
5. **Casting rules and Storyteller notes:** Collapsed by default, expandable if the player wants rules reminders. Each Sphere's own rank guide remains separately expandable.

**Use Focus records intent only.** It adds `Focus used` to the one native WoD20 magic chat card when checked. It neither grants an automatic difficulty benefit nor spends resources; any difficulty change must be selected in the GM modifier with the Storyteller's agreement. Native WoD20 remains responsible for the Willpower option. Extended casting remains one roll per press; additional attempts are tracked manually.

The module does **not** persist the individual casting-choice checkboxes between casts or change their default values.

## Macros and hotbar

**One world Macro called `Use Magick` is created once by the GM, available in the Macro Directory. No hotbar installation is performed.** Players can drag that launcher Macro onto their hotbars if they want. The panel no longer exposes per-Rote Macro buttons, sheet pin controls, or drag-to-hotbar shortcuts. Existing hotbar layouts are untouched. Previous macros created by v0.1.3 are **not deleted** and can continue to call the stable module API `game.modules.get('wod20-player-actions').api.execute(...)`, but no new per-Rote macros are offered from the UI. Hotbar workflows may return in a separate later enhancement.

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
4. Restart Foundry. Enable the existing **WoD20 Player Actions** module in the desired world and hard-refresh connected browsers.
5. From a player's account, open Actors > Use Magick; confirm the correct default character and test a basic improvised cast in a test world or copied character.

## Roll and resource behavior

- The module does **not** implement a new dice engine or calculate Paradox; it supplies WoD20 spell classification text for external listeners.
- Spell rolls use the WoD20 native roller, action origin `magic`, and current Arete. Configured native Willpower spending remains handled by WoD20.
- Casting difficulty continues to use the v0.1.3 formula: highest selected Sphere +3 coincidental, +4 vulgar without Sleepers, +5 vulgar with Sleepers; user situational modifier and optional Quintessence reduction; final difficulty clamped to 3–10.
- If specified, Quintessence is deducted **after** the native roll finishes, using the supported Advantage/Actor data location; no deduction occurs simply by opening the interface.
- **Quick Rote casting:** A Rote with recognized Sphere requirements that the Mage knows opens a compact confirmation instead of the full Sphere grid. It displays the Rote name, preselected Sphere levels, final Difficulty, and normal situational controls. Choose **Edit Spheres / Advanced** to reopen the full editor with that Rote prefilled. Rotes with missing requirements or levels above the Mage's known ratings open the full editor with a warning instead of silently guessing. The player/Storyteller still adjudicates combinations, scale and effect requirements.
- Manual Power activation is still available under the collapsed **Other Powers** section for backwards compatibility, without replacing native Item use methods.

## Rollback

Restore your backed-up `wod20-player-actions` module directory or the published v0.1.11 ZIP, then restart Foundry and refresh browsers. This release performs no automatic Actor migration or hotbar modifications. It creates one world Macro for optional manual drag-and-drop. Any cast a player actually makes may spend in-game resources; restoring module code does not reverse those in-world changes.

## Testing and known limits

Tests run: JS syntax verification and eleven Node-based mock/contract tests, including GM selected/previous token precedence and unlinked token preservation, native roll-card deduplication and per-user preference persistence, three WoD20 localized spell-label matches, native roll routing, Power delegation, launcher idempotency, and no automatic hotbar changes. The v0.1.9 improvised and Rote dialogs were rendered and exercised in Chromium fixtures at 1440px, 820px and 430px; the new dropdown, saved actor selection, live Difficulty, Sphere/GM/Quintessence controls, Rote presets, Advanced opening and no-horizontal-overflow checks passed.

**Live Foundry v14 of v0.1.11: not yet tested.** The user supplied a live screenshot of the v0.1.8 header to guide this update. The v0.1.10 GM token-selection behavior has not yet been observed in a live Foundry client. The existing v0.1.9 UI fixtures remain historical tests of the casting layout. Screenshots/render checks are browser fixtures rather than an installed Foundry UI. The external Dice Improvements/Paradox module was not installed or executed live; behavior is based on its published v0.2.0 listener contract.

See `CHANGELOG.md`, `TEST-REPORT.md`, and `05-HANDOFF-UPDATE-0.1.10.md`.

Fan-made Storyteller tools. Not affiliated with or endorsed by Paradox Interactive. This package includes no paid creator artwork.

## GitHub release and Foundry manifest

Install from the Foundry **Install Module** dialog using this manifest URL:

`https://raw.githubusercontent.com/rebsiot/M20-player-actions/main/module.json`

The manifest's `download` field points at the matching versioned GitHub Release ZIP. To upgrade an existing installation, back up the module folder and your Foundry world before installing or replacing files; modules are enabled separately in each world. A release tag is published by the repository workflow after its packaging, syntax, and mock tests pass. Live Foundry functionality is **not** established by a successful publishing workflow.

## v0.1.11 test status

The Basic Actions dashboard has Node contract tests and a Chromium HTML/CSS/interaction fixture at 1440, 820 and 430px for live pool tints, the 162-SVG searchable chooser, native roll payloads, Difficulty/Willpower, custom save/clear and responsive layout. The v0.1.11 dashboard was shown working in a real Foundry screenshot supplied by the user, which also exposed the original Ability-name chat heading mismatch. **The updated v0.1.12 chat title and icon gallery are not yet verified inside live Foundry v14**; see `TEST-REPORT.md`.
