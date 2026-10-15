const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'player-actions.js'), 'utf8');
const hooks = {};
const dialogs = [];
const warnings = [];
let chooserTarget = null;
const assigned = { id: 'assigned1', uuid: 'Actor.assigned1', name:'Assigned Mage', type:'PC', isOwner:true, items:[], system:{settings:{splat:'mage'}} };
const tokenActor = { id:'token2', uuid:'Actor.token2', name:'Token Mage', type:'PC', isOwner:true, items:[], system:{settings:{splat:'mage'}} };
const unusedActor = { id:'unused', uuid:'Actor.unused', name:'Unowned', type:'PC', isOwner:false, items:[], system:{settings:{splat:'mage'}} };
const actors = [assigned, tokenActor, unusedActor];
class FakeDialog {
  constructor(options) {
    this.options = options;
    this.element = {querySelectorAll: () => [], addEventListener: (type, handler) => {this[`on${type}`] = handler;}};
    dialogs.push(this);
  }
  async render() {}
  async close() {this.closed = true;}
  static async input() {return chooserTarget ? {actorUuid: chooserTarget.uuid} : null;}
}
const mod = {api:null};
const bindings = {};
const preferences = new Map();
const registrations = [];
const settings = {
  register: (mod,key,details) => registrations.push({mod,key,details}),
  get: (mod,key) => preferences.get(`${mod}.${key}`) || '',
  set: async (mod,key,value) => { preferences.set(`${mod}.${key}`,value); return value; }
};
const context = {
  Hooks:{once:(key, fn)=>hooks[key]=fn,on:(key,fn)=>hooks[key]=fn},
  game:{system:{id:'worldofdarkness'},settings,modules:{get:()=>mod},actors,
    user:{isGM:false,character:assigned}, keybindings:{register:(_mod,_key,opts)=>{bindings.open=opts;}}},
  canvas:{tokens:{controlled:[{actor:tokenActor}]}},
  ui:{notifications:{warn:m=>warnings.push(m),error:m=>{throw Error(m)}}},
  fromUuidSync:uuid=>actors.find(a=>a.uuid===uuid),
  fromUuid:async uuid=>actors.find(a=>a.uuid===uuid),
  foundry:{utils:{escapeHTML:s=>String(s)},applications:{api:{DialogV2:FakeDialog}}},
  HTMLElement:class {}, document:{querySelector:()=>null},
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}}, console
};
const clickTarget = { closest(selector) { return selector === '.wpa-change-character' ? {} : null; } };
(async()=>{
  vm.runInNewContext(script + "\n;globalThis.__resolveActor=resolveActor;", context);
  hooks.init(); hooks.ready();
  assert.match(bindings.open.name,/Player Magick/);
  assert.equal(registrations[0].details.scope,'user','preferred Mage is stored for each Foundry user');
  await mod.api.openPanel();
  assert.equal(dialogs.length, 1);
  assert.match(dialogs[0].options.window.title,/Player Magick.*Assigned Mage/,'Assigned Mage wins over selected token');
  assert.match(dialogs[0].options.content,/Casting as/);
  assert.match(dialogs[0].options.content,/Change Character/);
  assert.equal(warnings.length, 0);
  // Change character works for this panel; unowned actors are not available.
  chooserTarget = tokenActor;
  await dialogs[0].onclick({target:clickTarget});
  assert.equal(dialogs[0].closed,true);
  assert.match(dialogs[1].options.window.title,/Token Mage/);
  assert.equal(settings.get('wod20-player-actions','preferredActorUuid'),tokenActor.uuid,'user preference persisted');
  assert.equal(dialogs.length, 2);
  // Reload/open again: last chosen character wins over the assigned Mage.
  await mod.api.openPanel();
  assert.match(dialogs[2].options.window.title,/Token Mage/);
  // Explicit actor UUID remains bound for established shortcuts.
  assert.equal(context.__resolveActor(tokenActor.uuid),tokenActor);
  assert.equal(context.__resolveActor(),tokenActor, 'remembered character takes precedence');
  // Previously saved but no longer owned: fall back to assigned character.
  tokenActor.isOwner=false;
  assert.equal(context.__resolveActor(),assigned);
  tokenActor.isOwner=true;
  // Without a remembered or assigned character, token selection still works.
  preferences.clear();
  context.game.user.character = null;
  assert.equal(context.__resolveActor(),tokenActor);
  console.log('PASS: user-scoped remembered character wins over assigned; permission fallback; explicit macro binding; token fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;});