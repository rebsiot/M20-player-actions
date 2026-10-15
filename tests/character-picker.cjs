/**
 * Player Magick v0.1.9 casting dropdown policy and markup checks.
 * Real Foundry interaction tests are in browser-ui.py.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../scripts/player-actions.js'),'utf8');
const hooks = {}, dialogs = [], mod = {};
const mage = (id,name,isOwner=true) => ({id,uuid:`Actor.${id}`,name,type:'PC',isOwner,
  system:{settings:{splat:'mage'}},items:[
  {type:'Advantage',id:'ar',name:'Arete',system:{id:'arete',permanent:3}},
  {type:'Advantage',id:'q',name:'Quintessence',system:{id:'quintessence',temporary:2}},
  {type:'Sphere',id:'life',name:'Life',system:{id:'life',value:2}}
]});
const eli=mage('eli','Eli Smith'), clo=mage('clo','Chloe <Clo>'), unowned=mage('other','Unowned Mage',false);
const vampire={...mage('vamp','Vampire'),system:{settings:{splat:'vampire'}}};
const otherMage=mage('synthetic','Synthetic Mage');
class FakeDialog{constructor(o){dialogs.push(o);this.element=null;this.form=null;}async render(){}}
const context={
 Hooks:{once:(k,cb)=>hooks[k]=cb,on:(k,cb)=>hooks[k]=cb},
 game:{system:{id:'worldofdarkness'},actors:{contents:[clo,eli,unowned,vampire]},modules:{get:()=>mod},
  user:{isGM:false,character:eli},settings:{register:()=>{},get:()=>'',set:async()=>{}},keybindings:{register:()=>{}}},
 ui:{notifications:{warn:()=>{},error:e=>{throw Error(e)}}},canvas:{tokens:{controlled:[]}},
 foundry:{utils:{escapeHTML:s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))},applications:{api:{DialogV2:FakeDialog}}},
 HTMLElement:class{},document:{querySelector:()=>null},CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},console
};
vm.runInNewContext(source+'\n;globalThis.__eligibleMageActors=eligibleMageActors;',context);
hooks.init();hooks.ready();
(async()=>{
  const choices=Array.from(context.__eligibleMageActors(eli),a=>a.name);
  assert.deepEqual(choices,['Chloe <Clo>','Eli Smith'],'only owned Mage actors are listed and sorted');
  assert.equal(context.__eligibleMageActors(otherMage).length,3,'synthetic current Actor stays selectable');
  await mod.api.guidedCast(eli);
  const html=dialogs.at(-1).content;
  assert.match(html,/<option value="Actor.eli" selected>Eli Smith<\/option>/);
  assert.match(html,/<option value="Actor.clo">Chloe &lt;Clo&gt;<\/option>/);
  assert.doesNotMatch(html,/Unowned Mage|Vampire|class="wpa-cast-change"/);
  assert.match(html,/data-current-difficulty aria-live="polite"/);
  assert.match(html,/Coincidental \(\+3 to highest Sphere\)/);
  assert.match(html,/Vulgar, no witnesses \(\+4 to highest Sphere\)/);
  assert.match(html,/Vulgar, witnessed \(\+5 to highest Sphere\)/);
  assert.ok(!/<select class="wpa-caster-select"[^>]*name=/.test(html),'caster selection is not a cast parameter');
  console.log('PASS: inline casting-character dropdown, owned Mage permissions, synthetic Actor, escaped names and reality labels.');
})().catch(e=>{console.error(e);process.exitCode=1});