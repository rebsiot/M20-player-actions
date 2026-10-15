const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'player-actions.js'), 'utf8');
const hooks = {};
const dialogs = [];
let macrosCreated = 0;
let hotbarAssigned = 0;
const actor = {id:'abcd1234',uuid:'Actor.abcd1234',name:'Sample Mage',documentName:'Actor',type:'PC',isOwner:true,
  system:{settings:{splat:'mage'}},items:[
    {id:'ar',name:'Arete',type:'Advantage',system:{id:'arete',permanent:3}},
    {id:'qu',name:'Quintessence',type:'Advantage',system:{id:'quintessence',temporary:0}},
    {id:'li',name:'Life',type:'Sphere',system:{id:'life',value:3}},
    {id:'rote',name:'Healing',type:'Rote',img:'icons/svg/dice-target.svg',system:{spheres:{life:3}}}
  ]};
actor.items.forEach(i=>i.parent=actor);
actor.items.get=id=>actor.items.find(i=>i.id===id);
class FakeDialog {
  constructor(options) {this.options=options; this.element={addEventListener:()=>{},querySelector:()=>null,querySelectorAll:()=>[]};dialogs.push(options);}
  async render() {}
}
const mod={api:null};
const ctx={
  Hooks:{once:(name,fn)=>hooks[name]=fn,on:(name,fn)=>hooks[name]=fn},
  game:{system:{id:'worldofdarkness'},modules:{get:()=>mod},actors:[actor],
    user:{isGM:false,character:actor,assignHotbarMacro:async()=>{hotbarAssigned++;}},
    keybindings:{register:(_module,key,options)=>hooks.keybinding=options}},
  Macro:{create:async()=>{macrosCreated++;}},
  canvas:{tokens:{controlled:[]}},
  ui:{notifications:{warn:()=>{},error:m=>{throw new Error(m);}}},
  foundry:{utils:{escapeHTML:s=>String(s)},applications:{api:{DialogV2:FakeDialog}}},
  fromUuidSync:id=>id===actor.uuid?actor:null,
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},
  HTMLElement:class {},document:{querySelector:()=>null},console,
};
(async()=>{
  vm.runInNewContext(script,ctx);
  hooks.init();
  hooks.ready();
  assert.match(hooks.keybinding.name,/Player Magick/);
  assert.equal(typeof mod.api.openPanel,'function');
  assert.equal(typeof mod.api.execute,'function','legacy pre-existing hotbar commands retain execution API');
  assert.equal(mod.api.createMacro,undefined,'no macro creation exposed');
  assert.equal(hooks.hotbarDrop,undefined,'no hotbar interception installed');
  assert.equal(hooks.renderActorSheet,undefined,'no automatic character-sheet pin buttons');
  await mod.api.openPanel();
  assert.match(dialogs[0].window.title,/Player Magick.*Sample Mage/);
  assert.match(dialogs[0].content,/Casting as/);
  assert.match(dialogs[0].content,/Improvised Magick/);
  assert.match(dialogs[0].content,/Known Rotes/);
  assert.doesNotMatch(dialogs[0].content,/hotbar|Macro|draggable|wpa-save|wpa-pin/i);
  await mod.api.execute(actor.uuid, 'rote');
  assert.equal(dialogs.length,2,'previously created Rote macro still opens casting dialog');
  assert.match(dialogs[1].window.title,/Cast Rote: Healing/);
  assert.equal(macrosCreated,0);
  assert.equal(hotbarAssigned,0);
  assert.doesNotMatch(script,/Paradox|wod20-paradox/,'module neither references nor invokes the Paradox module');
  console.log('PASS: Player Magick; no macro/hotbar side effects; assigned character; old Rote shortcuts preserved; Paradox independent.');
})().catch(e=>{console.error(e);process.exitCode=1});
