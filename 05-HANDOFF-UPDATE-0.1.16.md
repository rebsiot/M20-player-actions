# 05 - Player Actions handoff update v0.1.16

**Owner:** 05-series Player Actions, `rebsiot/M20-player-actions`; module ID `wod20-player-actions`.  
**Baseline:** v0.1.15 merged docs (runtime identical to v0.1.14), later published on 2026-10-16.  
**Status:** Installable v0.1.16 candidate with tutorial; NOT merged, deployed or live verified.

## New behavior

1. **Willpower / Resistance:** A dialog and a hotbar shortcut read permanent Willpower / existing Virtue and Attribute ratings, with adjustable difficulty. Native general dice roll; it does not spend Willpower or perform damage / soak.
2. **Basic Countermagick:** A Mage-only, Arete-based defensive dice check, default difficulty 7 and optional known Sphere label. Calls WoD20 native `general`, not `magic`, to avoid misclassifying a defensive check as casting. Storyteller adjudicates required Sphere knowledge, observation and net successes. No automatic Paradox or Quintessence expenditure.
3. **Modern Scenes:** Fifth preset group of five actions with Drive, Security/Larceny, Stealth, Streetwise, Technology/Crafts/Repair as real Actor Ability Items. Missing traits are disabled. Existing rows and 5 per-player custom slots are untouched.
4. **Favorite Rotes:** Star/unstar existing Rote Items in the Use Magick panel and view a favorite section. Favorites persist as `favoriteRotesByActor`, a per-user setting keyed by Actor UUID and Rote Item IDs. One draggable Favorite Rotes macro resolves the current Actor at execution time; no Actor/world Item edits.
5. **First-login Quick Tutorial:** Four short steps describe starting rolls, Basic Actions/Willpower, Magick/Favorite Rotes, combat and optional hotbar macros. It opens for every world User whose private `tutorialDontShowAgain` setting is false, without needing a character. The last page has **Don't show again**, which sets the user-scoped preference true; closing the tutorial without this choice lets it reopen next login. Manual **Quick Tutorial** links in Basic Actions and Use Magick reopen it even for opted-out players without resetting their preference. The tutorial does not change Actor, scene, resource, or hotbar data.

Macro catalog expands from 40 to **48** entries: 5 modern presets plus 3 utilities. GM only adds newly identified entries, never reassigns hotbars or replaces edited/deleted prior masters. No Actor or world-data migrations.

## Cross-module contracts

- Preserve native WoD20 `magic` / `power` casting messages and existing magick labels/Paradox integration unchanged.
- Defensive countermagick uses `general` and needs a live Paradox integration test, since the current separate Paradox source was not available.
- Targeted Standard Attack still delegates to independent `stl-combat-workflow` API and requires separate real two-client test.
- 162 icon files, private custom slot storage, GM unlinked-token actor identity and protected world Macro compendium preserved.

## Release test plan

- Run Node syntax and all Node/mock tests, including new resistance, countermagick, modern-scenes, favorites and tutorial lifecycle/opt-out coverage. Check the tutorial in Chromium at 1440/820/430px.
- Run release packaging integrity/manifest/notes checks; distinguish automated from live tests.
- After backing up world and module, GM logins to backed-up test world to seed the **eight new** macro masters; confirm existing hotbar and edited/deleted macros remain unchanged.
- Player: roll Willpower and an Attribute; verify no resources change. Mage: roll countermagick, see a real native chat card and confirm Paradox listener does NOT fire. Roll one actual cast and confirm Paradox triggers once. Test five modern actions with present and absent Abilities. Star a Rote, open Favorite Rotes macro, relog and confirm persistence. Test Basic Actions and Use Magick on narrow and desktop windows.
- Fresh user: check first-login tutorial appears, navigate all four screens, close early and confirm it is offered next login. Choose **Don't show again**, relog and confirm it stays hidden. Reopen Help from both panels; test another player account to confirm independent preferences.
- GM with one targeted defender: run Standard Attack through all Combat Workflow stages with online GM and player client. Raw Attack must still work without a target.

## Installation and rollback

Back up `Z:\Data\modules\wod20-player-actions` plus the world. Stop Foundry, install the complete ZIP to the module folder, restart, enable the intended world and hard refresh. Roll back to the backed-up working module and matching world backup if world Macro document changes need reversal. Note that returning code does not undo in-world spell, wounds, resources or compendium additions.

## Handoff coordination

Owner-05 handoff should be updated after live verification. `GLOBAL-02` native-roll/Paradox boundary and `GLOBAL-03` release/test status may need update when tests pass; do not make source edits in module 08/09 or Combat Workflow from this thread.

**GitHub status:** v0.1.15 is already published. The v0.1.16 package is still a local candidate, and the previous direct source upload to GitHub was blocked. Do not claim this tutorial or v0.1.16 is merged or published until confirmed.
