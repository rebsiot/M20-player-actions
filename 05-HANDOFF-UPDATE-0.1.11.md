# 05 - Player Actions handoff update v0.1.11

**Owning module:** `wod20-player-actions` (unchanged)  
**Owning thread:** Player Actions / Player Magick continuation; per user's explicit ownership direction  
**Repository:** https://github.com/rebsiot/M20-player-actions  
**Source baseline:** Published v0.1.10, GitHub `main` merge `dd77d199072b525e24f7886db7ecdbdf8b74936a`; source ZIP verified against GitHub blob SHA `0231c1357cc64e11828592ac6a422d0e94ffffab` for `scripts/player-actions.js`.

## Approved user workflow

The user considers Player Magick nearly complete and asked to expand Player Actions with a Basic Actions macro: 20 frequently used action buttons in 4 rows x 5, and a fifth row of five optional per-character configurable buttons. Clicking an empty optional button configures its label, Attribute, Ability and icon; an existing button rolls directly and has a pencil to reconfigure or clear. Difficulty and Willpower are common controls. They supplied `game-icons.net.svg.zip` and expressly requested use of those actual icons.

## v0.1.11 implementation

- **20 presets:** Awareness row (Notice, Sense Magick, Search, Read Someone, React), Movement (Sneak, Climb, Run, Jump, Track), Social (Charm, Deceive, Intimidate, Negotiate, Lead), Knowledge (Occult, Research, Investigate, Computer, First Aid). Pairings are configurable game shortcuts, not a substitute for Storyteller adjudication. Five columns on desktop, fewer columns on narrow screens.
- **Five custom buttons per character/per player:** Set label, Attribute, optional Ability, curated Game Icons SVG; edit via pencil; clear by Clear Slot. Saved in hidden **user-scoped** Foundry setting `basicActionsByActor` as JSON object keyed by Actor UUID. Actor and Item data are not edited. An empty slot opens configuration rather than rolling.
- **Native rolling:** Use the WoD20 Actor API `rollAbility(abilityItemId, attributeSlug, {difficulty,bonus:0,useWillpower})` or native `rollAttribute` if Attribute-only, and fall back to the existing native WoD20 DiceRoller for Actors without the PC API. Missing Attribute/Ability explicitly disables the button; no unrequested substitution. No new dice or chat system.
- **Footer:** Difficulty rocker 2..10, default 6; native Willpower checkbox (resets after attempted roll), no duplicate accounting. Current Actor ratings produce per-button dice pool previews. GM token-first/previous-token behavior is inherited from `resolveActor()`.
- **Assets:** Curated 36 actual SVG files from the supplied ZIP, selected by exact filenames, packaged in `icons/`. The original license text is included verbatim as `icons/LICENSE.txt`; `ICONS-CREDITS.md` credits the five authors used. A curated icon picker is offered for the five custom buttons. Do not redistribute the entire original archive.
- **Launcher:** Add exactly one optional world Macro named `Player Basic Actions`, created idempotently by a GM, player-readable, **never automatically assigned to a hotbar**. Existing optional `Player Magick` launcher and Actors-tab Player Magick button / Shift+J remain intact. Expose `game.modules.get('wod20-player-actions').api.openBasicActions()` in addition to established API methods.
- **No migrations:** Existing `preferredActorUuid`, `lastGmTokenUuid`, Actor/Sphere/Rote/Paradox paths and permissions are unchanged. No edits to adjacent modules.

## Delivery and tests

- `module.json` version 0.1.11, same module ID and Foundry WoD20 requirements, existing stable GitHub manifest path; versioned ZIP uses the existing workflow's `wod20-player-magick-0.1.11.zip` asset name for compatibility.
- Node syntax, 12 Node/mock tests and 3 Chromium fixtures (Basic Actions, Improvised Magick, Rote Quick Cast) at 1440/820/430 px. All must pass before marking this patch prepared. Tests are not equivalent to live Foundry.
- Test the native WoD20 Ability API, player/GM token, selected Actor, three sample presets, one saved custom slot, Willpower, and a Rote in a test world. **Live Foundry v14 integration remains unverified**.
- Back up the world and `Z:\Data\modules\wod20-player-actions`; restart Foundry and hard refresh after installation. Rollback to the published v0.1.10 folder/ZIP. User scope settings remain on rollback but are ignored by the older version; roll side effects do not revert.
- Update the owning `05` handoff and status at next transition; no global contract change is required because basic rolls use the same native WoD20 services. Publish only after explicit approval and verify the GitHub Actions release ZIP after merge.
