/* WoD20 Player Actions v0.1.11: Basic Actions and Player Magick, native WoD20 dice path. */
const MOD = "wod20-player-actions";
const SYSTEM_ID = "worldofdarkness";
const PREFERRED_ACTOR_SETTING = "preferredActorUuid";
const LAST_GM_TOKEN_SETTING = "lastGmTokenUuid";
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
// The GM's most recently controlled token is a TokenDocument UUID, not an Actor ID.
// This preserves the separate Actor instance of an unlinked NPC token.
let lastGmTokenUuid = "";
let gmTokenSave = Promise.resolve();

const escape = (value) => foundry.utils.escapeHTML(String(value ?? ""));
const int = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, int(value, lo)));
const isMage = (actor) => !!actor && (actor.type === "Mage" || (actor.type === "PC" && [actor.system?.settings?.splat, actor.system?.settings?.variantsheet].some(v => String(v ?? "").toLowerCase() === "mage")));
const canUse = (actor) => !!actor && (game.user.isGM || actor.isOwner);
const ownedItem = (item) => !!item?.parent && item.parent.documentName === "Actor";
const supported = (item) => ownedItem(item) && ["Rote", "Power"].includes(item.type);
const icon = (item) => item?.img && !item.img.includes("mystery-man") ? item.img : "icons/svg/dice-target.svg";
const actorAdv = (actor, key) => actor?.api?.getAdvantage?.(key) || actor?.items?.find(i => i.type === "Advantage" && String(i.system?.id || i.name).toLowerCase() === key);

function rememberGmToken(token) {
  if (!game.user.isGM) return;
  const uuid = token?.document?.uuid;
  if (!uuid || uuid === lastGmTokenUuid) return;
  lastGmTokenUuid = uuid;
  // Queue writes in control order. A rapid sequence of token selections should
  // never persist an earlier selection over a later one.
  gmTokenSave = gmTokenSave.catch(() => {}).then(() =>
    game.settings.set(MOD, LAST_GM_TOKEN_SETTING, uuid)
  ).catch(error => console.warn(`${MOD} | Could not remember GM token`, error));
}

function previouslySelectedGmTokenActor() {
  const uuid = lastGmTokenUuid || game.settings.get(MOD, LAST_GM_TOKEN_SETTING);
  if (!uuid) return null;
  let tokenDocument = null;
  try { tokenDocument = fromUuidSync(uuid); }
  catch (error) { console.warn(`${MOD} | Last GM token cannot be resolved`, error); }
  // Resolve the TokenDocument each time: don't retain deleted or stale Actors.
  if (tokenDocument?.documentName !== "Token") return null;
  return canUse(tokenDocument.actor) ? tokenDocument.actor : null;
}

function resolveActor(actorUuid = null) {
  // Existing actor-bound Rote macros keep their binding, even when the GM
  // selects a different token while the macro is available.
  if (actorUuid) return fromUuidSync(actorUuid);

  const controlled = canvas?.tokens?.controlled || [];
  if (game.user.isGM) {
    if (controlled.length > 1) {
      ui.notifications.warn("Select one token to cast as a GM.");
      return null;
    }
    if (controlled.length === 1) {
      const token = controlled[0];
      rememberGmToken(token);
      if (canUse(token.actor)) return token.actor;
    }
    const previous = previouslySelectedGmTokenActor();
    if (previous) return previous;
  }

  // For players, the manually selected Mage remains the default. A GM without
  // a usable selected/previous token can still fall back to this preference.
  const savedUuid = game.settings.get(MOD, PREFERRED_ACTOR_SETTING);
  if (savedUuid) {
    let saved = null;
    try { saved = fromUuidSync(savedUuid); }
    catch (error) { console.warn(`${MOD} | Saved character cannot be resolved`, error); }
    if (canUse(saved)) return saved;
  }
  const assigned = game.user.character;
  if (canUse(assigned)) return assigned;
  if (controlled.length > 1) {
    ui.notifications.warn("Select a single token for this action.");
    return null;
  }
  return canUse(controlled[0]?.actor) ? controlled[0].actor : null;
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
  // WoD20 renders action, dicetext and systemText as separate rows. For magick,
  // keep the action once, show the Arete pool once, and omit duplicate title rows.
  // Non-magick rolls retain their previous layout for compatibility.
  roll.systemText = kind === "magic" ? "" : title;
  roll.dicetext = kind === "magic" ? [`${pool}d10`] : [title];
  roll.extraInfo = extras;
  roll.usewillpower = willpower; // Native WoD20 spends Willpower using its own settings.
  await DiceRoller(roll);
}

function eligibleMageActors(current) {
  // Never expose unowned Actors or non-Mages in the casting character picker.
  // Keep synthetic current Actors usable even when not in the world directory.
  const actors = Array.from(game.actors?.contents ?? game.actors ?? []);
  if (current && !actors.some(a => a?.uuid === current.uuid)) actors.push(current);
  return actors.filter(a => a?.uuid && canUse(a) && isMage(a))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The compact caster/roll summary is shared by improvised and Rote casting. */
function castSummaryHTML(actor, rating, {allowChange = true} = {}) {
  const actorChoices = eligibleMageActors(actor).map(a =>
    `<option value="${escape(a.uuid)}"${a.uuid === actor.uuid ? " selected" : ""}>${escape(a.name)}</option>`
  ).join("");
  const caster = allowChange
    ? `<label class="wpa-caster"><span class="wpa-eyebrow">Casting as</span><select class="wpa-caster-select" aria-label="Casting character">${actorChoices}</select></label>`
    : `<div class="wpa-caster wpa-caster-static"><span class="wpa-eyebrow">Casting as</span><strong>${escape(actor.name)}</strong></div>`;
  return `<div class="wpa-cast-summary" aria-label="Casting character and live roll details">
    ${caster}
    <div class="wpa-roll-metrics">
      <div class="wpa-metric"><span>Arete</span><strong>${rating} <small>dice</small></strong></div>
      <div class="wpa-metric"><span>Highest Sphere</span><strong data-highest-sphere>&mdash;</strong></div>
      <div class="wpa-metric"><span>Quintessence</span><strong data-quint-spent>&mdash;</strong></div>
      <div class="wpa-metric"><span>Willpower</span><strong data-willpower-preview>&mdash;</strong></div>
      <div class="wpa-stat wpa-difficulty-stat"><span>Difficulty</span><strong data-current-difficulty aria-live="polite">&mdash;</strong></div>
    </div>
  </div>`;
}

/** Keep one set of mechanical controls for both quick Rote and improvised casts. */
function castDetailsHTML(availableQuint, {quick = false} = {}) {
  const description = `<label class="wpa-effect-field">${quick ? "Variation / focus description (optional)" : "Effect / focus description (optional)"}<input name="effect" maxlength="250" placeholder="A few words about the effect (optional)" value=""></label>`;
  return `<section class="wpa-cast-section" aria-label="Casting details">
    <div class="wpa-section-heading"><strong>Casting details</strong></div>
    <div class="wpa-cast-settings">
      <label class="wpa-reality-field">Reality classification <select name="reality">
        <option value="coincidental">Coincidental (+3 to highest Sphere)</option>
        <option value="vulgar">Vulgar, no witnesses (+4 to highest Sphere)</option>
        <option value="witnessed">Vulgar, witnessed (+5 to highest Sphere)</option></select></label>
      <div class="wpa-stepper-field">
        <span class="wpa-setting-label" data-quint-remaining>Quintessence (${availableQuint} remaining)</span>
        <div class="wpa-stepper" data-min="0" data-max="${Math.min(availableQuint, 3)}" role="group" aria-label="Quintessence to spend">
          <button type="button" data-step="-1" aria-label="Spend less Quintessence">&minus;</button>
          <output data-step-value aria-live="polite" aria-label="Quintessence spent">0</output>
          <button type="button" data-step="1" aria-label="Spend more Quintessence">+</button>
          <input type="hidden" name="quint" value="0">
        </div>
      </div>
      <div class="wpa-stepper-field">
        <span class="wpa-setting-label">GM modifier</span>
        <div class="wpa-stepper" data-min="-3" data-max="3" role="group" aria-label="GM difficulty modifier">
          <button type="button" data-step="-1" aria-label="Decrease GM modifier">&minus;</button>
          <output data-step-value aria-live="polite" aria-label="GM modifier">0</output>
          <button type="button" data-step="1" aria-label="Increase GM modifier">+</button>
          <input type="hidden" name="modifier" value="0">
        </div>
      </div>
    </div>
    <div class="wpa-check-options">
      <label title="Records focus use in chat; no automatic difficulty change"><input type="checkbox" name="useFocus"> Use Focus</label>
      <label><input type="checkbox" name="willpower"> Spend 1 Willpower</label>
      <label><input type="checkbox" name="ritual"> Extended casting / ritual</label>
    </div>
    <div class="wpa-preview" aria-live="polite" hidden></div>
    ${quick ? `<details class="wpa-cast-help wpa-optional-description"><summary>Optional effect description</summary>${description}</details>` : description}
    <details class="wpa-cast-help"><summary>Casting rules and Storyteller notes</summary>
      <p>Highest chosen Sphere determines base difficulty. Multiple Spheres may be combined; the Storyteller decides the effect requirements.</p>
      <p>M20 default: highest Sphere +3/+4/+5, then modifiers. Quintessence reduces difficulty one per point, subject to Storyteller ruling. The roll difficulty is capped at 10 here; harder effects can require additional successes.</p>
      <p>Use Focus records your choice in chat; it does not automatically alter difficulty. Use the GM modifier for an agreed adjustment. WoD20 handles Willpower expenditure. Extended casting is one attempt here; track additional rolls manually.</p>
    </details>
  </section>`;
}

/** Wire the shared steppers, permission-neutral previews and Sphere selection. */
function wireCastControls(popup, actor) {
  const form = popup.form || popup.element?.querySelector("form");
  const availableQuint = quintessence(actor).value;
  const update = () => {
    if (!form) return;
    for (const stepper of form.querySelectorAll(".wpa-stepper")) {
      const input = stepper.querySelector('input[type="hidden"]');
      if (!input) continue;
      const minimum = int(stepper.dataset.min);
      const maximum = int(stepper.dataset.max);
      const current = clamp(input.value, minimum, maximum);
      input.value = String(current);
      const display = stepper.querySelector("[data-step-value]");
      if (display) display.textContent = current > 0 && input.name === "modifier" ? `+${current}` : String(current);
      for (const button of stepper.querySelectorAll("button[data-step]")) {
        const next = current + int(button.dataset.step);
        button.disabled = next < minimum || next > maximum;
      }
    }
    const fd = new FormData(form);
    const max = Math.max(0, ...SPHERES.map(s => clamp(fd.get(`sphere.${s}`), 0, 5)));
    const reality = fd.get("reality");
    const base = max + (reality === "coincidental" ? 3 : reality === "vulgar" ? 4 : 5);
    const spend = clamp(fd.get("quint"), 0, 3);
    const adjustment = clamp(fd.get("modifier"), -3, 3) - spend;
    const difficulty = clamp(base + adjustment, 3, 10);
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
    const root = popup.element || form;
    const set = (selector, value) => { const target = root.querySelector(selector) || form.querySelector(selector); if (target) target.textContent = value; };
    set("[data-current-difficulty]", max ? String(difficulty) : "—");
    set("[data-highest-sphere]", max ? String(max) : "—");
    set("[data-quint-spent]", spend ? `−${spend}` : "—");
    const willpower = fd.has("willpower") ? (globalThis.CONFIG?.worldofdarkness?.willpowerBonusDice ? "+3 dice" : "+1 success") : "—";
    set("[data-willpower-preview]", willpower);
    set("[data-quint-remaining]", `Quintessence (${Math.max(0, availableQuint - spend)} remaining)`);
    const preview = form.querySelector(".wpa-preview");
    if (preview) {
      preview.hidden = !!max;
      preview.textContent = max ? "" : "Choose at least one Sphere to cast.";
    }
  };
  form?.addEventListener("click", event => {
    const rocker = event.target.closest?.(".wpa-stepper button[data-step]");
    if (rocker) {
      const stepper = rocker.closest(".wpa-stepper");
      const input = stepper?.querySelector('input[type="hidden"]');
      if (!input) return;
      input.value = String(clamp(int(input.value) + int(rocker.dataset.step), int(stepper.dataset.min), int(stepper.dataset.max)));
      update();
      return;
    }
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

/** Full Sphere editor, used for improvised magick and customized Rotes. */
async function guidedCast(actor, item = null) {
  if (!canUse(actor)) return ui.notifications.warn("Choose a character you own.");
  if (!isMage(actor)) return ui.notifications.warn("Guided magick requires a Mage character.");
  if (item && (item.parent?.id !== actor.id || item.type !== "Rote")) return ui.notifications.warn("This Rote does not belong to the character.");
  const rating = arete(actor);
  const spheres = sphereRatings(actor);
  const requirements = roteRequirements(item);
  const currentQuint = quintessence(actor);
  const title = item ? `Customize Rote: ${item.name}` : "Improvised Magick";
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
    ${castSummaryHTML(actor, rating)}
    <section class="wpa-cast-section" aria-label="Sphere selection">
      <div class="wpa-section-heading"><strong>Spheres</strong><span>Choose a level (0 = not used). Expand a card for a quick reference.</span></div>
      <div class="wpa-spheres">${fields}</div>
    </section>
    ${castDetailsHTML(currentQuint.value)}
  </div>`;
  const Dialog = foundry.applications.api.DialogV2;
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
  // Change Mages in place; a Rote belongs to its original Actor only.
  const casterSelect = popup.element?.querySelector?.(".wpa-caster-select");
  casterSelect?.addEventListener("change", async () => {
    if (casterSelect.value === actor.uuid) return;
    const selected = eligibleMageActors(actor).find(a => a.uuid === casterSelect.value);
    if (!selected) {
      ui.notifications.warn("You cannot cast as that character.");
      casterSelect.value = actor.uuid;
      return;
    }
    casterSelect.disabled = true;
    try {
      try { await rememberCharacter(selected); }
      catch (error) {
        console.error(`${MOD} | Could not save preferred character`, error);
        ui.notifications.warn("Character selected, but the preference could not be saved.");
      }
      await popup.close();
      await guidedCast(selected);
    } catch (error) {
      console.error(`${MOD} | Could not switch casting character`, error);
      ui.notifications.error("Could not switch casting character.");
      casterSelect.disabled = false;
      casterSelect.value = actor.uuid;
    }
  });
  wireCastControls(popup, actor);
}

/** A practiced Rote should remove Sphere-picking work, not alter Arete mechanics. */
async function quickCastRote(actor, item) {
  if (!canUse(actor) || !isMage(actor)) return ui.notifications.warn("Select an owned Mage character.");
  if (item?.parent?.id !== actor.id || item.type !== "Rote") return ui.notifications.warn("This Rote does not belong to the character.");
  const requirements = roteRequirements(item);
  const included = SPHERES.filter(s => requirements[s] > 0);
  const known = sphereRatings(actor);
  if (!included.length) {
    ui.notifications.warn("This Rote has no recognized Sphere requirements. Select its Spheres in the full editor.");
    return guidedCast(actor, item);
  }
  if (included.some(s => requirements[s] > 5 || requirements[s] > known[s])) {
    ui.notifications.warn("This Rote exceeds the character's known Sphere ratings. Review its requirements in the full editor.");
    return guidedCast(actor, item);
  }
  const rating = arete(actor);
  const availableQuint = quintessence(actor).value;
  const sphereInputs = SPHERES.map(s => `<input type="hidden" name="sphere.${s}" value="${requirements[s]}">`).join("");
  const sphereChips = included.map(s => `<span class="wpa-rote-chip">${escape(s)} <strong>${requirements[s]}</strong></span>`).join("");
  const content = `<div class="wpa-root wpa-cast wpa-rote-quick">
    ${castSummaryHTML(actor, rating, {allowChange:false})}
    <section class="wpa-rote-effect" aria-label="Known Rote">
      <div class="wpa-rote-label">Known Rote</div><strong class="wpa-rote-name">${escape(item.name)}</strong>
      <div class="wpa-rote-chips">${sphereChips}</div>
      <div class="wpa-rote-hint">Sphere requirements are preselected. Use Edit Spheres if you need to customize the effect.</div>
      ${sphereInputs}
    </section>
    ${castDetailsHTML(availableQuint, {quick:true})}
  </div>`;
  const Dialog = foundry.applications.api.DialogV2;
  const viewportWidth = Number(globalThis.innerWidth) || 1080;
  const dialogWidth = Math.min(780, Math.max(320, viewportWidth - 56));
  const popup = new Dialog({window:{title:`Cast Rote: ${item.name}`},position:{width:dialogWidth},content,
    buttons:[
      {action:"cancel",label:"Cancel"},
      {action:"advanced",label:"Edit Spheres / Advanced",callback:()=>({advanced:true})},
      {action:"roll",label:"Roll Arete",icon:"fas fa-dice-d10",default:true,
       callback:(_event,button)=>Object.fromEntries(new FormData(button.form).entries())}
    ],
    submit:async result=>{
      if (!result || result === "cancel") return;
      if (result.advanced) return guidedCast(actor,item);
      try { await performMageCast(actor,item,result); }
      catch (error) {console.error(`${MOD}: Rote cast failed`,error);ui.notifications.error(`Rote cast failed: ${error.message}`);}
    }
  });
  await popup.render({force:true});
  wireCastControls(popup,actor);
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
  // Keep the localized spell label so the separate Dice Improvements listener
  // recognizes Paradox dice. The WoD20 roller adds the final Difficulty itself.
  // Only nonzero modifiers need an additional explanation in the chat card.
  const adjustments = [
    ...(mod ? [`Situation ${mod > 0 ? "+" : ""}${mod}`] : []),
    ...(spend ? [`Quintessence -${spend}`] : [])
  ];
  const note = [
    realityLabel,
    `Spheres: ${chosen.map(([s, v]) => `${s} ${v}`).join(", ")}`,
    ...(data.useFocus ? ["Focus used"] : []),
    ...(adjustments.length ? [`Modifiers: ${adjustments.join(" · ")}`] : []),
    ...(data.ritual ? ["Extended casting: track accumulated successes manually"] : [])
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

// Basic Actions: one 5x5 dashboard; native WoD20 Attribute + Ability rolls.
// Icon filenames are a curated whitelist of Game-icons.net SVG files bundled in this module.
const BASIC_ACTIONS_SETTING = "basicActionsByActor";
const BASIC_ICONS = [
  "binoculars", "crystal-ball", "magnifying-glass", "face-to-face", "alarm-clock",
  "footsteps", "mountain-climbing", "running-shoe", "jump-across", "deer-track",
  "charm", "double-face-mask", "angry-eyes", "chat-bubble", "crown",
  "spell-book", "archive-research", "sherlock-holmes", "laptop", "first-aid-kit",
  "fist", "dodge", "eye-target", "spyglass", "light-bulb", "bandage-roll",
  "pencil", "gears", "brain", "healing", "crossroad", "keyboard",
  "book-pile", "compass", "dice-six-faces-one", "direction-sign"
];
const BASIC_ROWS = [
  {label:"Awareness", actions:[
    {id:"notice",label:"Notice",attr:"perception",ability:"Alertness",icon:"binoculars"},
    {id:"sense-magick",label:"Sense Magick",attr:"perception",ability:"Awareness",icon:"crystal-ball"},
    {id:"search",label:"Search",attr:"perception",ability:"Investigation",icon:"magnifying-glass"},
    {id:"read-someone",label:"Read Someone",attr:"perception",ability:"Empathy",icon:"face-to-face"},
    {id:"react",label:"React",attr:"wits",ability:"Alertness",icon:"alarm-clock"}
  ]},
  {label:"Movement", actions:[
    {id:"sneak",label:"Sneak",attr:"dexterity",ability:"Stealth",icon:"footsteps"},
    {id:"climb",label:"Climb",attr:"strength",ability:"Athletics",icon:"mountain-climbing"},
    {id:"run",label:"Run",attr:"stamina",ability:"Athletics",icon:"running-shoe"},
    {id:"jump",label:"Jump",attr:"strength",ability:"Athletics",icon:"jump-across"},
    {id:"track",label:"Track",attr:"perception",ability:"Survival",icon:"deer-track"}
  ]},
  {label:"Social", actions:[
    {id:"charm",label:"Charm",attr:"charisma",ability:"Expression",icon:"charm"},
    {id:"deceive",label:"Deceive",attr:"manipulation",ability:"Subterfuge",icon:"double-face-mask"},
    {id:"intimidate",label:"Intimidate",attr:"manipulation",ability:"Intimidation",icon:"angry-eyes"},
    {id:"negotiate",label:"Negotiate",attr:"manipulation",ability:"Etiquette",icon:"chat-bubble"},
    {id:"lead",label:"Lead",attr:"charisma",ability:"Leadership",icon:"crown"}
  ]},
  {label:"Knowledge", actions:[
    {id:"occult",label:"Occult",attr:"intelligence",ability:"Occult",icon:"spell-book"},
    {id:"research",label:"Research",attr:"intelligence",ability:"Academics",icon:"archive-research"},
    {id:"investigate",label:"Investigate",attr:"intelligence",ability:"Investigation",icon:"sherlock-holmes"},
    {id:"computer",label:"Computer",attr:"intelligence",ability:"Computer",icon:"laptop"},
    {id:"first-aid",label:"First Aid",attr:"intelligence",ability:"Medicine",icon:"first-aid-kit"}
  ]}
];
const BASIC_ATTRIBUTE_ORDER = ["strength", "dexterity", "stamina", "charisma", "manipulation", "appearance", "perception", "intelligence", "wits"];
const basicTitle = (str) => String(str ?? "").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]/g," ").replace(/\b\w/g, ch=>ch.toUpperCase());
const basicId = (str) => String(str ?? "").toLowerCase().replace(/[^a-z0-9]/g,"");
// Compact dashboard abbreviations only; full trait names remain in the accessible
// button label / hover text. Unknown/custom trait names use a readable prefix.
const BASIC_ATTRIBUTE_SHORT = {
  strength:"Str", dexterity:"Dex", stamina:"Sta", charisma:"Cha", manipulation:"Man",
  appearance:"App", perception:"Per", intelligence:"Int", wits:"Wits"
};
const BASIC_ABILITY_SHORT = {
  alertness:"Alert", awareness:"Aware", investigation:"Invest", empathy:"Emp",
  stealth:"Stlth", athletics:"Athl", survival:"Surv", expression:"Expr",
  subterfuge:"Subt", intimidation:"Intim", etiquette:"Etiq", leadership:"Lead",
  occult:"Occ", academics:"Acad", computer:"Comp", medicine:"Med"
};
const basicShortTrait = (label, lookup) => lookup[basicId(label)] || basicTitle(label).replace(/\s+/g,"").slice(0,6);
const basicIcon = (name) => `modules/${MOD}/icons/${BASIC_ICONS.includes(name) ? name : "dice-six-faces-one"}.svg`;
const basicItems = (actor) => Array.from(actor?.items ?? []);
function basicAttributes(actor) {
  return Object.entries(actor?.system?.attributes ?? {})
    .filter(([,v]) => v && typeof v === "object" && v.isvisible !== false && Number.isFinite(Number(v.total ?? v.value ?? v.permanent)))
    .sort(([a],[b]) => {
      const i = BASIC_ATTRIBUTE_ORDER.indexOf(a.toLowerCase());
      const j = BASIC_ATTRIBUTE_ORDER.indexOf(b.toLowerCase());
      return (i === -1 ? 99 : i) - (j === -1 ? 99 : j) || a.localeCompare(b);
    })
    .map(([key,trait])=>({id:key, label:basicTitle(key), value:Math.max(0,int(trait.total ?? trait.value ?? trait.permanent))}));
}
function basicAbilities(actor) {
  return basicItems(actor).filter(i => i?.type === "Ability" && i.id && i.system?.settings?.isvisible !== false)
    .sort((a,b)=>a.name.localeCompare(b.name));
}
function basicAbilityByName(actor, requested) {
  const key = basicId(requested);
  return basicAbilities(actor).find(item => [item.system?.id,item.system?.slug,item.name].some(v=>basicId(v) === key)) ?? null;
}
function basicActionTraits(actor, action) {
  const attr = basicAttributes(actor).find(a=>a.id === action.attr) ?? null;
  const ability = action.abilityId ? basicAbilities(actor).find(i=>i.id === action.abilityId) ?? null
    : action.ability ? basicAbilityByName(actor,action.ability) : null;
  const missing = !attr ? `Missing Attribute: ${basicTitle(action.attr)}` :
    (action.abilityId || action.ability) && !ability ? `Missing Ability: ${action.ability || action.abilityId}` : "";
  const rating = ability ? Math.max(0,int(ability.system?.value ?? ability.system?.permanent ?? ability.system?.rating)) : 0;
  return {attr, ability, rating, pool:(attr?.value ?? 0)+rating, missing};
}
function basicReadSlotMap() {
  try {
    const data = JSON.parse(game.settings.get(MOD, BASIC_ACTIONS_SETTING) || "{}");
    return data && !Array.isArray(data) && typeof data === "object" ? data : {};
  } catch(error) {
    console.warn(`${MOD} | Invalid saved Basic Actions configuration`,error);
    return {};
  }
}
function basicSlots(actor) {
  const saved = basicReadSlotMap()[actor.uuid];
  return Array.from({length:5},(_,i) => {
    const v = Array.isArray(saved) ? saved[i] : null;
    return v && typeof v === "object" && typeof v.attr === "string" && typeof v.label === "string" ? {
      label:v.label.slice(0,32),attr:v.attr.slice(0,50),abilityId:String(v.abilityId || "").slice(0,64),
      icon:BASIC_ICONS.includes(v.icon) ? v.icon : "dice-six-faces-one"
    } : null;
  });
}
async function basicSaveSlot(actor, index, action) {
  if (!canUse(actor) || index < 0 || index >= 5) throw new Error("Invalid custom action slot");
  const map = basicReadSlotMap();
  const slots = basicSlots(actor);
  slots[index] = action;
  if (slots.some(Boolean)) map[actor.uuid] = slots;
  else delete map[actor.uuid];
  await game.settings.set(MOD, BASIC_ACTIONS_SETTING, JSON.stringify(map));
}
function basicTileHTML(actor, action, dataAttr, custom=false) {
  const t = basicActionTraits(actor,action);
  const desc = `${basicTitle(action.attr)}${action.abilityId || action.ability ? ` + ${t.ability?.name || action.abilityId || action.ability}` : ""}`;
  const pool = t.missing ? "Not on sheet" : `${t.pool}d10`;
  const tooltip = `${action.label}: ${desc}${t.missing ? ` (${t.missing})` : ` = ${t.pool} dice`}`;
  const attrShort = basicShortTrait(t.attr?.label || action.attr, BASIC_ATTRIBUTE_SHORT);
  const abilityName = t.ability?.name || action.ability || action.abilityId;
  const pairShort = `${attrShort}${abilityName ? ` + ${basicShortTrait(abilityName,BASIC_ABILITY_SHORT)}` : ""}`;
  return `<button type="button" class="wpa-basic-tile${custom ? " is-custom" : ""}" ${dataAttr}
    aria-label="${escape(tooltip)}" title="${escape(tooltip)}"${t.missing ? " disabled" : ""}>
    <span class="wpa-basic-tile-main"><img src="${basicIcon(action.icon)}" alt="" loading="lazy"><strong>${escape(action.label)}</strong></span>
    <span class="wpa-basic-tile-meta"><span class="wpa-basic-pair">${escape(pairShort)}</span>
      <span class="wpa-basic-pool${t.missing ? " unavailable" : ""}">${escape(pool)}</span></span>
  </button>`;
}
function basicDashboardHTML(actor) {
  const slots = basicSlots(actor);
  const groups = BASIC_ROWS.map(row=>`<section class="wpa-basic-row" aria-label="${escape(row.label)}">
    <h3>${escape(row.label)}</h3><div class="wpa-basic-grid">${row.actions.map(action=>basicTileHTML(actor,action,`data-basic-preset="${action.id}"`)).join("")}</div>
    </section>`).join("");
  const custom = slots.map((action,i)=>`<div class="wpa-basic-custom-cell">
    ${action ? basicTileHTML(actor,action,`data-basic-custom="${i}"`,true) :
     `<button type="button" class="wpa-basic-tile is-empty" data-basic-config="${i}" aria-label="Configure custom action ${i+1}">
        <span class="wpa-basic-tile-main"><span class="wpa-basic-plus" aria-hidden="true">+</span><strong>Configure</strong></span>
        <span class="wpa-basic-tile-meta"><span class="wpa-basic-pool">Action ${i+1}</span></span>
      </button>`}
    ${action ? `<button type="button" class="wpa-basic-edit" data-basic-config="${i}" aria-label="Edit or clear ${escape(action.label)}" title="Edit / Clear"><i class="fas fa-pen" aria-hidden="true"></i></button>` : ""}
  </div>`).join("");
  const wp = basicItems(actor).find(i=>i.type === "Advantage" && basicId(i.system?.id || i.name) === "willpower");
  const left = wp?.system?.temporary;
  const disableWp = Number.isFinite(Number(left)) && left !== null && left !== undefined && Number(left) <= 0;
  const wpLabel = left == null ? "Spend 1 Willpower" : `Spend 1 Willpower (${int(left)} left)`;
  return `<div class="wpa-root wpa-basic" aria-label="Basic Actions dashboard">
    <div class="wpa-basic-heading"><div><span>Rolling as</span><strong>${escape(actor.name)}</strong></div>
      <button type="button" class="wpa-basic-change" title="Choose another character">Change Character</button>
    </div>
    ${groups}
    <section class="wpa-basic-row" aria-label="My Custom Actions"><h3>My Custom Actions <small>Click Configure to add; pencil to edit or clear</small></h3>
      <div class="wpa-basic-grid">${custom}</div></section>
    <div class="wpa-basic-footer">
      <div class="wpa-basic-difficulty"><span>Difficulty</span><button type="button" data-basic-step="-1" aria-label="Decrease difficulty">&minus;</button>
        <output data-basic-difficulty aria-live="polite">6</output>
        <button type="button" data-basic-step="1" aria-label="Increase difficulty">+</button></div>
      <label class="wpa-basic-willpower"><input type="checkbox" name="basicWillpower" ${disableWp ? "disabled" : ""}><span>${escape(wpLabel)}</span></label>
    </div><div class="wpa-basic-status" role="status" aria-live="polite">Click an action to roll it immediately using WoD20.</div>
  </div>`;
}
async function performBasicAction(actor, action, difficulty=6, willpower=false) {
  if (!canUse(actor)) throw new Error("You no longer control this character.");
  const {attr,ability,pool,missing} = basicActionTraits(actor,action);
  if (missing) throw new Error(missing + ". Configure the action or update the character sheet.");
  if (pool <= 0) throw new Error("This action has no dice to roll.");
  const target = clamp(difficulty, 2, 10);
  const options = {difficulty:target, bonus:0, useWillpower:!!willpower};
  // Roll via the native WoD20 Actor API when available so it owns Willpower and chat behavior.
  if (ability && typeof actor.api?.rollAbility === "function") {
    await actor.api.rollAbility(ability.id,attr.id,options);
  } else if (!ability && typeof actor.api?.rollAttribute === "function") {
    await actor.api.rollAttribute(attr.id,options);
  } else {
    // Native WoD20 DiceRoller also works for some NPC Actors without the PC roll API.
    await runDice(actor,{title:action.label,pool,difficulty:target,
      extras:[`Attribute: ${attr.label} ${attr.value}`,...(ability ? [`Ability: ${ability.name} ${Math.max(0,int(ability.system?.value ?? ability.system?.permanent ?? ability.system?.rating))}`] : [])],
      willpower:!!willpower,kind:"general"});
  }
}
async function basicConfigureSlot(actor,index,onSaved) {
  if (!canUse(actor) || index < 0 || index >= 5) return;
  const current = basicSlots(actor)[index];
  const attributes = basicAttributes(actor);
  const abilities = basicAbilities(actor);
  if (!attributes.length) return ui.notifications.warn("No Attribute values found on this character.");
  const selection = current?.attr && attributes.some(a=>a.id === current.attr) ? current.attr : attributes[0].id;
  const abilityId = current?.abilityId || "";
  const chosenIcon = current?.icon ?? "dice-six-faces-one";
  const choices = BASIC_ICONS.map(name=>`<label class="wpa-basic-icon-choice" title="${escape(basicTitle(name))}">
    <input type="radio" name="icon" value="${name}"${name === chosenIcon ? " checked" : ""}>
    <span><img src="${basicIcon(name)}" alt=""><small>${escape(basicTitle(name))}</small></span></label>`).join("");
  const form = `<div class="wpa-root wpa-basic wpa-basic-editor">
    <p>Configure action ${index+1} for <strong>${escape(actor.name)}</strong>.</p>
    <label>Button label<input type="text" name="label" maxlength="32" placeholder="e.g. Find Clues" value="${escape(current?.label || "")}"></label>
    <div class="wpa-basic-editor-traits"><label>Attribute<select name="attribute">
      ${attributes.map(a=>`<option value="${escape(a.id)}"${selection === a.id ? " selected" : ""}>${escape(a.label)} (${a.value})</option>`).join("")}
      </select></label><label>Ability<select name="abilityId"><option value="">Attribute only</option>
      ${abilities.map(a=>`<option value="${escape(a.id)}"${abilityId === a.id ? " selected" : ""}>${escape(a.name)} (${Math.max(0,int(a.system?.value ?? a.system?.permanent ?? a.system?.rating))})</option>`).join("")}
      </select></label></div>
    <fieldset class="wpa-basic-icon-picker"><legend>Button icon</legend><div class="wpa-basic-icon-grid">${choices}</div></fieldset>
  </div>`;
  const editor = new foundry.applications.api.DialogV2({
    window:{title:`Custom Action ${index+1}`},position:{width:640},content:form,
    buttons:[
      {action:"cancel",label:"Cancel"},
      ...(current ? [{action:"clear",label:"Clear Slot",callback:()=>({clear:true})}] : []),
      {action:"save",label:"Save Action",icon:"fas fa-save",default:true,
       callback:(_event,button)=>Object.fromEntries(new FormData(button.form).entries())}
    ],
    submit:async result=>{
      if (!result || result === "cancel") return;
      if (result.clear) {
        await basicSaveSlot(actor,index,null);
        await onSaved();
        return;
      }
      const attribute = attributes.find(a=>a.id === result.attribute);
      const ability = abilities.find(a=>a.id === result.abilityId);
      if (!attribute || (result.abilityId && !ability)) {
        ui.notifications.warn("That Attribute or Ability is no longer on this character."); return;
      }
      const label = String(result.label || "").trim().slice(0,32) ||
        (ability ? `${attribute.label} + ${ability.name}` : attribute.label).slice(0,32);
      const iconName = BASIC_ICONS.includes(result.icon) ? result.icon : "dice-six-faces-one";
      await basicSaveSlot(actor,index,{label,attr:attribute.id,abilityId:ability?.id || "",icon:iconName});
      await onSaved();
    }
  });
  await editor.render({force:true});
}
async function openBasicActions(actor=null) {
  actor ||= resolveActor();
  if (!actor && game.user.isGM && (canvas?.tokens?.controlled?.length ?? 0)>1) return;
  if (!canUse(actor)) actor = await chooseCharacter();
  if (!actor) return;
  const viewportWidth = Number(globalThis.innerWidth) || 1060;
  const popup = new foundry.applications.api.DialogV2({
    window:{title:`Basic Actions - ${actor.name}`},
    position:{width:Math.min(770,Math.max(320,viewportWidth-50))},
    content:basicDashboardHTML(actor),
    buttons:[{action:"close",label:"Close"}]
  });
  await popup.render({force:true});
  const root = popup.element?.querySelector?.(".wpa-basic") || popup.element;
  if (!root) return;
  let busy = false;
  root.addEventListener("click",async event=>{
    const target = event.target;
    const step = target.closest?.("[data-basic-step]");
    if (step) {
      const output = root.querySelector("[data-basic-difficulty]");
      const next = clamp(int(output?.textContent,6)+int(step.dataset.basicStep),2,10);
      if (output) output.textContent = String(next);
      for (const b of root.querySelectorAll("[data-basic-step]")) {
        b.disabled = next + int(b.dataset.basicStep) < 2 || next + int(b.dataset.basicStep) > 10;
      }
      return;
    }
    if (target.closest?.(".wpa-basic-change")) {
      const selected = await chooseCharacter(actor);
      if (selected && selected.uuid !== actor.uuid) { await popup.close(); await openBasicActions(selected); }
      return;
    }
    const edit = target.closest?.("[data-basic-config]");
    if (edit) {
      const index = int(edit.dataset.basicConfig,-1);
      await basicConfigureSlot(actor,index,async()=>{await popup.close();await openBasicActions(actor);});
      return;
    }
    const tile = target.closest?.("[data-basic-preset], [data-basic-custom]");
    if (!tile || tile.disabled || busy) return;
    const id = tile.dataset.basicPreset;
    const action = id ? BASIC_ROWS.flatMap(x=>x.actions).find(x=>x.id === id) : basicSlots(actor)[int(tile.dataset.basicCustom,-1)];
    if (!action) return;
    busy = true;
    const status = root.querySelector(".wpa-basic-status");
    if (status) status.textContent = `Rolling ${action.label}...`;
    const wpInput = root.querySelector('input[name="basicWillpower"]');
    const useWillpower = !!wpInput?.checked;
    try {
      await performBasicAction(actor,action,int(root.querySelector("[data-basic-difficulty]")?.textContent,6),useWillpower);
      if (status) status.textContent = `Rolled ${action.label}.`;
    } catch(error) {
      console.error(`${MOD} | Basic Action failed`,error);
      ui.notifications.error(`Basic Action failed: ${error.message}`);
      if (status) status.textContent = `${action.label} failed; no further action taken here.`;
    } finally {
      // Don't accidentally spend Willpower on a second click.
      if (wpInput) wpInput.checked = false;
      busy = false;
    }
  });
  // Initialize +/- button states for difficulty 6.
  root.querySelector('[data-basic-step="-1"]')?.removeAttribute("disabled");
}

async function execute(actorUuid = null, itemId = null, action = null) {
  let actor;
  try { actor = resolveActor(actorUuid); }
  catch { return ui.notifications.error("The character could not be found."); }
  if (!canUse(actor)) return ui.notifications.warn("Select a token or assign a character in User Configuration.");
  const item = itemId ? actor.items.get(itemId) : null;
  if (itemId && !item) return ui.notifications.warn("This action's Rote or Power was deleted or replaced. Recreate the shortcut.");
  if (item?.type === "Rote") return quickCastRote(actor, item);
  if (action === "cast" || (!item && isMage(actor))) return guidedCast(actor, item);
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
  // Do not open a different character's action panel after warning the GM
  // that multiple token selections make the active caster ambiguous.
  if (!actor && game.user.isGM && (canvas?.tokens?.controlled?.length ?? 0) > 1) return;
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
  game.settings.register(MOD, LAST_GM_TOKEN_SETTING, {
    name: "Last selected GM token",
    hint: "Remembers the last token controlled by this GM for casting when none is selected.",
    scope: "user",
    config: false,
    type: String,
    default: ""
  });
  game.settings.register(MOD, BASIC_ACTIONS_SETTING, {
    name:"Custom Basic Actions by character",
    hint:"Five per-character, per-player custom quick actions; no Actor data is changed.",
    scope:"user",config:false,type:String,default:"{}"
  });
  Hooks.on("controlToken", (token, controlled) => {
    if (controlled) rememberGmToken(token);
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

// A second optional world Macro launches the Basic Actions grid; neither Macro is assigned to anyone's hotbar.
const BASIC_LAUNCHER_NAME = "Player Basic Actions";
const BASIC_LAUNCHER_COMMAND = `const api = game.modules.get("wod20-player-actions")?.api;
if (!api?.openBasicActions) ui.notifications.warn("Enable WoD20 Player Actions first.");
else await api.openBasicActions();`;
async function ensureBasicLauncherMacro() {
  if (!game.user.isGM) return;
  if (game.macros?.find(m=>m.getFlag?.(MOD,"basicLauncher") === true || m.name === BASIC_LAUNCHER_NAME)) return;
  try {
    await Macro.create({name:BASIC_LAUNCHER_NAME,type:"script",
      img:basicIcon("dice-six-faces-one"),command:BASIC_LAUNCHER_COMMAND,
      ownership:{default:CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER},
      flags:{[MOD]:{basicLauncher:true}}});
  } catch(error) { console.warn(`${MOD} | Unable to create Basic Actions launcher`,error); }
}

Hooks.once("ready", () => {
  if (game.system.id !== SYSTEM_ID) return;
  // Retain execute() for old macros. Create only one optional launcher, never touch hotbars.
  game.modules.get(MOD).api = { execute, openPanel, guidedCast, openBasicActions };
  // The first Actors-directory render often precedes ready; backfill it immediately.
  ensureDirectoryButton();
  void ensureLauncherMacro();
  void ensureBasicLauncherMacro();
  console.log(`${MOD} | Ready. Actors tab: Player Magick; shortcut: Shift+J.`);
});
