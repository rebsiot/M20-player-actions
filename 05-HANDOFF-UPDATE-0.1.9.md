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