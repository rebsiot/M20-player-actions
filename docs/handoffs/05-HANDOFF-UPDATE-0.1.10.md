# 05 — Player Magick handoff update v0.1.10

**Owning conversation:** Player Magick development (this continuing thread, per user's explicit ownership direction).  
**Module ID:** `wod20-player-actions` (unchanged).  
**Repository:** https://github.com/rebsiot/M20-player-actions  
**Baseline:** Verified GitHub `main` v0.1.9 (merge commit `4babc59c5e94c49e4182452bb589303f75afe86b`) and complete working ZIP `wod20-player-magick-0.1.9.zip`.

## User request

> Player actions — if GM, use selected token or previous token to do the spell.

Previously `resolveActor()` always favored `preferredActorUuid` over a selected token, even for GM. That meant GM-launched Player Magick could cast as the last manually chosen Actor rather than the controlled token.

## Implemented v0.1.10 decision

- For **GM unbound launches**, actor precedence is: (1) exactly one currently controlled token's Actor; (2) **last selected token**'s resolved `TokenDocument.actor` after deselection; (3) existing manually remembered character; (4) assigned character; (5) chooser. For multiple selected tokens, warn and stop instead of silently using a different Actor.
- Capture on native `Hooks.on("controlToken", (token, controlled) => ...)` only when `controlled` is true; never overwrite memory on deselection. Cache immediate selected token UUID and persist to hidden user-scoped `lastGmTokenUuid`. Serialize async setting writes so rapid selection cannot persist an older token afterward.
- Resolve the prior token from its **TokenDocument UUID** (`Scene.X.Token.Y`) each time, not a world Actor ID. This retains the correct synthetic Actor and detects deleted/missing tokens without stale references. Fallback is safe when the TokenDocument is missing/unresolvable.
- Normal players' `preferredActorUuid` precedence stays unchanged; explicit actor-bound Rote/macro calls still override GM token precedence. GM may still manually pick another caster, but a subsequent unbound launch follows selected/last selected token as requested.
- No change to casting rules, UI design, quick Rotes, Module ID, Actor/Item/Scene data, native WoD20 roll/chat flags, Dice Improvements/Paradox ownership, User permissions, or hotbar behavior.

## Tests and state

- v0.1.10: `node --check` and **11 Node/mock tests**, including `gm-token-priority.cjs`, passed; existing Chromium casting-layout regressions and ZIP metadata/integrity checks passed. **No live Foundry client test yet**.
- Delivery: complete, installable v0.1.10 ZIP; changelog, README, test report and this handoff included.
- GitHub: update via a reviewable PR; **do not merge/publish** until explicitly requested by user. The stable raw `main/module.json` and published ZIP remain v0.1.9 until the PR is merged and GitHub Actions publishes v0.1.10.
- Backup `Z:\Data\modules\wod20-player-actions` and the world before upgrading. Restart Foundry and refresh after installing. Roll back to the backed-up v0.1.9 folder/ZIP. No in-world migrations. Real resource expenditure from performed rolls survives code rollback.
- Handoff owner `05` needs status update; GLOBAL-02/03 do not change because no API/chat/Paradox contract was altered. GM TokenDocument selection storage is internal to this module.

## Next conversation first test

As GM, select a Mage NPC token, deselect, then launch Player Magick. The window should show that **token's** name and Arete. For an unlinked token, verify the token's Actor stats rather than the base Actor's. Open with a different selected token and confirm immediate precedence. Check native chat/Paradox behavior once with a test spell.
