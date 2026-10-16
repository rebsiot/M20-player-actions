// Optional world Script Macro - Player Basic Actions.
// The module creates this once in the Macro Directory for GM worlds.
// Players can drag it to their hotbar manually; nothing is auto-assigned.
const api = game.modules.get("wod20-player-actions")?.api;
if (!api?.openBasicActions) ui.notifications.warn("Enable WoD20 Player Actions first.");
else await api.openBasicActions();
