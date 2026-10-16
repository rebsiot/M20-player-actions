# 05 — Player Actions handoff update v0.1.12

**Owner:** `wod20-player-actions` / Player Actions. **Repo:** https://github.com/rebsiot/M20-player-actions.
**Starting point:** Published v0.1.11, `main` merge SHA `eb2ebb6e02984d59433e8293a31b7d6c56f5627c`; current working source verified against GitHub `scripts/player-actions.js` blob `0310495056f72eee87d664370111c1b0085eeaa6`.

## User request and live screenshot

Published v0.1.11 Basic Actions dashboard is working in the user's Foundry screenshot. The user requested: (1) chat card title should match clicked action, not underlying WoD20 Ability; (2) more selectable SVG icons for custom slots; (3) very subtle tile tint from 0 dice red through 4 yellow to 7+ green. Interpret coloring as total base Attribute+Ability dice pool, not standalone Ability rating.

## Implementation

- WoD20's `actor.api.rollAbility` source sets `diceRoll.action=abilityName`, which produced the screenshot's "Alertness" chat heading even when Notice was clicked. Build the **same native `DiceRollContainer` fields** with `action=action.label` and send it through the **single native `DiceRoller`**. Preserve WoD20's selected Attribute and Ability IDs/labels, base pool, wound penalty (via its CombatHelper.ignoresPain), native specialty and Willpower settings, difficulty, origin `general`, chat dice and successes. This is not a second dice engine or an independent chat card. Any specific WoD20 live version difference requires live verification.
- Game Icons: from the user-provided `game-icons.net.svg.zip`, expand 36 -> **162** safe local SVGs, 9 categories including Featured. Search/filter by name/category in a scrollable editor; save the same string filename in the existing per-user-per-Actor setting. No migration. Update `icons/icon-authors.json`, `ICONS-CREDITS.md` and keep original CC BY license.
- Very light CSS gradient tint using `--wpa-pool-hue`, interpolated 0=>0deg red, 4=>52deg yellow, 7+=>120deg green. 0-dice unavailable rolls are disabled. All names, pools and tooltips stay visible. Custom buttons also tint but retain distinct edit border.
- No changes to Mage Sphere/Rote/Paradox behavior, the optional pair of launcher macros, GM selected/previous token selection, saved custom slots, permissions, hotbars or WoD20 game data.

## Tests and release

- JS syntax, 13 Node/mock tests and three Chromium fixture scripts across 1440/820/430 viewports including custom icon search and preset color checks. 162 SVG XML files, license and ZIP integrity verified. These are **not live Foundry v14 verification**.
- Full ZIP `wod20-player-magick-0.1.12.zip`, same module ID and stable manifest path. Preserve prior published v0.1.11 until the PR is approved and merged; automated publishing uses its existing versioned ZIP name to avoid broken installed manifests.
- Upgrade: back up `Z:\Data\modules\wod20-player-actions` and the world, install full ZIP, restart Foundry and hard-refresh. Rollback: restore v0.1.11 module directory/ZIP. No Actor migrations; rolling/spending during testing may have in-world effects.
- Next live test: click Notice and inspect the **action-name heading** plus the same Attribute+Ability/wounds/successes, then custom shield icon search, then soft colors. Update the owning `05` handoff with live status before subsequent development. No cross-module contract change requiring GLOBAL updates.
