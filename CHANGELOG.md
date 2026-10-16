# Release Notes — WoD20 Player Actions

These are the changes you will notice when playing. Newest versions are first. For technical implementation history, see [the archived developer changelog](docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md).

## v0.1.15 — Clearer release notes

**What's changed**

- Rewrote the release history to explain what each update does, without making you wade through code and test details.
- Updated the README and the GitHub release process to use a short, version-specific summary.

**Gameplay is unchanged from v0.1.14.** Your characters, spells, custom actions, compendium macros and hotbars do not need to be reset.

## v0.1.14 — Combat Workflow and a clearer interface

**What's new**

- **Standard Attack (Targeted)** requires one targeted defender and starts the separate **STL Combat Workflow**: attack, defense, damage, soak and GM health application or undo. Combat Workflow v0.1.4 or later must be enabled, and a GM must be online.
- **Raw Attack** remains available when you only need a Brawl, Melee or Firearms dice check. It requires no target and does not calculate damage.

**What's improved**

- **Player Magick** is now called **Use Magick** in the supplied shortcuts and player interface.
- The Basic Actions window is about 15% wider, with easier-to-read button labels and dice pools.
- The optional Effect / Focus description in Improvised Magick starts collapsed, like the Rote details.
- The draggable macro collection now contains **40 shortcuts**. Existing hotbar positions and GM-customized macro content are preserved.

## v0.1.13 — Drag actions straight to your hotbar

- Added **Player Actions — Hotbar Macros**, a compendium of 39 draggable shortcuts: Basic Actions, five custom slots, Magick, attacks, defenses, Initiative and utility tools.
- Players choose which shortcuts they want. Nothing is automatically placed on a hotbar.
- A GM creates the world compendium on first login. Players can read and use it without editing its master macros.

## v0.1.12 — Better roll names and more icons

- Chat cards now show the **button you clicked** (such as **Notice**) instead of merely the underlying Ability (such as Alertness).
- Expanded the custom-button icon picker to **162 searchable Game Icons** with categories.
- Added gentle dice-pool shading: weaker pools lean red, midrange yellow, and stronger pools green. The color is only a visual guide; it never changes a roll.

## v0.1.11 — Basic Actions dashboard

- Added **20 ready-made actions** in four rows, plus **five configurable buttons** for your own Attribute + Ability checks.
- Each action has an icon, readable dice pool, and direct native WoD20 roll.
- Players can rename, reconfigure or clear their custom buttons. Choices are saved separately for each player and character.
- Kept the dashboard compact and created an optional launcher without automatically assigning it to the hotbar.

## v0.1.10 — Better GM character selection

- The GM casts with the **selected token**, or the **last selected token** if none is currently selected.
- Unlinked NPC tokens use their own token-specific Actor, rather than the base Actor.
- Players' character preferences and explicitly actor-bound Rote macros continue to work as before.

## v0.1.9 — Faster Rotes and clearer difficulty

- Added a smaller **Quick Rote Cast** window. Advanced options remain available when needed.
- Made final casting Difficulty prominent, clarified Reality modifiers, and showed the Quintessence remaining after a planned spend.
- Made it easier to switch between characters from the casting window.

## v0.1.8 — Less clutter while casting

- Grouped casting settings and resources into a more compact layout.
- Added **Use Focus** as an optional chat note, without applying an unrequested dice modifier.
- Kept additional casting rules and explanations out of the way until expanded.

## v0.1.7 — Cleaner spell-roll messages

- Removed repeated labels and redundant information from Mage chat cards.
- Kept native WoD20 dice rolls and the casting labels needed by the separate Paradox listener.

## v0.1.6 — Remember your Mage

- Remembered the character you selected for casting between sessions.
- Corrected native spell labels so the separate Dice Improvements Paradox listener can recognize eligible casts.

## v0.1.5 — Optional hotbar launcher

- Added an optional **Player Magick** launcher macro, available for players to place on their hotbars manually.
- Existing world macros and hotbar assignments were left alone.

## v0.1.4 — Simpler guided Magick

- Improved the Sphere picker and guided casting layout.
- Used the player's assigned character by default, with character switching available.
- Removed automatic macro and hotbar generation from the casting interface.

## v0.1.3 — Working native spell cards

- Fixed blank Mage chat cards by using WoD20's supported magic roll type.
- Kept Power rolls on WoD20's supported Power roll path.

## v0.1.2 — Sphere guidance

- Limited Sphere rank choices to what the character knows.
- Added expandable explanations of Sphere capabilities and an optional effect description.

## v0.1.1 — Reliable Foundry launcher

- Fixed the Actors sidebar launcher appearing inconsistently during Foundry startup.
- Added a character choice when no selected or assigned character was available.

## v0.1.0 — First release

- Introduced guided Mage casting, Rotes and native WoD20 dice integration.

---

**Install and rollback:** Back up your world and `Z:\\Data\\modules\\wod20-player-actions` before updating. Restart Foundry and reload clients after installation. Restoring an older module version does not undo gameplay changes such as damage or spent resources. For prerequisites, troubleshooting and the full workflow, see [README](README.md).
