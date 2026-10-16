# 05 - Player Actions handoff update v0.1.14

**Owner:** 05 Player Actions conversation, repository `rebsiot/M20-player-actions`, module ID `wod20-player-actions`.
**Source baseline:** Published v0.1.13, GitHub main merge `ed45d8cc351541258880cf5f52581ae870b7d29a`.
**Cross-module consumer contract:** Combat Workflow v0.1.4, repository `rebsiot/combat-workflow`, module ID `stl-combat-workflow`; owner conversation 16.1. Source code inspected directly at main commit `f8ec11cfed8cba89f53d6d47c62801b338ceff2a` (user reports latest v0.1.4 committed).

## Implemented behavior

1. New **Standard Attack (Targeted)** Macro compendium entry (`catalogId: standard-attack`) requires exactly one targeted defending token. Player Actions picks the attacker using its current per-player selection or GM selected/previous TokenDocument Actor. Then it delegates **without its own attack roll** to `game.modules.get("stl-combat-workflow").api.open({attackerActor: actor})`. Combat Workflow 0.1.4 checks ownership and an online GM, prompts for weapon/unarmed, and owns Attack -> Defense -> Damage -> Soak -> Apply/Undo. Warn and do not fallback if the independent module is disabled/missing. No changes to module 16 were made.
2. The old `attack` catalog ID becomes **Raw Attack (Choose Type)**, with Brawl/Melee/Firearms entries explicitly marked Raw; these remain the same immediate native WoD20 checks, independent of target and Combat Workflow. No automatic damage/soak.
3. The shipped **Player Magick** sidebar, launcher and compendium label is now **Use Magick**. Shift+J, `openPanel`, old actor-bound Rote and `execute` APIs remain supported. On upgrade, only catalog macros with exactly matching unchanged shipped names/commands/icons are renamed; any GM-customized content remains intact. The world pack ledger is unchanged and prevents restoring deleted macros. Player hotbars remain entirely untouched.
4. The Basic Actions window maximum width increases from ~770px to ~885px (about 15%) to accommodate slightly larger, more contrasty labels and trait abbreviations. Presets and colors remain the same.
5. Improvised Magick **Effect / Focus description** is now an optional details expander, closed by default, like the Rote quick cast. All Arete, Reality, Quintessence, Willpower and Paradox behavior is retained.

## Preserve

- The `wod20-player-actions` module ID, native WoD20 v14 roller and chat messages, Rote requirements, Paradox listener contract, Foundry source Actor/Token UUIDs and permissions.
- `world.wod20-player-actions-macros` world Macro pack and per-user `basicActionsByActor` slot storage; 162 licensed Game Icons and attributions; no automatic hotbar assignments or Actor data migrations.
- Combat Workflow is independently versioned and owns target resolution, native weapon stats and health changes; Player Actions only launches its public API. **Do not edit Combat Workflow in 05-series threads.**

## Verification status

- `node --check`, 15 Node/mock suites (including `standard-attack-workflow.cjs` and catalog migration), and three Chromium fixtures at widths 1440/820/430: **automated PASS**.
- Full versioned ZIP built with CRC/safe path/icon/manifest validation; not deployed or live verified.
- Source API compatibility inspected in `stl-combat-workflow` 0.1.4 `scripts/combat-workflow.js` and README, **not** tested against the user's running Foundry module files.
- Live GM/player test still required: target one defender, run Standard Attack with GM online, verify defense, damage, soak and Apply/Undo; untargeted Standard Attack must warn, Raw Attack works without target, Use Magick label and collapsed optional Effect/Focus appear.

## Upgrade, rollback and documentation

Back up world and `Z:\Data\modules\wod20-player-actions`, stop Foundry to replace the module folder, restart, enable modules and hard-refresh. Restore v0.1.13 to revert Player Actions; the new `standard-attack` world Macro document and renamed original macros persist until GM changes them or the matching world backup is restored. Neither module rollback undoes health/resource changes from completed gameplay. Update owner-05 handoff with release status and optionally record the API consumer in `GLOBAL-02`; module-16 handoff remains independently owned.
