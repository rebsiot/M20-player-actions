# Release Notes - WoD20 Player Actions

Changes players will notice, newest first. For development and detailed historical tests, see [the archived technical changelog](docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md).

## v0.1.18 - Pick Lock uses abilities on your sheet

- Fixed **Pick Lock** for standard Mage characters: it uses **Dexterity + Crafts** when Security and Larceny are not on the sheet. Supports localized/internal `craft` ability IDs.
- Standard Vampire characters use **Dexterity + Larceny**; optional custom **Security** is still recognized when present. The dashboard displays the real selected trait and dice pool.
- No skills, dots, Actors, hotbars, or compendium entries are created or overwritten. The native WoD20 dice and chat path is unchanged.
- Archived older ChatGPT development handoffs in `docs/handoffs/` and excluded them from the installable module ZIP; no new handoff was generated for this release.

## v0.1.17 - Optional first-login hotbar setup

- The Quick Tutorial now has independent checkboxes for Use Magick, Combat (Standard Attack), Basic Actions, and opening the Macro Compendium.
- Checked macros are assigned only after explicit Finish / Don't show again, using empty slots on the player's current hotbar page first. Unchecked items, occupied slots and pre-existing duplicates are not changed.
- Adds one GM-provisioned Combat launcher world Macro; reuses the previous Magick and Basic world launchers. World reference compendium stays at **48** protected macros.
- **Finish** keeps the tutorial available on the next login; **Don't show again** retains the separate user opt-out. Closing early changes neither preference nor hotbar.
- Native WoD20 rolls, Paradox and Combat Workflow ownership, players' characters, existing macros and GM customizations remain unchanged.

## v0.1.16 - More everyday actions

- Added a compact **Quick Tutorial** on first login: four pages, explicit **Don't show again** per-user preference, and a small Help link to reopen from either main panel. Closing without opting out allows it to appear again on the next login.
- Added **Willpower / Resistance**, a standalone rated trait check with adjustable difficulty (does not spend Willpower).
- Added **Basic Countermagick**, a defensive Arete roll for Mages; Sphere eligibility and success cancellation stay with the Storyteller, and it is not tagged as a spell cast.
- Added five **Modern Scenes** presets: Drive / Pursue, Pick Lock, Tail Someone, Street Information and Repair Equipment. They use real Abilities from the Actor.
- Added **Favorite Rotes**: player-and-character-specific stars in Use Magick plus one draggable hotbar shortcut.
- Expanded the optional macro catalog from 40 to **48 shortcuts**. Existing hotbars, user custom actions, and edited/deleted world compendium masters stay intact.
- Still awaiting live Foundry v14 verification, particularly Paradox listening and targeted combat end-to-end.

## v0.1.15 - Clearer release notes

- Rewrote player-facing release history and README, retained older technical notes, and corrected the GitHub release summary automation.
- **Documentation only:** Gameplay was unchanged from v0.1.14. This version was merged but published on 2026-10-16 after v0.1.16 work began.

## v0.1.14 - Combat Workflow and clearer interface

- **Standard Attack (Targeted)** launches the separate STL Combat Workflow with one target and an online GM. **Raw Attack** still makes a single attack check without damage.
- Renamed the player launcher to **Use Magick**, widened the Basic Actions dashboard, and collapsed the optional Effect / Focus editor by default.
- Increased the macro compendium to **40 shortcuts**, preserving hotbars and customized entries.

## v0.1.13 - Drag actions straight to your hotbar

- Added a player-readable world compendium of 39 optional draggable macros, including Basic Actions, custom slots, Magick, combat and utilities.
- Hotbars are not assigned automatically, and players cannot edit the compendium masters.

## v0.1.12 - Better roll names and more icons

- Buttons now give chat rolls their action names (such as Notice) instead of just their Ability names.
- Expanded the searchable icon picker to 162 Game Icons and added an informational dice-pool tint.

## v0.1.11 - Basic Actions dashboard

- Added 20 illustrated presets in four groups and five per-character custom buttons.
- Saved custom actions individually by user and Actor without touching world character data.

## v0.1.10 - Better GM character selection

- Prioritized selected or last-selected GM tokens, including unlinked NPCs. Explicitly bound macros remain bound.

## v0.1.9 - Faster Rotes and clearer difficulty

- Added Quick Rote casting, clearer final difficulty and remaining Quintessence previews.

## v0.1.8 - Less clutter while casting

- Grouped casting options, retained advanced controls, and added optional Focus notes without dice changes.

## v0.1.7 - Cleaner spell-roll messages

- Removed redundant chat labels while preserving native spell information for Paradox listeners.

## v0.1.6 - Remember your Mage

- Remembered manually selected characters and improved native magick labels for dice/Paradox integration.

## v0.1.5 - Optional hotbar launcher

- Added the optional Player Magick launcher while leaving existing hotbars alone.

## v0.1.4 - Simpler guided Magick

- Refined Sphere selection and casting layout and removed forced macro/hotbar generation.

## v0.1.3 - Working native spell cards

- Switched spell rolls to supported WoD20 magic chat cards and Powers to the supported power path.

## v0.1.2 - Sphere guidance

- Limited Sphere selections to known ratings and added expandable prompts.

## v0.1.1 - Reliable Foundry launcher

- Fixed Actors sidebar launcher visibility and offered character choice when needed.

## v0.1.0 - First release

- Added guided Mage casting, Rotes and native WoD20 dice integration.

---

**Installation:** Back up the Foundry world and installed module folder, then replace the module files with Foundry stopped and restart. The independent Combat Workflow/Paradox modules remain separate. See [README](README.md) for rollback and verification notes.
