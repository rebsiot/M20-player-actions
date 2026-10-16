# 05 – Player Actions handoff update v0.1.17

**Owner:** Player Actions 05.2; repository `rebsiot/M20-player-actions`; module ID `wod20-player-actions`.
**Previous verified GitHub release:** v0.1.16 (merged/published 2026-10-16), full runtime retained.
**v0.1.17 status:** New source and packaged build; automated tests only, no live Foundry verification or server deployment.

## Requested behavior

Last tutorial page offers four independent checkboxes, all initially unchecked: add **Use Magick**, **Combat (Standard Attack Targeted)** and **Basic Actions** to the current user's hotbar; **Open the Player Actions Macro Compendium** when finished. The old **Don't show again** opt-out remains explicit; ordinary **Finish** applies choices without opting out; closing early does not assign anything. Choices are not automatic.

## Implementation and retention contracts

- Use Foundry v14's documented `game.user.assignHotbarMacro(macro, slot)` and `game.user.hotbar`, never direct User update or overwrite of occupied slots. Prefer free slots on active page and scan all 50 slots; skip duplicates found by ID or by matching macro command. Warnings for missing GM-launchers, full hotbar or failed assignment.
- The old **Use Magick** and **Player Basic Actions** world launchers remain. A third GM-only, player-readable world Script Macro **Player Combat (Targeted)** is provisioned idempotently. It calls `openStandardAttackShortcut`, which delegates to the independent `stl-combat-workflow` module. This is not new combat logic.
- The 48 protected reference Compendium Macros remain unchanged, player-readable but GM-editable. Opening the compendium is a separate checked action, using Foundry's Compendium Application class; it does not grant editor permission or import anything.
- Preserve per-user `tutorialDontShowAgain`; earlier dismissed users are not forced through onboarding again. Quick Tutorial links let them reopen it. Current user only; no changes to other users' hotbars or any Actors/Items/Scenes/Paradox.
- The installed module ID, manifest URL, native `magic`/`power` rolls, Paradox flags, release ZIP name and WoD20 v14 integration contracts stay unchanged.

## Test and deployment plan

Run Node syntax, all 19 Node/mock tests, the tutorial Chromium fixture at 1440/820/430, and full package ZIP CRC/path checks. Label all non-live tests automated/mock-tested. No live test has occurred in Foundry.

In a backed-up Foundry test world: GM login provisions the third world launcher, compendium persists with 48 macros. Fresh player login: go through four pages, leave all unchecked and Finish (nothing changes; tutorial will return), then return, check Basic/Use Magick/Combat and verify only free hotbar slots are populated. Existing assignments and duplicates must remain untouched. Try no free slots, missing Combat Workflow (the launcher warns), opening Macro Compendium with checkbox, relog after explicit Don't show again, manual reopen from either panel. Run real Arete/Paradox and Combat Workflow smoke tests separately; those were not modified here.

Back up `Z:\Data\modules\wod20-player-actions` and the Foundry world before replacing source. Roll back to v0.1.16 backed-up module, plus a matching world snapshot for newly created world Macro or hotbar documents (module ZIP rollback does not revert those user/world records).
