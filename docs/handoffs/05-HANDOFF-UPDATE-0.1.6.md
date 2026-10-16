# 05 – Player Magick handoff update v0.1.6

**Owner:** `wod20-player-actions` (`05` conversation series; this development was continued in the current project thread at the user's request). Existing module ID unchanged.

**Repository:** https://github.com/rebsiot/M20-player-actions

**Baseline:** Published v0.1.5 GitHub Release and its working source. User reports two live regressions in v0.1.5: manually chosen Mage not remembered; Dice Improvements Paradox die does not appear for Player Magick cast.

## Changes

1. `game.settings.register` adds a hidden Foundry v14 `user`-scope `preferredActorUuid`. The chooser saves it only after a valid manual choice. Resolver precedence: legacy explicit macro Actor binding, then owned preferred Actor, then owned `game.user.character`, then owned selected token. Permission loss/deleted Actor falls back safely.
2. Spell chat output includes the **localized WoD20 spell classification string** (`wod.spheres.coincidentalspell`, `.vulgarspell`, or `.vulgarspellwitness`) in native DiceRollContainer.extraInfo, alongside v0.1.5 Reality/Spheres notes. The separate `wod20-dice-improvements` v0.2.0 `createChatMessage` listener searches for these exact labels. This fixes the detection contract without modifying/depending on the separate module or running a new dice engine.
3. All other behavior from v0.1.5 preserved: wider Sphere UI, one optional launch macro, no hotbar auto-population, native roll origin `magic`, delayed Quintessence spend, existing legacy `api.execute` binding.

## Source of truth and testing

- Changes developed against v0.1.5 source already on GitHub and supplied in the previous release workspace. Includes `tests/paradox-chat-contract.cjs` and revised tests. Six Node tests, syntax and packaging pass; **live Foundry v14 / WoD20 / Dice Improvements not verified**.
- The Dice Improvements Paradox listener is owned by component 08, not Player Magick; `wod20-paradox` (component 09) must be disabled when Dice Improvements owns the lifecycle. **Do not add a separate Paradox processor** to this module.
- Confirm the user's actual installed Dice Improvements and old Paradox module states in live Foundry before assuming the chat marker fix is sufficient.

## Delivery / rollback

- Complete independent v0.1.6 module ZIP, matching versioned manifest download URL.
- Back up installed module directory and world before upgrading; roll back by restoring v0.1.5. No migrations.
- Cross-component documentation: component 08 Dice Improvements and GLOBAL-02/GLOBAL-04 should note the localized magic-chat label contract after a successful live test; update the 05 main handoff as well.