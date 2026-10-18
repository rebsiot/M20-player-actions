# WoD20 Player Magick & Actions v0.1.21

The module now appears as **WoD20 Player Magick & Actions** in Foundry's Module Manager, making it easier to identify and check whether it is enabled.

## What's changed

- Renamed the **display title**. The internal module ID stays `wod20-player-actions`, preserving existing settings, enabled state, Actors, user macros, hotbar slots and integrations.
- Reorganized the GitHub README around Use Magick, Basic Actions, Quick Resources and optional combat. The previous detailed instructions remain in `docs/PLAYER-GUIDE.md`.
- **No gameplay changes:** all 49 macros, resource/damage adjustments, native dice, Combat Workflow and Paradox responsibilities behave as in v0.1.20.

## Upgrade and rollback

Back up your world and `Data/modules/wod20-player-actions`. Update via the [Foundry manifest](https://raw.githubusercontent.com/rebsiot/M20-player-actions/main/module.json) or the complete versioned ZIP, restart Foundry, and refresh browser clients. Existing installations retain their enabled state because the module ID did not change.

For rollback, restore v0.1.20 module files. No migration was added. Rolling back code alone does not reverse changes made to character resources during play.

**Verification:** The published build must pass 21 existing Node/mock regression suites and ZIP integrity checks. A real Foundry v14 installation, native ChatMessage, GM/player permissions and exactly-once Paradox behavior remain **unverified by this naming release**.
