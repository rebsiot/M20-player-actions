# 05 — Player Magick handoff update: v0.1.4

**Owning component:** `wod20-player-actions` (same module ID; user-facing rename to Player Magick)

**Working baseline supplied by user:** `wod20-player-actions-0.1.3.zip` (2026-10-12)

**Repository:** https://github.com/rebsiot/M20-player-actions (new repository; source introduced by this release PR)

## Decisions

- This is the player-facing **Mage casting interface**. The separate Paradox module is independently owned and is not modified, required, or called by this module.
- Pause new macro/hotbar development. No automatic hotbar population. Remove macro controls/drag handlers from Player Magick UI without deleting existing user macros; retain the legacy `api.execute(actorUuid,itemId,action)` entry point.
- Default to `game.user.character` when the actor is owned; selected token is a fallback. Keep **Change Character** secondary.
- Widen the casting form and make Sphere rank choices visual/readable; collapse explanations until needed, consolidate basic casting settings.

## v0.1.4 files and behavior

- `module.json` version/title updated; ID unchanged.
- `scripts/player-actions.js` retains WoD20 native `DiceRollContainer` and `DiceRoller` (`magic` and `power` origins), old cast difficulty calculations, and Quintessence spending after a successful roll. No Paradox state writes or calls.
- `styles/player-actions.css` adds a high-contrast, responsive 3-/2-/1-column casting interface and clear Sphere buttons.
- Sidebar is labeled **Player Magick**, Shift+J preserved. Native Foundry character assignment is the first choice. Known Rotes are directly usable; Other Powers remain collapsed for compatibility.
- All Macro, pin and hotbar drop hooks are gone. Preexisting saved macros keep working with `api.execute`.

## Testing status

- **Automated/mock tested:** see `TEST-REPORT.md`; no auto-hotbar writes and no Paradox references were found.
- **Live Foundry:** not performed in this development environment. Must test with Foundry v14 and WoD20 system version actually installed before marking confirmed.

## Next test / follow-up

1. Enable v0.1.4 in a test world and open Player Magick with an assigned Mage.
2. Check character precedence, widen dialog, Sphere button selection, and native chat card via a real roll.
3. If verified, update `GLOBAL-04-DECISIONS-ROADMAP-RISKS.md` live status and the main `05-WOD20-PLAYER-ACTIONS.md` handoff. Keep 15-series starter hotbar work separate and paused.
