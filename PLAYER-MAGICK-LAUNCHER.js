// Optional standalone Script Macro: opens the Player Magick panel.
// No hotbar assignment, Rote creation, or Paradox processing.
const api = game.modules.get("wod20-player-actions")?.api;
if (!api?.openPanel) ui.notifications.warn("Enable the WoD20 Player Magick module first.");
else await api.openPanel();
