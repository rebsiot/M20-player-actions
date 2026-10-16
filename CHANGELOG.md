# Changes — WoD20 Player Magick

## v0.1.10 — 2026-10-15

- **GM caster priority:** When a GM launches Player Magick without an explicitly bound Actor, use the single selected canvas token first; if none is selected, resolve the last token selected. Previously remembered/assigned Actors are only fallback options. Previously selected synthetic/unlinked NPC tokens retain their own token Actor rather than reverting to the world base Actor.
- **Token persistence:** A `controlToken` hook remembers the selected TokenDocument UUID in a hidden per-user Foundry v14 setting (`lastGmTokenUuid`). Deselecting the token does not clear it; deleting the token invalidates the reference and falls back safely. Quick consecutive selections queue setting writes in order. Multiple selected tokens prompt for a single selection rather than guessing.
- **Preserved:** Regular players retain the v0.1.9 actor preference; explicit Actor UUID macro bindings are not overridden by token selection. Existing quick Rotes, casting options, native WoD20 roll/Paradox classification, world data and hotbars stay unchanged.
- **Automated tests:** All **11** Node/mock tests passed, including new `gm-token-priority.cjs` covering current/previous tokens, per-GM persistence, unlinked synthetic Actors, stale token fallback, multi-selection, player isolation, and bound macros. Syntax and ZIP integrity checks passed. **Not live-tested in Foundry v14.**
- **Upgrade/rollback:** Back up the world and module directory before upgrading; install the complete ZIP, restart and refresh. Restore v0.1.9 to roll back. No migration is run. Casting can still deduct in-world resources after pressing Roll.

## v0.1.9 — 2026-10-15

- **Improved roll clarity:** Make final Difficulty the dominant, high-contrast value in the upper-right casting summary, with readable Arete dice, highest chosen Sphere, Quintessence reduction, and Willpower effect alongside it. Remove the extra lower roll-summary line. Willpower shows +1 success or +3 dice according to the installed WoD20 setting; no new bonus is calculated.
- **Quintessence remaining:** Move available Quintessence out of the top header and label the rocker `Quintessence (N remaining)`, reducing the displayed remaining amount immediately as the player steps up the planned expenditure. The server-side actual-resource check and after-roll spending remain unchanged.
- **Fast known-Rote casting:** Selecting a Rote with readable and available Sphere requirements opens a smaller confirmation showing the named Rote and required Sphere levels, live Difficulty, and only the necessary casting decisions. **Edit Spheres / Advanced** opens the original full prefilled editor; a Rote without recognized or usable requirements safely falls back to that editor. Neither pathway bypasses the native Arete roll, character ownership checks, or the Paradox-die classification marker.
- **Verification:** Ten Node/mock tests passed, including Rote quick cast/Advanced/fallback, plus two Chromium fixtures (improvised and Rote) at 1440, 820, and 430 pixels. No horizontal overflow. Live Foundry v14 verification remains pending.
- Changed the inline casting header from a distant **Change** button to a character-name dropdown directly after **Casting as**. It includes only owned/GM-accessible Mage Actors and defaults to the remembered or assigned Mage; choosing another saves that preference and opens a fresh casting screen for that Mage without a second chooser dialog.
- Added the **live final Difficulty** to the same compact casting header. Shows a dash until a Sphere is selected, then updates on Sphere, Reality, Quintessence, or GM modifier changes. Removed duplicate difficulty from the lower preview.
- Clarified all three Reality labels to read `+3/+4/+5 to highest Sphere` without changing math or Paradox markers.
- No new auto-hotbar behavior, no dice engine, resource, or Paradox listener changes. Existing Rote data, launcher macro, and World IDs/flags remain intact.
- Initial v0.1.9 checks were supplemented by the ten-test final pass noted above; live Foundry verification still pending.


## v0.1.8 -- 2026-10-15
- **UI:** Replace the three tall caster/Arete/Quintessence cards with one compact character-and-resources strip, retaining the small Change button and remembered character behavior.
- **UI:** Put Reality classification, Quintessence spent, and GM modifier on the same row when screen space permits. Quintessence and GM modifier use minus/plus rockers with visible values, accessible labels, immediate difficulty-preview updates and disabled buttons at their limits. On narrow screens, reality stays above the paired rockers to avoid horizontal scrolling.
- **UI:** Move Use Focus, Spend 1 Willpower and Extended casting/ritual to one checkbox row; place Effect/focus description below the action controls and the collapsed Casting rules expander after the description. Keep Sphere cards and their own collapsed rules guides.
- **Focus:** Use Focus is an optional, initially unchecked, descriptive marker on the existing native chat card. Checking it adds `Focus used` to roll notes, but never changes the dice pool, difficulty or resources automatically; the GM modifier remains the explicit place for an agreed adjustment.
- **Preserved:** WoD20 native DiceRoller, localized Coincidental/Vulgar label needed by the separate Dice Improvements Paradox-die listener, per-user character preference, Rotes, Quintessence/Willpower handling, optional launcher and zero automatic hotbar assignments.
- **Testing:** Eight Node/mock contract tests plus actual Chromium fixture clicks and responsive layout checks at 1440/820/430 widths; syntax and ZIP integrity. **Not verified in live Foundry v14.**
- **Upgrade/rollback:** Module-only code and CSS changes; no migration. Back up the existing module directory/world and restore v0.1.7 if necessary. GitHub publishing requires merge of the v0.1.8 PR.

## v0.1.7 — 2026-10-15
- **Changed:** Condensed Mage chat cards without replacing WoD20's renderer. The action/title appears only once; the native `dicetext` now shows the Arete pool (e.g., `3d10`) instead of a second copy of the action; duplicate `systemText` is suppressed on Mage rolls. Power/general rolls retain the prior fields.
- **Changed:** Removed the redundant `Reality: coincidental` line, redundant difficulty breakdown (WoD20 already adds the final difficulty), and zero-value modifier notes. Nonzero situational and Quintessence adjustments appear in a single concise `Modifiers:` line. Ritual notes remain when selected.
- **Preserved:** Exact localized `Coincidental spell`/`Vulgar spell` classification in native `extraInfo` for Dice Improvements Paradox-die detection, single native `magic` roll, per-user character choice, optional launcher macro and no automatic hotbar setup. Does not process Paradox.
- **Tests:** All seven Node mock/contract tests passed, including the new native-card formatting test, plus JS syntax and ZIP integrity. **Live Foundry v0.1.7 not verified.**
- **Upgrade/rollback:** Complete v0.1.7 ZIP, no schema migration. Back up the installed module and world; restore v0.1.6 to roll back. Confirm chat card content and Paradox detection on a real Mage before retiring the backup.

## v0.1.6 — 2026-10-15
- **Fixed:** Remember the last character explicitly chosen via **Change Character** in a Foundry v14 user-scoped setting (per player, per world; survives logout and changing devices). Before any explicit choice, use the assigned Foundry character as before. Validate ownership whenever restoring a saved character.
- **Fixed:** Native `magic` chat rolls include the exact localized WoD20 Coincidental/Vulgar casting label so the independent Dice Improvements v0.2.0 Paradox-die listener can recognize the casting roll. The v0.1.5 `Reality:` note is retained alongside the label.
- **Preserved:** Only one native WoD20 Arete roll per cast. No new Paradox engine, flags, accounting, or duplicate listeners. Explicitly bound macros still target their original Actor. The optional Player Magick launcher remains; no hotbar assignment is made.
- **Upgrade/rollback:** Safe module-only code update, no Actor or chat migration. Back up the module folder and world. To roll back, restore v0.1.5 files; existing per-user preferences remain harmless but are ignored by v0.1.5.
- **Automated tests:** Six Node mock/contract tests, JavaScript syntax, ZIP CRC and module metadata passed.
- **Live Foundry:** Not yet tested. Validate actor switching across reopen/relogin, then a native spell chat card on a Mage with existing Paradox using Dice Improvements v0.2.0 (old Paradox module disabled).

## v0.1.4 — 2026-10-15

- Renamed Actors sidebar and Shift+J action to **Player Magick**. The **module ID remains `wod20-player-actions`**.
- The assigned Foundry user character is used by default, ahead of any selected token. Explicit Actor UUID bindings in existing macros continue to override this default. Character selection remains accessible as a secondary option.
- Redesigned the guided casting dialog as a wider, viewport-sensitive layout: three/two/one-column Sphere cards; larger clickable Sphere-rank buttons; collapsed dot-level explanations; consolidated character/Arete/Quintessence header and casting settings; live difficulty preview; optional character change.
- Removed player-facing macro generation, Macro buttons, embedded Item pins, drag-to-hotbar creation, and the hotbarDrop hook. **No user's hotbar is populated, changed or cleared.** Existing macros remain usable through `api.execute`.
- Kept the native WoD20 dice engine, `magic` chat origin, rules/math, Rote handling, native Power delegation, and delayed Quintessence deduction. This module has **no Paradox module dependency or Paradox state changes**.
- Added mock tests for character default, no hotbar side effects, legacy macro execution, and new dialog. No live Foundry test claimed.

## v0.1.3 — 2026-10-12

- Fixed blank Mage chat cards by selecting the supported native WoD20 roll origin `magic` instead of unsupported `arete`.
- Power rolls use native roll origin `power` rather than an unsupported identifier.

## v0.1.2 — 2026-10-12

- Restricted Sphere pickers to the character's known Sphere levels; added expandable per-dot capability guides.
- Added dynamic highlight of selected Sphere tiers and optional effect/focus description.

## v0.1.1 — 2026-10-12

- Fixed Actors sidebar action registration during Foundry v14 startup; registered Shift+J at init and backfilled already-rendered sidebar.
- Added initial character picker/change option when no selected token or assigned character existed.

## v0.1.0 — 2026-10-12

- Initial Player Actions panel, guided Mage/Rote casting, native WoD20 dice bridge, optional Power activation, and explicit hotbar shortcut creation (now paused in v0.1.4).

## v0.1.5 — 2026-10-15
- Create exactly one optional `Player Magick` launcher Macro in the world Macro Directory when a GM loads the module.
- Players may drag it to a hotbar manually; never automatically assign any hotbar slot.
- Existing macros and duplicate-name entries are preserved without overwrites.
- No changes to WoD20 native rolls or Paradox interaction.
