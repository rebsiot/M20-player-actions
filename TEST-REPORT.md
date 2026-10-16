## v0.1.13 — Macro compendium: automated verification

- `node --check scripts/player-actions.js`: **pass**.
- Node regression suite `tests/*.cjs`: **14/14 pass**. New `macro-compendium.cjs` uses a controlled mock of Foundry's native `CompendiumCollection.createCompendium`, `Macro.createDocuments`, pack ownership, per-world ledger and Actor resolution. It checks 39 script command strings, unique stable IDs, all referenced icon paths, no assignments to hotbar, first GM pack creation, player non-creation, repeated logins, deleted document preservation, direct native Notice/Dodge/Brawl/Firearms checks, native initiative helper, freeform roll and custom slots. Existing Player Magick, Rotes, casting chat/Paradox, GM token precedence and Basic Actions tests remain green.
- Browser fixtures: `browser-basic-actions.py`, `browser-ui.py`, `browser-rote-quick.py` pass at desktop, medium and narrow viewports (1440, 820 and 430 px). No UI layout changes to existing tools.
- Full package ZIP: safe module-root layout; CRC check; module ID, manifest URL/version/download fields; all 162 curated SVGs and original license/artist credits; no credentials or creator paid art.
- **Not a live Foundry test:** Runtime world-compendium provisioning, permission display, player drag-and-drop from Compendium Packs to Hotbar, user Script Macro permission, system combat helper on the installed WoD20 version, and actual in-world roll results require user verification.
- **No Actor migration.** World creation writes a new world compendium and hidden world setting after GM first login. Rollback of the module alone does **not** delete the world compendium.


# v0.1.12 Test Report — 2026-10-15

**Live evidence:** The user supplied a real Foundry v14 screenshot of published v0.1.11: Basic Actions 20+5 dashboard, native chat rolls and Ability-only headings such as **Alertness** (instead of the clicked **Notice**). That screenshot does **not** verify the new v0.1.12 behavior.

## Local verification

- JavaScript syntax: `node --check scripts/player-actions.js` passed.
- **13 Node/mock tests**: previous 12 plus `basic-chat-labels.cjs`. The new test verifies **Notice**, **Search**, custom button labels and Attribute-only labels in the native `DiceRollContainer.action`, one native `DiceRoller` call per click, Attribute/Ability details, native wound penalties/ignore-pain, specialties, native Willpower option and final Difficulty.
- `basic-actions.cjs` now checks 162 whitelisted icons and color scale thresholds (0 red, 4 yellow, 7+ green) as well as existing per-user/Actor custom persistence, missing traits and native roll path.
- **3 Chromium fixtures** at **1440, 820 and 430px**: Basic Actions tests live tile color values/legibility, 162-icon editor, category and text filtering (search `shield`), saved custom button name and native mock roll title, 19px icons, native controls, custom edits/clear and no horizontal overflow. Improvised Mage and Quick Rote fixtures remain unchanged and pass.
- Curated **162 SVGs** from the user-provided Game Icons archive validated as XML with no scripts or external loads; `ICONS-CREDITS.md` and original `icons/LICENSE.txt` included. Entire 4,180-SVG archive not shipped.
- Complete installable v0.1.12 ZIP checked for CRC, safe paths, manifest/version/download URL, root module ID, source/scripts/styles, creators and all icon files.

## Not verified live

Actual WoD20 v7.3.x's roll-container/chat template in the user's Foundry installation, Pain/Ignored Pain effects, specialty treatment, Willpower deductions and icon gallery on Foundry DialogV2 still require a live smoke test. The Mage/Paradox integration is unchanged and existing regressions are mocks, not live system tests.

## First test and rollback

Back up the world and current module folder; install v0.1.12 in a test world. Click **Notice** and verify the chat heading reads **Notice**, while the detail row still says **Perception + Alertness**, wound penalty and successes are correct. Then open Configure and search `shield`, and verify a low/medium/high dice pool button has soft red/yellow/green tint. Restore the v0.1.11 module directory/ZIP if any live discrepancy appears. No character data migration occurs, but prior rolls/Willpower deductions are not undone by rolling back code.

---

# v0.1.10 Test Report — 2026-10-15

## v0.1.11 - Basic Actions with Game Icons (2026-10-15)

**Status: locally packaged and verified by static / Node mocks / Chromium fixtures. NOT tested inside a live Foundry v14 world.**

- Source: released v0.1.10. Verified `scripts/player-actions.js` Git blob SHA (`0231c1357cc64e11828592ac6a422d0e94ffffab`) before editing.
- JavaScript: `node --check scripts/player-actions.js` passed.
- **12 Node/mock regressions:** existing 11 plus `tests/basic-actions.cjs`; the updated `launcher.cjs` validates two optional world Macro launchers and zero hotbar assignments. Tests cover known spell/Pardox labels, GM selected/previous token precedence, known Rote shortcuts, native WoD20 roll routing, twenty presets, actual 36 icon files and license, user-scoped custom settings per Actor, custom edit/clear semantics, missing Ability guard, native Actor ability options and NPC DiceRoller fallback.
- **3 Chromium fixtures**, each at viewport widths **1440, 820, 430**: new `tests/browser-basic-actions.py` validates real embedded SVG icon loading, 4x5 + 5 grid, direct native-roll API options, difficulty rocker, Willpower reset, custom save/roll/clear, responsive columns, no horizontal overflow; the two prior `browser-ui.py` and `browser-rote-quick.py` fixtures still pass.
- 36 SVGs validated as XML, without script/onload/foreignObject or external injected resources. The original ZIP archive's creator attribution text is packaged verbatim, plus a curated author credit list.
- Release ZIP: `tools/package_release.py` builds the complete top-level `wod20-player-actions/` module including all 36 icons, both Macro source files, README, credits, tests and handoffs. ZIP CRC, manifest version/URL, safe paths and expected size verified.
- **Compact layout refinement:** Updated Basic Actions HTML and CSS, added explicit `Per + Alert`/`Int + Occ` and full accessible tooltip assertions to Node tests, and added Chromium assertions for all 20 `19px` SVGs, button height (≤65px), complete roll-pair text, no clipped buttons and desktop panel height ≤660px. Confirmed all 12 Node tests plus all Chromium fixtures (1440/820/430 px) remain green after the revision. Narrow screens use 3 columns and scroll; the bottom controls no longer obscure custom slots. The native roll implementation was not modified.
- **No live tests of native Actor API, chat rendering, token permissions, or Willpower expenditure in Foundry**. Test on a backed-up world; do not interpret headless Chromium or Node mocks as end-to-end success.
- First live test: as a player, manually drag `Player Basic Actions` from Macro Directory to a hotbar slot. Click Notice and check Attribute + Ability + Difficulty in native chat; test one Willpower roll and one saved custom action. As GM test selected/last token and an NPC. Confirm Player Magick's quick Rote still works.

## Automated verification

- `node --check scripts/player-actions.js`: **passed**.
- **11** Node/mock tests under `tests/*.cjs`: **passed**, including new `gm-token-priority.cjs`.
- The GM token test covers a currently selected unlinked NPC Token Actor overriding preferred/assigned Actors; automatic capture and persistence of `controlToken` selection; still using that token after deselection; replacing the cached token on a new selection; restoring it from a hidden per-user setting in a simulated new session; no casting from a deleted token; warning/aborting when multiple tokens are selected; explicit Actor UUID overrides; unchanged player preferences and zero hotbar assignment.
- Existing Rote, dice/chat, Paradox compatibility, picker, cast control, launcher and menu tests remain green.
- The v0.1.9 responsive Chromium fixtures were run against the unchanged casting dialogs; those checks are regression checks only, **not a live Foundry test**.
- Complete module archive checked for `wod20-player-actions/module.json`, v0.1.10 metadata/download URL, CRC integrity, safe paths and no symlink entries.

## Not verified live

The real Foundry v14 `controlToken` hook event, TokenDocument UUID resolution for linked/unlinked tokens, per-user `game.settings.set` persistence, and the full cast/chat/Paradox workflow have **not** been tested in the user's Foundry world. The tests above are simulated APIs and local browser fixtures only.

## First live test

1. As GM on a test scene, select one **Mage NPC token** (preferably an unlinked token with a different rating from its base Actor).
2. Deselect that token and click **Player Magick** (or use Shift+J); verify the shown caster and Arete are that token's Actor, not your previously selected Mage.
3. Try a low-impact improvised cast. Check the native chat card names the selected Mage and any enabled Dice Improvements Paradox display occurs once.
4. If incorrect, roll back by restoring the backed-up **v0.1.9** module folder and restarting Foundry. This patch does not migrate world data; resources spent during testing are not automatically reversed.

---

# v0.1.9 Test Report — 2026-10-15

## Automated and browser verification

- `node --check scripts/player-actions.js` passed.
- All nine `.cjs` tests passed, including **`tests/character-picker.cjs`** for permitted Mage options, selected-name display, and exclusion of unowned/non-Mage Actors. Historical roll/Paradox, power, launcher, macro-preservation and Rote tests stayed green.
- `tests/browser-ui.py` passed at viewport widths **1440, 820 and 430 px**, exercising native `<select>` character change, persistence of `preferredActorUuid`, immediate re-render with the selected Mage's stats/Spheres, and a strict permissions check that unowned and non-Mage Actors never appear.
- Top Difficulty shows an em dash before selecting Spheres, then follows the exact clamped roll difficulty as Reality, Quintessence and GM modifier change. The lower preview no longer repeats difficulty.
- Native `magic` card/Paradox spell labels are unchanged. One native roll remains the only roll per cast; no roll is issued by the header picker itself.
- Complete ZIP checked for CRC, expected `module.json` path, and versioned manifest/download metadata.

## Not verified live

Actual Foundry VTT v14 rendering, User Settings persistence between separate browser sessions, live WoD20 system API calls and Dice Improvements processing have not been run here. Browser fixture screenshots are illustrative only.

## Suggested one live test and rollback

With two owned Mage Actors, open Improvised Magick, select Sphere 2 and verify header Difficulty 5 for Coincidental (+3). Change to Vulgar/no witnesses (+4) to see 6, and increase the GM modifier to +1 to see 7. Choose the second Mage from the character dropdown: it must immediately display the second character's Arete/Spheres; close and reopen and confirm the last-used Mage persists. Do not cast until these values look right. Back up `Z:\Data\modules\wod20-player-actions` and the world; roll back to v0.1.8 if needed.

---

# v0.1.8 Test Report -- 2026-10-15

## New checks performed

- `node --check scripts/player-actions.js`: passed.
- All **eight** existing and new Node mocks passed: `casting-guide.cjs`, `casting-controls.cjs`, `character-default.cjs`, `chat-card-clarity.cjs`, `launcher.cjs`, `paradox-chat-contract.cjs`, `roll-routing.cjs`, `smoke.cjs`.
- New `casting-controls.cjs` checks: compact single-bar character/resources markup; reality, quint, GM controls in correct order; rocker input names and min/max; checkbox row and focus annotation; Effect/focus field before collapsed Casting rules; single native roll; unchanged final difficulty and delayed Quintessence deduction; preserved exact localized Paradox detector marker.
- Chromium fixture (`browser_ui_test.py`, mock Foundry dialog containing the **actual production HTML, CSS and event handlers**) at 1440, 820 and 430 viewport widths: **passed**. Interacted with both rockers; disabled values at 0/2 Quintessence and -3/+3 GM modifier; verified FormData, Focus checkbox, live preview at difficulty 3, initially collapsed rules, and absence of horizontal overflow. Header/control bar measured 47/60 pixels at desktop and 820 widths. Images are included as separate development previews but **are not screenshots of a live Foundry client**.
- Release package: manifest `version`, module ID, archive paths and CRC validated; no Player Magick hotbar assignment logic added.

## Not tested live

- Foundry v14 on the user's Ubuntu deployment, native DialogV2 chrome/control CSS conflicts, true character and resource state, independent Dice Improvements Paradox-die listener and Willpower resource application. No claims of live success.
- Real player/GM permissions and narrow Foundry desktop UI should be smoke-tested after installation.

## Suggested one live test

Open Player Magick on an owned Mage with 2 Quintessence: verify the top strip is single-line at desktop, increment Quintessence from 0 to 2 with disabled `+`, set GM modifier -1, check Use Focus, cast a Coincidental effect, and confirm the native chat card includes `Focus used` and only one native roll. Return to v0.1.7 from the backed-up module directory if any rendering/roll error occurs.

---

# v0.1.7 Test Report — 2026-10-15

## Automated/mock-tested

- `node --check scripts/player-actions.js` — JavaScript syntax verified.
- `tests/casting-guide.cjs` — width/layout, Sphere dots, Rote defaults, collapsed guidance.
- `tests/character-default.cjs` — **per-user** persistent character preference after Change Character; precedence over assigned Actor; explicit macro override; deleted/unowned Actor fallback; token fallback.
- `tests/chat-card-clarity.cjs` — native Mage action/roll-title/system-text deduplication, one automatic WoD20 difficulty, preserved localized Paradox marker, and optional nonzero modifiers.
- `tests/roll-routing.cjs` — native WoD20 `magic` origin, localized Coincidental/Vulgar/Witnessed markers, one native roll per cast, and Power use delegation.
- `tests/paradox-chat-contract.cjs` — contract mock representing WoD20 template and Dice Improvements v0.2.0 chat marker match with two existing Paradox dice. Does not run that external module live.
- `tests/smoke.cjs` — player panel, legacy Rote macro compatibility, no hotbar modifications and no direct Paradox accounting.
- `tests/launcher.cjs` — one optional world macro on GM load, idempotent creation, no hotbar assignment.
- `tools/package_release.py` — module ID/version and manifest/download match, full installable ZIP, CRC and required files.

All seven `.cjs` tests passed in local Node mocks. No live Foundry, browser session, or separate module interaction was executed in this build. The user screenshot from the previous v0.1.6 card is live evidence of duplication, not confirmation that v0.1.7 renders cleanly. v0.1.5's visual Chromium fixture checks remain historical, not new live verification.

## Known limitations and next live test

- The Paradox-die listener belongs to Dice Improvements v0.2.0+ (or the old Paradox module), NOT to Player Magick. It processes only Mage chat rolls with the exact WoD20 spell classification label. It also requires **existing temporary Paradox > 0**; otherwise zero dice are marked. Do not enable both Paradox handlers simultaneously.
- User-scoped Foundry v14 preference storage should be tested from an actual player account and after reconnect; simulated `game.settings` was used here.
- To live-test: On a disposable Mage Actor with **2 temporary Paradox**, using Dice Improvements v0.2.0 with old `wod20-paradox` disabled, cast an Improvised Coincidental spell. Expect the first two native dice shown in grayscale; a 1 on either should expose Add/Ignore Paradox in chat. Then change casting character, close/reopen, and confirm the choice persists. Report the first error or missing effect observed.

## Rollback

Back up the world and original `Z:\Data\modules\wod20-player-actions` folder before upgrading. Restore that folder or v0.1.6 ZIP and restart Foundry to roll back; no automatic Actor migration runs. Any casts that updated Quintessence/Willpower or other game data are not undone by restoring module code.

## Additional v0.1.7 card acceptance check

On a Mage PC with Arete 3 and Matter 2 / Spirit 2, cast a Coincidental effect without modifiers. Expect one title (`Arete • Magick`), a short `3d10` line, exactly one localized spell classification, one Spheres line, one final `Difficulty: 5`, and the native successes/dice display. Cast again with a situational adjustment or Quintessence to confirm a single `Modifiers:` line. Verify Dice Improvements still recognizes the localized marker and marks existing Paradox dice once, without direct Paradox state edits in Player Magick.


## v0.1.9 refinement — prominent Difficulty and quick Rotes

- **Native execution / ownership:** The existing `performMageCast` and `runDice` functions are unchanged. Rotes with populated and valid structured Sphere requirements use `quickCastRote`, prefill hidden Sphere fields, and submit to that same casting function. Requirements missing or beyond current known Sphere ratings open the full editor with a warning, not a silent cast. GM/player control checks are preserved.
- **UI metrics:** The casting header shows Arete dice, highest Sphere, Quintessence deduction, Willpower effect and high-contrast final Difficulty. Rocker label displays available Quintessence minus planned spend (0…min(3,available)). Willpower preview uses native `CONFIG.worldofdarkness.willpowerBonusDice` mode; Focus continues to be descriptive only.
- **Static/Node:** All ten `.cjs` tests passed, including the new `tests/rote-quick-cast.cjs`, full/improvised Sphere casting, native/paradox localized markers, chat-card formatting, character defaults/dropdown, launcher idempotency, and hotbar safety. JavaScript syntax check passed.
- **Real browser fixture, not Foundry:** `tests/browser-ui.py` and `tests/browser-rote-quick.py` passed at 1440, 820, and 430 viewport widths. Clicked Quint and GM rockers, toggled Willpower/Focus, changed characters in the full editor, opened Rote Advanced, verified derived difficulty and resource preview, and checked for horizontal overflow. Screenshots are visual mocks of production HTML/CSS run outside Foundry.
- **Release ZIP:** Validated top-level `wod20-player-actions/module.json`, current 0.1.9 metadata, manifest/download URLs, absence of traversal/symlinks, and CRC using `ZipFile.testzip`.
- **Not tested:** Live Foundry v14 with actual installed WoD20 module/characters, real DialogV2 event lifecycle, actual native dice display, and Dice Improvements runtime interaction. These remain required before live success can be claimed.
