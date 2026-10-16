# Player Actions v0.1.18

**Pick Lock works with the Abilities on your actual character sheet.**

## What's fixed

- Mage M20: **Pick Lock** now uses **Dexterity + Crafts** on a standard sheet (the system's internal Ability ID is `craft`).
- Vampire V20: **Pick Lock** uses **Dexterity + Larceny**. Characters with the optional Security Skill can also use Security.
- The dashboard uses an existing character Ability Item and displays the selected pairing and dice pool. It does not create or grant Security, Larceny, or any other Ability.
- Electronic security and unusual methods remain subject to the Storyteller; use Roll Any Check for Technology/Computer or other appropriate pairings.

## What's unchanged

All **48 optional macros**, first-login tutorial and opt-in hotbar checkboxes, native WoD20 rolling, existing characters, Rotes, and Combat Workflow / Paradox integration are preserved. No user or world data migration is performed.

## Developer documentation cleanup

Historical chat handoffs are archived under `docs/handoffs/` in the source repository and are **not included in the installable Foundry ZIP**. No new per-release handoff is generated.

## Upgrade, rollback and testing

Back up the Foundry world and `Z:\Data\modules\wod20-player-actions`. Stop Foundry before manually replacing the module folder through Samba, then restart and refresh clients. Roll back to the backed-up **v0.1.17** module if needed; no schema migration is involved.

**Verification:** automated Node/mock and packaging tests were run; a live Foundry v14 / WoD20 test of the new Pick Lock check is still required. See [TEST-REPORT.md](TEST-REPORT.md).

[Full history](https://github.com/rebsiot/M20-player-actions/blob/main/CHANGELOG.md) | [Setup guide](https://github.com/rebsiot/M20-player-actions/blob/main/README.md)
