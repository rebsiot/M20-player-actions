# 05 – Player Magick handoff update v0.1.7

**Owner:** `wod20-player-actions` (05-series Player Magick, currently maintained in this development thread at the user's request). **Repository:** `https://github.com/rebsiot/M20-player-actions`.

## Source and request

Source of truth: Published v0.1.6 from GitHub and the complete installable v0.1.6 ZIP. The user provided a screenshot of a real successful native WoD20 Arete chat card that repeats `Arete • Magick` three times, spells out reality twice, and prints difficulty twice. Requested adjustment is purely chat-card readability while preserving Paradox recognition.

## v0.1.7 implementation

- `scripts/player-actions.js` uses native `DiceRollContainer` and `DiceRoller`, `roll.origin = 'magic'`, with **one** native roll for magick.
- Mage calls now set action to the existing roll title, `dicetext` to a single pool label like `3d10`, and `systemText` to an empty string. Native WoD20 already prints `action`, `dicetext`, `extraInfo`, `Difficulty`, and `systemText` in separate card regions. General/Power roll fields are not changed.
- Casting `extraInfo` retains the **localized Coincidental/Vulgar/Witnessed spell marker** for Dice Improvements (component 08), plus Spheres; removes `Reality: ...` and the duplicate difficulty breakdown. **Only** nonzero situational/Quintessence adjustments get a one-line modifier breakdown. Extended casting notes remain.
- Preserve per-user last-selected Actor, Actor permissions, native Willpower and Quintessence spending, optional launcher and no automatic hotbar assignment.
- There is no new chat template, no dice engine, no Paradox listener or Paradox state change in Player Magick. Do not silently modify Dice Improvements or the legacy Paradox module.

## Testing and handoff

- JS syntax, seven mock/contract Node tests, package integrity and version metadata run locally. **Live Foundry v14 verification of v0.1.7 remains pending.** The user's screenshot confirmed v0.1.6 did create a native chat roll with a valid result, not that the new layout works.
- Smoke test with Arete 3, Matter 2, Spirit 2, Coincidental: one title, `3d10`, Coincidental label, Spheres, one Difficulty 5 and successes; the Paradox listener should continue detecting dice when existing temporary Paradox >0.
- Release v0.1.7 must be merged into GitHub, and the versioned Release ZIP published and verified before claiming the manifest serves v0.1.7. The manifest remains at the stable `main/module.json` URL.
- Back up world and `Z:\Data\modules\wod20-player-actions`; rollback by restoring the last known working v0.1.6 folder/ZIP. No world migration runs.
- Owning handoff: `05-WOD20-PLAYER-ACTIONS.md` should reflect this next release. GLOBAL-02 dice/Paradox localized label contract remains unchanged; no shared contract update needed.