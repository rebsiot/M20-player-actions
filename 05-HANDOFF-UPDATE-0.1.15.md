# 05 — Player Actions handoff update v0.1.15

**Owner:** 05-series Player Actions, repository `rebsiot/M20-player-actions`, module ID `wod20-player-actions`.  
**Baseline:** Published Player Actions v0.1.14, main merge `0cc47671d081f6fcd2cd7a17d0377db4f0fe63b7`.  
**Nature of update:** Documentation and release automation only. No runtime behavior, source actor selection, dice/chat calculations, flags, permissions, world data or UI code changed.

## Request and outcome

The user found release notes confusing. The v0.1.14 GitHub Release body used generic text copied from v0.1.13 (including an incorrect **39 macros**, while v0.1.14 provides **40**). `CHANGELOG.md` also included prerelease labels, out-of-order v0.1.5, and developer test/implementation details intermixed with user-facing changes. `README.md` called an already-published build a test build.

For v0.1.15:

1. Rewrote **`CHANGELOG.md`** as brief, correctly ordered, player-facing version history from v0.1.0 through v0.1.15. Historical specifics remain under `docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md`.
2. Added **`RELEASE-NOTES.md`** as the short, version-specific body for GitHub releases. It states plainly that v0.1.15 is documentation-only and explains the current 40 macros, Magick, Basic Actions and target-dependent Combat Workflow.
3. Replaced the overgrown **README** with a concise setup and player guide; preserved the original technical README under `docs/README-TECHNICAL-THROUGH-v0.1.14.md`.
4. Changed `.github/workflows/publish-release.yml` from stale hard-coded `--notes` copy to **`--notes-file RELEASE-NOTES.md`**. `tools/package_release.py` includes the notes and archives in the installable ZIP and checks that the notes' top heading exactly matches the manifest version.
5. Added a new documentation regression test. The module version/download is **0.1.15**; existing version-specific release ZIP naming is preserved to avoid changing Foundry's install/update contract.

## Retained contracts

- Player Actions runtime JS/CSS is byte-for-byte unchanged from the published v0.1.14 ZIP.
- 40 world compendium macros, current GM/Actor-token priority, saved per-player custom actions, Magick, Rotes, localized spell markers, no automatic hotbar changes and no Actor migrations are unaffected.
- Standard Attack remains a thin integration with independent `stl-combat-workflow` v0.1.4+: one target, current attacker Actor, Combat Workflow owns the attack-to-soak/health sequence. Combat Workflow module source is untouched.
- Existing developer handoffs (including v0.1.14), test report history and Icon credits preserved.

## Testing and release status

Run `node --check scripts/player-actions.js`, all `tests/*.cjs`, and `python3 tools/package_release.py` on the new source. Verify all release notes are included in the installable ZIP, archive CRC, and manifest v0.1.15/download match. This is a documentation-only change; prior Chromium/basic workflow fixture results are not new live verification. **Live Foundry v14 + WoD20 + Combat Workflow end-to-end test remains outstanding.**

The GitHub connector in this environment can merge PRs and publish a new version via GitHub Actions, but does not expose editing the historical v0.1.14 release body. Accordingly the old v0.1.14 GitHub release page remains as published. The corrected descriptions appear in the new changelog and the v0.1.15+ release notes after merge/publication.

## Upgrade and rollback

Back up `Z:\Data\modules\wod20-player-actions` and world data before any update. Install the complete ZIP, restart Foundry and hard-refresh clients. v0.1.15 does not perform any migration. To return to the earlier code package, restore v0.1.14; because the executable module is unchanged, gameplay behavior is the same. World data and effects from past gameplay remain independent of a module rollback.

## Coordination

Update the **05 Player Actions** owning handoff/status at publication. Consider adding a readable, version-specific release-note check to `GLOBAL-03-RELEASE-DEPLOYMENT-TESTING.md` for other project modules; no cross-module API or shared data format changes were made.
