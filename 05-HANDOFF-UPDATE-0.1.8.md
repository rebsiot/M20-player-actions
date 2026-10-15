# 05 -- Player Magick handoff update v0.1.8

**Owning thread:** Player Magick development in this conversation (the user expressly designated the thread despite prior 15/05 conversation naming). **Module ID:** `wod20-player-actions` (unchanged). **Repo:** `https://github.com/rebsiot/M20-player-actions`.

## Source of truth

Based on the released v0.1.7 complete module and verified matching GitHub `main` branch (merge SHA `3c0cf6408cba6b2786ad0296638c5bd38f422318`). The user provided screenshots of the long casting details form and three-card character header, and explicitly approved the compact layout redesign. No unrelated modules are modified.

## v0.1.8 behavior

- Change only Player Magick dialog presentation and optional Focus annotation, preserving all existing Sphere selection and Rote workflows.
- Casting header uses one inline strip: Casting as [Actor], Arete, Quintessence available, Change; narrow screens may wrap without overflow.
- Casting settings first row: Reality classification, Quintessence spent +/- rocker (0..min(3, available)), GM modifier +/- rocker (-3..+3). Hidden named inputs keep FormData/performMageCast contract unchanged; delegated clicks update the existing difficulty preview immediately; control limits are enforced client-side **and** in performMageCast.
- Below: Use Focus, Spend 1 Willpower, Extended casting / ritual checkboxes, then a compact roll/difficulty preview, then optional Effect/focus description, then a collapsed Casting rules and Storyteller notes expander. Sphere-rank help remains separately collapsed.
- Use Focus is a **descriptive** chat note only, not an automatic difficulty, dice or resource modifier. This was deliberate because no GM house-rule benefit was specified. Other computation and spending behavior is unchanged.
- Per-user remembered character, optional launcher macro, existing hotbar, native WoD20 `magic` roll/chat and localized Coincidental/Vulgar Paradox marker are preserved. No direct Paradox processing or new dice engine.

## Tests and release guidance

- Eight Node mock tests passed; actual Chrome/Chromium browser fixture at widths 1440, 820, 430 verified rocker bounds/form values/Focus/live preview, responsive layout and no horizontal overflow; JS syntax and packaged ZIP CRC/path checks passed.
- Live Foundry v14 is **not tested**. Do not interpret a packaging or browser fixture success as installation verification.
- Full installable module ZIP `wod20-player-magick-0.1.8.zip` is supplied separately. After PR merge, the repository's GitHub Actions workflow should publish a versioned GitHub ZIP and the stable raw `main/module.json` manifest will report 0.1.8; verify actual published asset before claiming success.
- Back up `Z:\Data\modules\wod20-player-actions` and the world before upgrade. Restart Foundry after replacing files. Roll back by restoring the v0.1.7 directory/ZIP; casts may already have spent resources, which a code rollback will not undo.
- Update owner 05 handoff with this version/status. No shared JSON/chat/Paradox contract change requiring GLOBAL-02 updates; global live verification state remains pending.
