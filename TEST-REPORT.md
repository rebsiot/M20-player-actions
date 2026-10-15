# v0.1.4 Test Report — 2026-10-15

## Automated validation

- `node --check scripts/player-actions.js` — JavaScript syntax verification.
- `node tests/casting-guide.cjs` — Sphere filtering, clickable rank buttons in HTML, Rote defaults, collapsed guides, and wider dialog sizing.
- `node tests/character-default.cjs` — assigned character precedence, ownership, Change Character, explicit Actor UUID binding, and selected token fallback.
- `node tests/roll-routing.cjs` — one native `magic` card per cast, unchanged WoD20 roller routing, and native Power delegation.
- `node tests/smoke.cjs` — sidebar label, legacy Rote execute API, no macro creation, no hotbar assign/hook, no Actor-sheet pin hooks, and no Paradox module references.
- Headless Chromium fixture at 1440x900 and 820x900 — renders five Mage Sphere cards in 3 columns at wide viewport and 2 at medium viewport, with readable labels and visible action footer. This is **not** a live Foundry render.
- ZIP integrity verification — passed when packaging v0.1.4 (archive paths and CRCs validated).

## Not yet confirmed in live Foundry

- Actors sidebar label and Shift+J shortcut in installed Foundry v14.
- DialogV2 appearance inside the user's actual WoD20 skin and on smaller screens.
- Character change inside the casting dialog with multiple owned Actors.
- One real cast through the installed WoD20 system, with chat card and Willpower/Quintessence behavior.

## First requested live test

Open **Actors > Player Magick** on the assigned Mage PC and verify that character appears automatically. Open **Improvised Magick**, select one Sphere dot, and confirm the dice preview updates before running a roll.
