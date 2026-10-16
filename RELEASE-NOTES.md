# Player Actions v0.1.20

## Compact Quick Resources and correctly gated Chimerical damage

- **Smaller Quick Resources panel:** The live-saving window is now approximately 328px wide on desktop, remains responsive at 320px viewports, and uses tighter rows, shorter visible labels, smaller +/- controls and a simpler footer. Full descriptions remain in accessible labels and tooltips. **+ / - apply immediately**, and **Undo**, **Refresh** and **Change Character** continue to work without a Save button.
- **Chimerical damage is opt-in, not automatically inferred from stored fields:** For current WoD20 PC actors, show the Chimerical damage track only when the character sheet's `system.settings.usechimerical` option is enabled. Legacy Changeling sheets keep their supported enabled track. A Mage with an inactive/dormant Chimerical data object shows only ordinary **Bashing, Lethal, and Aggravated** damage. Disabling the Chimerical track does **not** delete or rewrite its stored damage.
- All existing resource controls, 49 optional macros, five tutorial choices, native WoD20 fields, per-player hotbar assignments, and the independent Combat Workflow/Paradox module responsibilities remain unchanged. No new migration, background resource processing, automatic hotbar changes, or chat handoff file was introduced.

## Install / upgrade and rollback

Back up the Foundry world and `Z:\Data\modules\wod20-player-actions`. Stop Foundry while replacing the previous module with the **complete v0.1.20 release ZIP**, restart Foundry, enable it in the intended world and hard-refresh browser clients. Existing world launcher macros and the reference compendium are retained unchanged; no new provisioning is needed for this specific update.

To roll back, restore your backed-up **v0.1.19** module folder. Code rollback alone does not undo character resource/damage adjustments made during play; a matching world snapshot is needed if you want to restore those values.

**Automated verification:** Node syntax and all 21 Node/mock suites pass. Five Chromium browser fixtures pass, including a Quick Resources popup check at 1440, 820, 430 and 320px and a simulated one-click native save/Undo. The installable ZIP passes version, CRC, path and content checks; historical chat handoffs are excluded. **Live Foundry v14 / installed WoD20 and cross-module verification: NOT PERFORMED.**

[Full version history](https://github.com/rebsiot/M20-player-actions/blob/main/CHANGELOG.md)
