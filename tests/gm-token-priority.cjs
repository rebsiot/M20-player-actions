/**
 * v0.1.10: GM selected-token / previous-token preference.
 * These are simulated Foundry APIs; live Foundry testing is still required.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../scripts/player-actions.js'), 'utf8');

const mage = (id, name, owner = true) => ({
  id, uuid: `Actor.${id}`, name, type: 'PC', documentName: 'Actor',
  system: { settings: { splat: 'mage' } }, isOwner: owner,
  items: [
    {id:`ar${id}`,name:'Arete',type:'Advantage',system:{id:'arete',permanent:3}},
    {id:`q${id}`,name:'Quintessence',type:'Advantage',system:{id:'quintessence',temporary:1}},
    {id:`sp${id}`,name:'Life',type:'Sphere',system:{id:'life',value:3}}
  ]
});
const assigned = mage('assigned','Assigned Mage');
const manuallyPicked = mage('chosen','Chosen Mage');
const npcWorld = mage('base','World NPC Base');
const npcSynthetic = mage('synthetic','Unlinked NPC Token');
const npcSecond = mage('second','Second Token Mage');
// A real unlinked TokenDocument resolves to the synthetic Actor, NOT the base Actor.
const firstDoc = { uuid:'Scene.sceneA.Token.token1', documentName:'Token', actor:npcSynthetic };
const secondDoc = { uuid:'Scene.sceneA.Token.token2', documentName:'Token', actor:npcSecond };
const firstToken = { document:firstDoc, actor:npcSynthetic };
const secondToken = { document:secondDoc, actor:npcSecond };
const docs = new Map([assigned,manuallyPicked,npcWorld].map(a=>[a.uuid,a]));
docs.set(firstDoc.uuid,firstDoc);
docs.set(secondDoc.uuid,secondDoc);
const userSettings = new Map([['wod20-player-actions.preferredActorUuid',manuallyPicked.uuid]]);
const dialogs = [];
const registered = [];
const warnings = [];
const createdMacros=[];
let hotbarAssignments = 0;
const controls = {controlled:[firstToken]};
function makeContext(isGM, prefs = userSettings) {
  const hooks = {}, mod = {};
  const ctx = {
    Hooks: { once:(key,cb)=>hooks[key]=cb, on:(key,cb)=>hooks[key]=cb },
    game:{system:{id:'worldofdarkness'}, user:{isGM,character:assigned,assignHotbarMacro:()=>{hotbarAssignments++;}},
      settings:{register:(m,k,details)=>registered.push({m,k,details}),
        get:(m,k)=>prefs.get(`${m}.${k}`) || '',
        set:async(m,k,value)=>{prefs.set(`${m}.${k}`,value);return value;}},
      modules:{get:()=>mod}, macros:{find:()=>null}, actors:{contents:[assigned,manuallyPicked,npcWorld]},
      keybindings:{register:()=>{}}},
    Macro:{create:async data=>{createdMacros.push(data);return data;}},
    fromUuidSync:uuid=>docs.get(uuid) || null,
    canvas:{tokens:controls},
    ui:{notifications:{warn:t=>warnings.push(t),error:err=>{throw Error(err);}}},
    foundry:{utils:{escapeHTML:s=>String(s)},applications:{api:{DialogV2:class {
      constructor(options) {this.options=options;this.element={addEventListener:(t,cb)=>{this[`on${t}`]=cb;},querySelector:()=>null};this.form=null; dialogs.push(this);}
      async render(){} async close(){this.closed=true;}
      static async input(){return null;}
    }}}},
    HTMLElement:class{},document:{querySelector:()=>null},
    CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1},DOCUMENT_OWNERSHIP_LEVELS:{OBSERVER:2}},console
  };
  vm.runInNewContext(script+'\n;globalThis.__resolve=resolveActor;globalThis.__previous=previouslySelectedGmTokenActor;',ctx);
  hooks.init();hooks.ready();
  return {ctx,hooks,mod};
}
(async()=>{
  const {ctx,hooks,mod}=makeContext(true);
  assert.equal(registered.find(x=>x.k==='lastGmTokenUuid').details.scope,'user','last GM token is private per-user');
  assert.equal(ctx.__resolve(),npcSynthetic,'selected unlinked NPC token takes priority over assigned and preferred Actors');
  assert.notEqual(ctx.__resolve(),npcWorld,'synthetic token Actor is not replaced with its world base');
  // Real-world hook records the last controlled TokenDocument when it is selected.
  hooks.controlToken(firstToken,true);
  await new Promise(setImmediate);
  assert.equal(userSettings.get('wod20-player-actions.lastGmTokenUuid'),firstDoc.uuid,'selected TokenDocument is persisted');
  controls.controlled=[];
  assert.equal(ctx.__resolve(),npcSynthetic,'last token remains caster after deselection');
  await mod.api.openPanel();
  assert.match(dialogs.at(-1).options.window.title,/Unlinked NPC Token/);
  // Clicking Improvised Magick from Player Magick opens the same token's casting dialog.
  const panel=dialogs.at(-1);
  await panel.onclick({target:{closest:selector=>selector==='.wpa-improvise'?{}:null}});
  assert.equal(dialogs.at(-1).options.window.title,'Improvised Magick');
  assert.match(dialogs.at(-1).options.content,/Unlinked NPC Token/);
  assert.equal(ctx.__resolve(assigned.uuid),assigned,'actor-bound Rote macro keeps explicit identity');
  // Control a new token, then clear it: last selection must become the new token.
  controls.controlled=[secondToken];
  hooks.controlToken(secondToken,true);
  await new Promise(setImmediate);
  assert.equal(ctx.__resolve(),npcSecond);
  hooks.controlToken(secondToken,false);
  controls.controlled=[];
  assert.equal(ctx.__resolve(),npcSecond);
  assert.equal(userSettings.get('wod20-player-actions.lastGmTokenUuid'),secondDoc.uuid);
  // Reload/new browser VM: persisted token UUID can be resolved again.
  const reloaded=makeContext(true);
  assert.equal(reloaded.ctx.__resolve(),npcSecond,'stored last GM token restored after a new session');
  // Deleted or unavailable last token must not be cast from a stale object.
  docs.delete(secondDoc.uuid);
  assert.equal(reloaded.ctx.__resolve(),manuallyPicked,'deleted token falls back to user preferred Mage');
  docs.set(secondDoc.uuid,secondDoc);
  // Multi-token selection cannot guess an actor or fall back into the roster dialog.
  controls.controlled=[firstToken,secondToken];
  const count=dialogs.length;
  assert.equal(reloaded.ctx.__resolve(),null);
  await reloaded.mod.api.openPanel();
  assert.equal(dialogs.length,count,'ambiguous GM token selection does not open another Actor');
  assert.ok(warnings.some(s=>/Select one token/.test(s)));
  controls.controlled=[];
  // Player preference remains higher priority than selected tokens, and players
  // do not implicitly modify GM's last-token setting.
  const previousStored=userSettings.get('wod20-player-actions.lastGmTokenUuid');
  const player=makeContext(false);
  controls.controlled=[firstToken];
  player.hooks.controlToken(firstToken,true);
  assert.equal(player.ctx.__resolve(),manuallyPicked);
  assert.equal(userSettings.get('wod20-player-actions.lastGmTokenUuid'),previousStored);
  assert.equal(hotbarAssignments,0,'never automatically populate anyone\'s hotbar');
  assert.ok(createdMacros.length>=1,'GM optional launcher remains available');
  console.log('PASS: GM current/previous selected tokens, synthetic Actor identity, last-token persistence, stale fallback, macro binding, player isolation and no auto hotbar.');
})().catch(error=>{console.error(error);process.exitCode=1;});
