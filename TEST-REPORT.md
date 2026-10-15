# v0.1.6 Test Report — 2026-10-15

## Automated/mock-tested

- `node --check scripts/player-actions.js` — JavaScript syntax verified.
- `tests/casting-guide.cjs` — width/layout, Sphere dots, Rote defaults, collapsed guidance.
- `tests/character-default.cjs` — **per-user** persistent character preference after Change Character; precedence over assigned Actor; explicit macro override; deleted/unowned Actor fallback; token fallback.
- `tests/roll-routing.cjs` — native WoD20 `magic` origin, localized Coincidental/Vulgar/Witnessed markers, one native roll per cast, and Power use delegation.
- `tests/paradox-chat-contract.cjs` — contract mock representing WoD20 template and Dice Improvements v0.2.0 chat marker match with two existing Paradox dice. Does not run that external module live.
- `tests/smoke.cjs` — player panel, legacy Rote macro compatibility, no hotbar modifications and no direct Paradox accounting.
- `tests/launcher.cjs` — one optional world macro on GM load, idempotent creation, no hotbar assignment.
- `tools/package_release.py` — module ID/version and manifest/download match, full installable ZIP, CRC and required files.

All six `.cjs` tests passed in local Node mocks. No live Foundry, browser session, or separate module interaction was executed in this build. v0.1.5's visual Chromium fixture checks remain historical, not new live verification.

## Known limitations and next live test

- The Paradox-die listener belongs to Dice Improvements v0.2.0+ (or the old Paradox module), NOT to Player Magick. It processes only Mage chat rolls with the exact WoD20 spell classification label. It also requires **existing temporary Paradox > 0**; otherwise zero dice are marked. Do not enable both Paradox handlers simultaneously.
- User-scoped Foundry v14 preference storage should be tested from an actual player account and after reconnect; simulated `game.settings` was used here.
- To live-test: On a disposable Mage Actor with **2 temporary Paradox**, using Dice Improvements v0.2.0 with old `wod20-paradox` disabled, cast an Improvised Coincidental spell. Expect the first two native dice shown in grayscale; a 1 on either should expose Add/Ignore Paradox in chat. Then change casting character, close/reopen, and confirm the choice persists. Report the first error or missing effect observed.

## Rollback

Back up the world and original `Z:\Data\modules\wod20-player-actions` folder before upgrading. Restore that folder or v0.1.5 ZIP and restart Foundry to roll back; no automatic Actor migration runs. Any casts that updated Quintessence/Willpower or other game data are not undone by restoring module code.