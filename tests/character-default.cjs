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
const context = {
  Hooks:{once:(key, fn)=>hooks[key]=fn,on:(key,fn)=>hooks[key]=fn},
  game:{system:{id:'worldofdarkness'},modules:{get:()=>mod},actors,
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
  assert.equal(dialogs.length, 2);
  // Opening again defaults back to the assigned character.
  await mod.api.openPanel();
  assert.match(dialogs[2].options.window.title,/Assigned Mage/);
  // Explicit actor UUID remains bound for established shortcuts.
  assert.equal(context.__resolveActor(tokenActor.uuid),tokenActor);
  assert.equal(context.__resolveActor(),assigned);
  // Without a user-assigned character, token selection still works as fallback.
  context.game.user.character = null;
  assert.equal(context.__resolveActor(),tokenActor);
  console.log('PASS: Player Magick label; default assigned character; Change Character; explicit shortcut binding; token fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;});
