# WoD20 Player Magick

**Module ID:** `wod20-player-actions`  
**Release:** v0.1.10 (2026-10-15)  
**Repository:** https://github.com/rebsiot/M20-player-actions

A focused, player-facing Mage: The Ascension 20th Anniversary casting interface for Foundry VTT v14 and the `worldofdarkness` (WoD20) system. The existing module ID is unchanged for compatibility.

## What the player sees

1. Open **Actors > Player Magick** or press **Shift+J**.
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
- **Quick Rote casting:** A Rote with recognized Sphere requirements that the Mage knows opens a compact confirmation instead of the full Sphere grid. It displays the Rote name, preselected Sphere levels, final Difficulty, and normal situational controls. Choose **Edit Spheres / Advanced** to reopen the full editor with that Rote prefilled. Rotes with missing requirements or levels above the Mage's known ratings open the full editor with a warning instead of silently guessing. The player/Storyteller still adjudicates combinations, scale and effect requirements.
- Manual Power activation is still available under the collapsed **Other Powers** section for backwards compatibility, without replacing native Item use methods.

## Rollback

Restore your backed-up `wod20-player-actions` module directory or the v0.1.9 ZIP, then restart Foundry and refresh browsers. This release performs no automatic Actor migration or hotbar modifications. It creates one world Macro for optional manual drag-and-drop. Any cast a player actually makes may spend in-game resources; restoring module code does not reverse those in-world changes.

## Testing and known limits

Tests run: JS syntax verification and eleven Node-based mock/contract tests, including GM selected/previous token precedence and unlinked token preservation, native roll-card deduplication and per-user preference persistence, three WoD20 localized spell-label matches, native roll routing, Power delegation, launcher idempotency, and no automatic hotbar changes. The v0.1.9 improvised and Rote dialogs were rendered and exercised in Chromium fixtures at 1440px, 820px and 430px; the new dropdown, saved actor selection, live Difficulty, Sphere/GM/Quintessence controls, Rote presets, Advanced opening and no-horizontal-overflow checks passed.

**Live Foundry v14 of v0.1.10: not yet tested.** The user supplied a live screenshot of the v0.1.8 header to guide this update. The v0.1.10 GM token-selection behavior has not yet been observed in a live Foundry client. The existing v0.1.9 UI fixtures remain historical tests of the casting layout. Screenshots/render checks are browser fixtures rather than an installed Foundry UI. The external Dice Improvements/Paradox module was not installed or executed live; behavior is based on its published v0.2.0 listener contract.

See `CHANGELOG.md`, `TEST-REPORT.md`, and `05-HANDOFF-UPDATE-0.1.10.md`.

Fan-made Storyteller tools. Not affiliated with or endorsed by Paradox Interactive. This package includes no paid creator artwork.

## GitHub release and Foundry manifest

Install from the Foundry **Install Module** dialog using this manifest URL:

`https://raw.githubusercontent.com/rebsiot/M20-player-actions/main/module.json`

The manifest's `download` field points at the matching versioned GitHub Release ZIP. To upgrade an existing installation, back up the module folder and your Foundry world before installing or replacing files; modules are enabled separately in each world. A release tag is published by the repository workflow after its packaging, syntax, and mock tests pass. Live Foundry functionality is **not** established by a successful publishing workflow.
