/* WoD20 Player Magick v0.1.6: native WoD20 rolls, remembered character, and spell-label compatibility. */
const MOD = "wod20-player-actions";
const SYSTEM_ID = "worldofdarkness";
const PREFERRED_ACTOR_SETTING = "preferredActorUuid";
const SPHERES = ["Correspondence", "Entropy", "Forces", "Life", "Matter", "Mind", "Prime", "Spirit", "Time"];
// Original, concise M20 Sphere prompts. These are reminders, not rules adjudications.
// Each entry describes what the corresponding dot broadly makes possible.
const SPHERE_GUIDE = {
  Correspondence: [
    "Sense distance, direction, location and spatial connections.",
    "Perceive distant places and reach across small spatial gaps.",
    "Pierce space, teleport yourself or move things across distance.",
    "Open passages and change how spaces connect or isolate.",
    "Radically reshape size, separation and the geometry of space."
  ],
  Entropy: [
    "Sense probability, weaknesses, fate and signs of decay.",
    "Nudge simple chances and unlikely coincidences.",
    "Influence complex inanimate systems, malfunction and deterioration.",
    "Alter fortune, aging or decay in living patterns.",
    "Work upon deep destiny, beliefs and sweeping patterns of chance."
  ],
  Forces: [
    "Detect light, heat, sound, motion, electricity and other energies.",
    "Redirect, intensify or dampen relatively small forces.",
    "Transform one lesser force into another, such as heat into light.",
    "Direct larger forces, powerful motion and environmental energy.",
    "Transform vast energies and perform dramatic large-scale effects."
  ],
  Life: [
    "Sense living patterns, wounds, illness and health.",
    "Heal or alter yourself and change simple living things.",
    "Heal others, reshape your own body and transform simple life.",
    "Make major changes to complex living beings or forms.",
    "Create or profoundly remake complex living patterns."
  ],
  Matter: [
    "Sense material composition, structure and properties.",
    "Change simple substances and basic material properties.",
    "Reshape objects and rearrange their physical structure.",
    "Transmute complex materials and composite objects.",
    "Change fundamental material properties on a profound scale."
  ],
  Mind: [
    "Sense emotions and nearby mental activity; shield your thoughts.",
    "Read surface impressions and send simple thoughts or impulses.",
    "Link minds, create mental illusions and enter dreams.",
    "Direct conscious thoughts, perceptions and awareness.",
    "Reshape subconscious drives, memory and personality."
  ],
  Prime: [
    "Sense Quintessence, resonance and magickal patterns.",
    "Infuse, fuel or temporarily enchant existing patterns.",
    "Channel Quintessence and empower people or stored effects.",
    "Draw out or expel primal energy; make enduring enchantments.",
    "Alter deep Quintessence flows, including creating Nodes."
  ],
  Spirit: [
    "Sense spirits, the Gauntlet and the nearby Umbra.",
    "Touch or communicate with spirits across the Gauntlet.",
    "Cross into the Umbra and bring spirits through the barrier.",
    "Open wider passages and bind or command spirits.",
    "Reshape spiritual substance and profoundly alter spirits."
  ],
  Time: [
    "Sense precise time, its passage and temporal disturbances.",
    "Look into the past or possible futures.",
    "Speed, slow or briefly reverse the flow of time.",
    "Create time bubbles, anchors or delayed triggers.",
    "Travel through time and work on time at its deepest level."
  ]
};
const DOT_TIERS = ["Sense", "Influence", "Alter", "Command", "Mastery"];

let wodDice = null;

const escape = (value) => foundry.utils.escapeHTML(String(value ?? ""));
const int = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, int(value, lo)));
const isMage = (actor) => !!actor && (actor.type === "Mage" || (actor.type === "PC" && [actor.system?.settings?.splat, actor.system?.settings?.variantsheet].some(v => String(v ?? "").toLowerCase() === "mage")));
const canUse = (actor) => !!actor && (game.user.isGM || actor.isOwner);
const ownedItem = (item) => !!item?.parent && item.parent.documentName === "Actor";
const supported = (item) => ownedItem(item) && ["Rote", "Power"].includes(item.type);
const icon = (item) => item?.img && !item.img.includes("mystery-man") ? item.img : "icons/svg/dice-target.svg";
const actorAdv = (actor, key) => actor?.api?.getAdvantage?.(key) || actor?.items?.find(i => i.type === "Advantage" && String(i.system?.id || i.name).toLowerCase() === key);

function resolveActor(actorUuid = null) {
  // Existing macros with an explicit Actor UUID retain their original binding.
  if (actorUuid) return fromUuidSync(actorUuid);
  // A manually selected character is preferred until the player changes it again.
  // User-scope Foundry settings persist per player and world across devices.
  const savedUuid = game.settings.get(MOD, PREFERRED_ACTOR_SETTING);
  if (savedUuid) {
    let saved = null;
    try { saved = fromUuidSync(savedUuid); } catch (error) { console.warn(`${MOD} | Saved character cannot be resolved`, error); }
    if (canUse(saved)) return saved;
  }
  // First-time users default to their assigned character; token is a fallback.
  const assigned = game.user.character;
  if (canUse(assigned)) return assigned;
  const tokens = canvas?.tokens?.controlled || [];
  if (tokens.length > 1) { ui.notifications.warn("Select a single token for this action."); return null; }
  return canUse(tokens[0]?.actor) ? tokens[0].actor : null;
}
async function rememberCharacter(actor) {
  // Only an explicit manual selection changes the preference. Never save
  // ephemeral token selection or modify the user's Foundry assigned character.
  if (!canUse(actor) || !actor?.uuid) return;
  await game.settings.set(MOD, PREFERRED_ACTOR_SETTING, actor.uuid);
}
function arete(actor) {
  const adv = actorAdv(actor, "arete");
  return Math.max(0, int(adv?.system?.permanent ?? adv?.system?.value ?? actor.system?.advantages?.arete?.permanent ?? actor.system?.arete?.value ?? actor.system?.arete?.permanent ?? 0));
}
function quintessence(actor) {
  const adv = actorAdv(actor, "quintessence");
  const value = adv?.system?.temporary ?? actor.system?.advantages?.quintessence?.temporary ?? actor.system?.quintessence?.temporary;
  return {document: adv || null, value: Math.max(0, int(value, 0)), legacyPath: adv ? null : actor.system?.advantages?.quintessence?.temporary != null ? "system.advantages.quintessence.temporary" : actor.system?.quintessence?.temporary != null ? "system.quintessence.temporary" : null};
}
function sphereRatings(actor) {
  const ratings = Object.fromEntries(SPHERES.map(s => [s, 0]));
  for (const item of actor.items) {
    if (item.type !== "Sphere") continue;
    const sphere = SPHERES.find(s => s.toLowerCase() === String(item.system?.id || item.name).toLowerCase());
    if (sphere) ratings[sphere] = Math.max(ratings[sphere], int(item.system?.value ?? item.system?.level ?? item.system?.rating ?? item.system?.dots ?? item.system?.permanent ?? 0));
  }
  for (const s of SPHERES) {
    const key = s.toLowerCase();
    const raw = actor.system?.spheres?.[key];
    ratings[s] = Math.max(ratings[s], int(raw?.value ?? raw?.permanent ?? raw ?? 0));
  }
  return ratings;
}
function roteRequirements(item) {
  const ratings = Object.fromEntries(SPHERES.map(s => [s, 0]));
  if (!item) return ratings;
  const root = item.system || {};
  for (const [key, value] of Object.entries(root.spheres || {})) {
    const sphere = SPHERES.find(s => s.toLowerCase() === key.toLowerCase());
    if (sphere) ratings[sphere] = Math.max(ratings[sphere], int(value?.value ?? value?.level ?? value?.rating ?? value, 0));
  }
  for (const s of SPHERES) {
    const lower = s.toLowerCase();
    const val = root[lower] ?? root[`sphere${s}`];
    if (val != null) ratings[s] = Math.max(ratings[s], int(val?.value ?? val?.level ?? val, 0));
  }
  return ratings;
}
async function loadDice() {
  if (wodDice) return wodDice;
  wodDice = await import(`/systems/${SYSTEM_ID}/module/scripts/roll-dice.js`);
  if (!wodDice.DiceRollContainer || !wodDice.DiceRoller) throw new Error("WoD20 dice roller API unavailable");
  return wodDice;
}

async function runDice(actor, {title, pool, difficulty, extras = [], willpower = false, kind = "general"}) {
  const {DiceRoller, DiceRollContainer} = await loadDice();
  const roll = new DiceRollContainer(actor);
  roll.numDices = pool;
  roll.difficulty = difficulty;
  // WoD20 roll-template.hbs only renders known action types (including "magic" and "power").
  // Using "arete" left the roll card empty, even though Dice So Nice animated the dice.
  roll.origin = kind;
  roll.action = title;
  roll.systemText = title;
  roll.dicetext = [title];
  roll.extraInfo = extras;
  roll.usewillpower = willpower; // Native WoD20 spends Willpower using its own settings.
  await DiceRoller(roll);
}

async function guidedCast(actor, item = null) {
  if (!canUse(actor)) return ui.notifications.warn("Choose a character you own.");
  if (!isMage(actor)) return ui.notifications.warn("Guided magick requires a Mage character.");
  if (item && (item.parent?.id !== actor.id || item.type !== "Rote")) return ui.notifications.warn("This Rote does not belong to the character.");
  const rating = arete(actor);
  const spheres = sphereRatings(actor);
  const requirements = roteRequirements(item);
  const currentQuint = quintessence(actor);
  const title = item ? `Cast Rote: ${item.name}` : "Improvised Magick";
  const knownSpheres = SPHERES.filter(s => spheres[s] >= 1);
  const fields = knownSpheres.map(s => {
    const known = clamp(spheres[s], 1, 5);
    const selected = clamp(requirements[s], 0, 5);
    const descriptions = SPHERE_GUIDE[s].slice(0, known).map((description, index) => `
      <li class="wpa-capability" data-rank="${index + 1}"><span class="wpa-rank-dots">${"&#9679;".repeat(index + 1)}</span>
        <span><b>${escape(DOT_TIERS[index])}:</b> ${escape(description)}</span></li>`).join("");
    const requirementWarning = selected > known
      ? `<small class="wpa-warning">This Rote asks for ${selected} dots, but ${escape(actor.name)} knows ${known}. Select a valid level or consult the Storyteller.</small>`
      : "";
    const levelButtons = Array.from({length: known + 1}, (_, rank) => `
      <button type="button" class="wpa-sphere-level${rank === selected ? " is-selected" : ""}" data-level="${rank}" aria-pressed="${rank === selected}" aria-label="${escape(s)} ${rank} ${rank === 1 ? "dot" : "dots"}">${rank}</button>`).join("");
    return `<section class="wpa-sphere" data-sphere="${escape(s)}">
      <div class="wpa-sphere-head"><strong>${escape(s)}</strong><small>${known} known</small></div>
      <input type="hidden" name="sphere.${escape(s)}" value="${selected}" data-max="${known}">
      <div class="wpa-sphere-levels" role="group" aria-label="${escape(s)} dots to use">${levelButtons}</div>
      ${requirementWarning}
      <details class="wpa-sphere-guide"><summary>What each dot allows</summary><ol class="wpa-capabilities">${descriptions}</ol></details>
    </section>`;
  }).join("") || '<p class="wpa-warning">No known Spheres found. Add Sphere ratings to the character sheet before casting.</p>';
  const content = `<div class="wpa-root wpa-cast">
    <div class="wpa-cast-summary" aria-label="Current casting character and resources">
      <div class="wpa-caster"><div class="wpa-caster-heading"><span class="wpa-eyebrow">Casting as</span><button type="button" class="wpa-cast-change" title="Choose a different character">Change</button></div><strong>${escape(actor.name)}</strong></div>
      <div class="wpa-stat"><span>Arete</span><strong>${rating} <small>dice</small></strong></div>
      <div class="wpa-stat"><span>Quintessence</span><strong>${currentQuint.value} <small>available</small></strong></div>
    </div>
    <section class="wpa-cast-section" aria-label="Sphere selection">
      <div class="wpa-section-heading"><strong>Spheres</strong><span>Choose a level (0 = not used). Expand a card for a quick reference.</span></div>
      <div class="wpa-spheres">${fields}</div>
    </section>
    <section class="wpa-cast-section" aria-label="Casting details">
      <div class="wpa-section-heading"><strong>Casting details</strong><span>${item ? `Confirm the effect and how Sleepers perceive it.` : `Describe your effect and how Sleepers perceive it.`}</span></div>
      <div class="wpa-cast-settings">
        <label class="wpa-effect-field">Effect / focus description (optional)<input name="effect" maxlength="250" placeholder="A few words about the effect (optional)" value=""></label>
        <label class="wpa-reality-field">Reality classification <select name="reality">
          <option value="coincidental">Coincidental (+3)</option>
          <option value="vulgar">Vulgar, no witnesses (+4)</option>
          <option value="witnessed">Vulgar, witnessed (+5)</option></select></label>
        <label>Situation modifier (-3 to +3) <input type="number" name="modifier" min="-3" max="3" value="0"></label>
        <label>Quintessence to spend <input type="number" name="quint" min="0" max="${Math.min(currentQuint.value, 3)}" value="0"></label>
      </div>
      <div class="wpa-check-options">
        <label><input type="checkbox" name="willpower"> Spend 1 Willpower (handled by WoD20)</label>
        <label><input type="checkbox" name="ritual"> Extended casting / ritual (one attempt)</label>
      </div>
    </section>
    <div class="wpa-preview" aria-live="polite">Choose at least one Sphere to cast.</div>
    <details class="wpa-cast-help"><summary>Casting rules and Storyteller notes</summary>
      <p>Highest chosen Sphere determines base difficulty. Multiple Spheres may be combined; the Storyteller decides the effect requirements.</p>
      <p>M20 default: highest Sphere +3/+4/+5, then modifiers. Quintessence reduces difficulty one per point, subject to Storyteller ruling. The roll difficulty is capped at 10 here; harder effects can require additional successes.</p>
    </details>
  </div>`;
  const Dialog = foundry.applications.api.DialogV2;
  // Wide on desktop but never wider than the user's available viewport.
  const viewportWidth = Number(globalThis.innerWidth) || 1080;
  const dialogWidth = Math.min(1020, Math.max(320, viewportWidth - 56));
  const popup = new Dialog({window: {title}, position: {width: dialogWidth}, content,
    buttons: [
      {action: "cancel", label: "Cancel"},
      {action: "roll", label: "Roll Arete", icon: "fas fa-dice-d10", default: true,
       callback: (_event, button) => Object.fromEntries(new FormData(button.form).entries())}
    ],
    submit: async result => {
      if (!result || result === "cancel") return;
      try { await performMageCast(actor, item, result); }
      catch (error) { console.error(`${MOD}: cast failed`, error); ui.notifications.error(`Cast failed: ${error.message}`); }
    }
  });
  await popup.render({force:true});
  const form = popup.form || popup.element?.querySelector("form");
  // Character change is optional; the assigned character always remains the default.
  popup.element?.querySelector?.(".wpa-cast-change")?.addEventListener("click", async () => {
    const selected = await chooseCharacter(actor);
    if (!selected || selected.uuid === actor.uuid) return;
    await popup.close();
    // Do not carry a Rote from the previous character onto the new one.
    await openPanel(selected);
  });
  const update = () => {
    if (!form) return;
    const fd = new FormData(form);
    const max = Math.max(0, ...SPHERES.map(s => clamp(fd.get(`sphere.${s}`), 0, 5)));
    const reality = fd.get("reality");
    const base = max + (reality === "coincidental" ? 3 : reality === "vulgar" ? 4 : 5);
    const adjustment = clamp(fd.get("modifier"), -3, 3) - clamp(fd.get("quint"), 0, 3);
    const diff = clamp(base + adjustment, 3, 10);
    for (const card of form.querySelectorAll(".wpa-sphere")) {
      const chosen = clamp(fd.get(`sphere.${card.dataset.sphere}`), 0, 5);
      for (const button of card.querySelectorAll(".wpa-sphere-level")) {
        const active = chosen === int(button.dataset.level);
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", String(active));
      }
      for (const row of card.querySelectorAll(".wpa-capability")) {
        const level = int(row.dataset.rank);
        row.classList.toggle("wpa-in-scope", chosen > 0 && level <= chosen);
        row.classList.toggle("wpa-selected", chosen > 0 && level === chosen);
      }
    }
    const preview = form.querySelector(".wpa-preview");
    if (preview) preview.textContent = max
      ? `Highest Sphere ${max} • Base ${base} • Adjustment ${adjustment >= 0 ? "+" : ""}${adjustment} • Arete ${rating}d10 vs ${diff}`
      : "Choose at least one Sphere to cast.";
  };
  form?.addEventListener("click", event => {
    const button = event.target.closest?.(".wpa-sphere-level");
    if (!button) return;
    const input = button.closest(".wpa-sphere")?.querySelector('input[name^="sphere."]');
    if (!input) return;
    input.value = button.dataset.level;
    update();
  });
  form?.addEventListener("input", update);
  form?.addEventListener("change", update);
  update();
}
async function performMageCast(actor, item, data) {
  if (!canUse(actor)) throw new Error("You no longer control this character.");
  const rating = arete(actor);
  if (rating < 1) throw new Error("Character has no Arete dice.");
  const characterSpheres = sphereRatings(actor);
  const knowsSpheres = actor.items.some(i => i.type === "Sphere") || !!actor.system?.spheres;
  const chosen = SPHERES.map(s => [s, clamp(data[`sphere.${s}`], 0, 5)]).filter(([, n]) => n > 0);
  const max = Math.max(0, ...chosen.map(([, v]) => v));
  if (!max) throw new Error("Select at least one Sphere.");
  // WoD20 uses Item-based Spheres for PC; if rating cannot be resolved, do not silently assume it is zero.
  for (const [sphere, required] of chosen) {
    const known = characterSpheres[sphere];
    if (knowsSpheres && required > known) throw new Error(`${sphere} ${required} exceeds the known rating ${known}.`);
  }
  const reality = ["coincidental", "vulgar", "witnessed"].includes(data.reality) ? data.reality : "coincidental";
  const raw = max + (reality === "coincidental" ? 3 : reality === "vulgar" ? 4 : 5);
  const mod = clamp(data.modifier, -3, 3);
  const spend = clamp(data.quint, 0, 3);
  const quint = quintessence(actor);
  if (spend > quint.value) throw new Error("Not enough Quintessence remaining.");
  const difficulty = clamp(raw + mod - spend, 3, 10);
  const effect = String(data.effect ?? item?.name ?? "Magick").trim().slice(0, 250) || item?.name || "Magick";
  // Native WoD20 and its Paradox-die listeners recognize the localized spell
  // classification. Include the same label in the native chat card rather than
  // creating a second roll, changing ChatMessage flags, or updating Paradox.
  const realityKey = {
    coincidental: "wod.spheres.coincidentalspell",
    vulgar: "wod.spheres.vulgarspell",
    witnessed: "wod.spheres.vulgarspellwitness"
  }[reality];
  const realityLabel = game.i18n.localize(realityKey);
  const note = [
    realityLabel,
    `Reality: ${reality}`, `Spheres: ${chosen.map(([s, v]) => `${s} ${v}`).join(", ")}`,
    `Difficulty: ${difficulty} (base ${raw}, modifier ${mod}, Quintessence ${spend})`,
    ...(data.ritual ? ["Extended effect: one roll; track accumulated successes manually"] : [])
  ];
  // Do not spend on an interrupted or failed roll: pre-validate then invoke native roller.
  await loadDice();
  await runDice(actor, {title: `Arete • ${effect}`, pool: rating, difficulty, extras: note, willpower: !!data.willpower, kind: "magic"});
  if (spend) {
    if (quint.document && Number.isFinite(Number(quint.document.system?.temporary))) {
      await quint.document.update({"system.temporary": quint.value - spend});
    } else if (quint.legacyPath) {
      await actor.update({[quint.legacyPath]: quint.value - spend});
    } else {
      ui.notifications.warn("Roll completed, but Quintessence storage was not recognized; deduct manually.");
    }
  }
}

async function activatePower(actor, item) {
  if (!canUse(actor) || item?.parent?.id !== actor.id) return ui.notifications.warn("This power is not on your character.");
  if (typeof item.use === "function") return item.use();
  if (typeof item.roll === "function") return item.roll();
  // WoD20 Powers vary enormously; never invent a dice pool or deduct Blood automatically.
  const Dialog = foundry.applications.api.DialogV2;
  const data = await Dialog.input({window: {title: `${item.name} • Power`}, content:`<div class="wpa-root">
    <p>Choose a roll according to the power's description. Some powers need no roll.</p>
    <div class="wpa-two"><label>Dice pool <input type="number" name="pool" min="0" max="50" value="0"></label>
    <label>Difficulty <input type="number" name="difficulty" min="3" max="10" value="6"></label></div>
    <label><input type="checkbox" name="noRoll" checked> Announce activation only (no roll)</label>
    <p class="wpa-note">Blood, Willpower, duration, and any opposed roll remain under player control.</p></div>`, ok: {label: "Activate / Announce"}});
  if (!data) return;
  if (!canUse(actor)) return;
  const extra = [`Power: ${item.name}`];
  if (data.noRoll || int(data.pool) <= 0) {
    await ChatMessage.create({speaker: ChatMessage.getSpeaker({actor}), content: `<p><strong>${escape(actor.name)}</strong> activates <strong>${escape(item.name)}</strong>.</p><p>Any costs and effects are handled by the player.</p>`});
  } else {
    await runDice(actor, {title: `${item.name} • Power`, pool: clamp(data.pool, 1, 50), difficulty:clamp(data.difficulty,3,10), extras:extra, kind:"power"});
  }
}

async function execute(actorUuid = null, itemId = null, action = null) {
  let actor;
  try { actor = resolveActor(actorUuid); }
  catch { return ui.notifications.error("The character could not be found."); }
  if (!canUse(actor)) return ui.notifications.warn("Select a token or assign a character in User Configuration.");
  const item = itemId ? actor.items.get(itemId) : null;
  if (itemId && !item) return ui.notifications.warn("This action's Rote or Power was deleted or replaced. Recreate the shortcut.");
  if (action === "cast" || (!item && isMage(actor))) return guidedCast(actor, item);
  if (item?.type === "Rote") return guidedCast(actor, item);
  if (item?.type === "Power") return activatePower(actor, item);
  return openPanel(actor);
}

async function chooseCharacter(current = null) {
  const actors = [...game.actors].filter(a => canUse(a) && (a.type === "PC" || isMage(a) || a.items?.some(i => supported(i))));
  if (!actors.length) {
    ui.notifications.warn("No playable characters are available. Create or assign a character first.");
    return null;
  }
  actors.sort((a, b) => a.name.localeCompare(b.name));
  const options = actors.map(a => `<option value="${escape(a.uuid)}"${a.uuid === current?.uuid ? " selected" : ""}>${escape(a.name)}</option>`).join("");
  const data = await foundry.applications.api.DialogV2.input({
    window: {title: "Player Magick — Choose Character"},
    content: `<div class="wpa-root"><label>Character<select name="actorUuid" autofocus>${options}</select></label></div>`,
    ok: {label: "Open Actions"}
  });
  if (!data?.actorUuid) return null;
  const actor = await fromUuid(data.actorUuid);
  if (!canUse(actor)) return ui.notifications.warn("You do not control that character.");
  try { await rememberCharacter(actor); }
  catch (error) {
    console.error(`${MOD} | Could not save preferred character`, error);
    ui.notifications.warn("Character selected, but the preference could not be saved.");
  }
  return actor;
}

async function openPanel(actor = null) {
  actor ||= resolveActor();
  if (!canUse(actor)) actor = await chooseCharacter();
  if (!actor) return;
  const items = actor.items.filter(supported).sort((a,b) => a.name.localeCompare(b.name));
  const rotes = items.filter(i => i.type === "Rote");
  const powers = items.filter(i => i.type === "Power");
  const rows = list => list.map(i => `<div class="wpa-action" data-item-id="${escape(i.id)}"><img src="${escape(icon(i))}" alt=""><span>${escape(i.name)}</span><button type="button" class="wpa-run" data-item-id="${escape(i.id)}" title="${i.type === "Rote" ? "Cast this Rote" : "Use this Power"}">${i.type === "Rote" ? "Cast" : "Use"}</button></div>`).join("");
  const Dialog = foundry.applications.api.DialogV2;
  const panel = new Dialog({window:{title:`Player Magick • ${actor.name}`}, position:{width:620}, content:
    `<div class="wpa-root wpa-panel">
      <div class="wpa-panel-header"><div><small>Casting as</small><strong>${escape(actor.name)}</strong></div>
      <button type="button" class="wpa-change-character"><i class="fas fa-users"></i> Change Character</button></div>
      ${isMage(actor) ? `<button type="button" class="wpa-improvise"><i class="fas fa-wand-magic-sparkles"></i> Improvised Magick</button>` : '<p class="wpa-note">This character is not configured as a Mage. Choose a Mage for improvised casting.</p>'}
      ${rotes.length ? `<div class="wpa-list-heading">Known Rotes</div><div class="wpa-action-list">${rows(rotes)}</div>` : (isMage(actor) ? '<p class="wpa-note">No Rotes found on this character. You can still cast improvised magick.</p>' : '')}
      ${powers.length ? `<details class="wpa-powers"><summary>Other Powers (${powers.length})</summary><div class="wpa-action-list">${rows(powers)}</div></details>` : ""}
    </div>`, buttons:[{action:"close",label:"Close"}]});
  await panel.render({force:true});
  const root = panel.element;
  if (!root) return;
  root.addEventListener("click",async e=>{
    const run=e.target.closest(".wpa-run");
    if (run) { await execute(actor.uuid, run.dataset.itemId); return; }
    if (e.target.closest(".wpa-change-character")) {
      const selected = await chooseCharacter(actor);
      if (selected && selected.uuid !== actor.uuid) { await panel.close(); await openPanel(selected); }
      return;
    }
    if (e.target.closest(".wpa-improvise")) await guidedCast(actor);
  });
}

function elementOf(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.element instanceof HTMLElement) return html.element;
  return html?.[0] instanceof HTMLElement ? html[0] : null;
}

function attachDirectoryButton(html) {
  const root = elementOf(html);
  if (!root || root.querySelector(".wpa-directory-button")) return;
  // Foundry 14 renders the Actors tab before ready. Target its header part directly.
  const header = root.querySelector('.directory-header, [data-part="header"], .header-actions, .sidebar-header') ||
    (root.matches?.('#actors, [data-tab="actors"], .directory') ? root : null);
  if (!header) return;
  const wrap = document.createElement("div");
  wrap.className = "wpa-directory-controls";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "wpa-directory-button";
  button.title = "Open Player Magick (Shift+J)";
  button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Player Magick';
  button.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); void openPanel(); });
  wrap.append(button);
  if (header === root) root.prepend(wrap);
  else header.insertAdjacentElement("afterend", wrap);
}

function actorDirectory() {
  return ui.actors || ui.sidebar?.tabs?.actors || null;
}

function ensureDirectoryButton() {
  const actors = actorDirectory();
  if (actors?.element) attachDirectoryButton(actors.element);
  // Foundry may render a tab as a nested app; this also covers sidebar reattachment.
  const dom = document.querySelector('#actors, section[data-tab="actors"], [data-tab="actors"].directory');
  if (dom) attachDirectoryButton(dom);
}

Hooks.once("init", () => {
  if (game.system.id !== SYSTEM_ID) return;
  game.settings.register(MOD, PREFERRED_ACTOR_SETTING, {
    name: "Last selected Player Magick character",
    hint: "The last owned Actor manually selected in Player Magick.",
    scope: "user", // Foundry v14: per-user, per-world and persistent across devices
    config: false,
    type: String,
    default: ""
  });
  // Keybindings must be registered during init, not ready.
  game.keybindings.register(MOD,"openPanel", {
    name: "Open Player Magick",
    hint: "Open Mage casting and known Rotes",
    editable: [{key:"KeyJ", modifiers:["SHIFT"]}],
    onDown: () => {void openPanel(); return true;},
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  Hooks.on("renderActorDirectory", (app, html) => attachDirectoryButton(html || app?.element));
  Hooks.on("renderActorDirectoryV2", (app, html) => attachDirectoryButton(html || app?.element));
  Hooks.on("renderSidebar", () => ensureDirectoryButton());
});

// Publish one optional world Macro (not a hotbar assignment) for players to drag themselves.
// GM-only, idempotent, and leaves any existing macro with the same name intact.
const LAUNCHER_NAME = "Player Magick";
const LAUNCHER_COMMAND = `const api = game.modules.get("wod20-player-actions")?.api;
if (!api?.openPanel) ui.notifications.warn("Enable the WoD20 Player Magick module first.");
else await api.openPanel();`;
async function ensureLauncherMacro() {
  if (!game.user.isGM) return;
  const existing = game.macros?.find(m => m.getFlag?.(MOD, "launcher") === true || m.name === LAUNCHER_NAME);
  if (existing) return;
  try {
    await Macro.create({
      name: LAUNCHER_NAME,
      type: "script",
      img: "icons/svg/dice-target.svg",
      command: LAUNCHER_COMMAND,
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
      flags: { [MOD]: { launcher: true } }
    });
  } catch (error) {
    console.warn(`${MOD} | Unable to create optional launcher macro`, error);
  }
}

Hooks.once("ready", () => {
  if (game.system.id !== SYSTEM_ID) return;
  // Retain execute() for old macros. Create only one optional launcher, never touch hotbars.
  game.modules.get(MOD).api = { execute, openPanel, guidedCast };
  // The first Actors-directory render often precedes ready; backfill it immediately.
  ensureDirectoryButton();
  void ensureLauncherMacro();
  console.log(`${MOD} | Ready. Actors tab: Player Magick; shortcut: Shift+J.`);
});