# 05 — Player Magick handoff update v0.1.9

**Owning conversation:** this Player Magick development chat (the user designated it as owner despite older 15.x numbering). **Module ID:** `wod20-player-actions`, unchanged. **Repository:** https://github.com/rebsiot/M20-player-actions.

## Source / intent

Based on the last published **v0.1.8** module ZIP and current GitHub `main` tree (merge SHA `45bbae9ef4c16c39f53f7ce85b3ecdb3f7e52b13`). User screenshot of the v0.1.8 one-line casting header requested three targeted improvements: move Change next to character or replace it with a dropdown; make the Coincidental +3 label explain the highest-Sphere rule; display current Difficulty at top.

## Decisions and changes

- Implement the user's **dropdown alternative** inside the casting header: `Casting as [Mage name ▾]`, Arete, live Difficulty, and Quintessence on one flexible strip. No extra "Change" button in that header. The main Player Magick roster panel's existing character selector remains unchanged.
- Dropdown lists only controlled Mages (GM may select any); names/UUIDs are escaped; current Actor is included even if synthetic. Changing the dropdown verifies ownership, saves `preferredActorUuid` in existing **user-scope Foundry setting**, closes the casting dialog and directly reopens **fresh Improvised Magick** as the selected Mage. Never attach a previous Mage's Rote to another actor.
- Top Difficulty initially shows a dash until any Sphere is selected; then reflects `clamp(max selected Sphere + reality base + GM modifier - Quintessence, 3, 10)` using the existing calculation. `update()` remains the single shared live preview path; lower preview keeps only Arete dice pool and highest Sphere to avoid duplicate difficulty. No server schema, dice/Paradox accounting, or spell-chat contract changes.
- Labels are `Coincidental (+3 to highest Sphere)`, `Vulgar, no witnesses (+4 to highest Sphere)`, `Vulgar, witnessed (+5 to highest Sphere)`; calculations remain identical.
- Preserve module ID, launcher macro (no automatic hotbar assignment), Rotes, existing per-user memory, native WoD20 `magic` chat and localized Paradox detection labels, abilities/powers and existing controls.

## Verification / delivery

- Nine Node/mock tests passed, including the new character-picker regression. Chromium viewport tests passed at 1440, 820 and 430, checking the real production DOM/CSS/handlers, dropdown and remembered choice, GM rocker, Quintessence, changing classification, and live top Difficulty. No horizontal overflow.
- Full installable ZIP versioned v0.1.9, internal `module.json` version/download checked and CRC verified. This does **not** prove deployment or live Foundry compatibility.
- Back up `Z:\Data\modules\wod20-player-actions` and the world before upgrade; restart/refresh after install. Roll back by restoring the v0.1.8 module folder. No automatic migrations. Any rolls already spent resources remain game changes.
- Submit v0.1.9 to GitHub as a PR based on `main`. Stable Foundry manifest must remain v0.1.8 until explicitly merged/published. On publication, verify release ZIP exists before reporting success.
- Update owning 05 handoff. GLOBAL architecture documents need no API changes; separate Dice Improvements Paradox contract is unchanged and remains live-unverified.


## Additional same-release refinement (after user feedback)

The v0.1.9 PR is unmerged, so this refinement remains **v0.1.9** rather than a new published version. User clarified that the summary must make **Difficulty** immediately readable; Arete/Highest Sphere/Quintessence/Willpower are supporting context and should not compete for emphasis.

- Replace the cramped header with one responsive caster+metrics strip and a large high-contrast Difficulty at the right. Move total Quintessence available out of the header; the rocker now labels the **remaining** Quintessence after current planned spend. Reflect native +1 success vs +3 dice Willpower configuration only when checked. Remove redundant lower roll summary. No change to casting math, server validation, storage or roll payload.
- Known Rotes with recognized and permissible Sphere requirements now go through `quickCastRote` (named Rote + fixed Sphere tags + same situational options + Roll Arete). `Edit Spheres / Advanced` opens the unchanged full guided editor with the same Rote. No recognizable requirements, or requirements exceeding the Mage's known levels, revert to the full editor with a warning. The previously existing `guidedCast(actor,item)` entry point remains the full advanced editor; existing Rote macros route to quick casting through the stable `execute` API.
- Tests: ten Node/mock tests including `rote-quick-cast.cjs`, plus both Chromium fixtures (`browser-ui.py`, `browser-rote-quick.py`) at 1440/820/430. Do **not** claim live Foundry validation. ZIP and source are ready for the existing PR #5 review.
- Cross-component boundary: native WoD20 roll and Dice Improvements/Paradox localized chat marker remain unchanged. No updates to Dice Improvements, Paradox module, world Actor IDs, macros or hotbars.
