const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'..','scripts','player-actions.js'),'utf8');
const hooks = {};
const mod = {api:null};
const dialogs = [];
const actor = {id:'mage123',uuid:'Actor.mage123',name:'Test Mage',type:'PC',isOwner:true,
  system:{settings:{splat:'mage'}},
  items:[
    {id:'ar',name:'Arete',type:'Advantage',system:{id:'arete',permanent:3}},
    {id:'qu',name:'Quintessence',type:'Advantage',system:{id:'quintessence',temporary:2}},
    {id:'life',name:'Life',type:'Sphere',system:{id:'life',value:3}},
    {id:'mind',name:'Mind',type:'Sphere',system:{id:'mind',value:2}},
    {id:'forces',name:'Forces',type:'Sphere',system:{id:'forces',value:0}},
    {id:'rote',name:'Healing Rote',type:'Rote',system:{spheres:{life:3}}}
  ]};
for (const item of actor.items) item.parent = actor;
class FakeDialog {
  constructor(options) {dialogs.push(options); this.form=null; this.element=null;}
  async render() {}
}
const ctx={
  Hooks:{once:(k,cb)=>hooks[k]=cb,on:(k,cb)=>hooks[k]=cb},
  game:{system:{id:'worldofdarkness'},settings:{register:()=>{},get:()=>'',set:async()=>{}},modules:{get:()=>mod},user:{isGM:false,character:actor},keybindings:{register:()=>{}}},
  ui:{notifications:{warn:()=>{},error:err=>{throw new Error(err)}}},
  canvas:{tokens:{controlled:[]}},
  foundry:{utils:{escapeHTML:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')},applications:{api:{DialogV2:FakeDialog}}},
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},
  HTMLElement:class HTMLElement{},
  document:{querySelector:()=>null},
  console
};
(async()=>{
  vm.runInNewContext(source,ctx);
  hooks.init();
  hooks.ready();
  await mod.api.guidedCast(actor);
  assert.equal(dialogs.length,1);
  const improvised = dialogs[0].content;
  assert.match(dialogs[0].window.title,/Improvised Magick/);
  assert.match(improvised,/data-sphere="Life"/);
  assert.match(improvised,/data-sphere="Mind"/);
  assert.doesNotMatch(improvised,/data-sphere="Forces"/);
  assert.doesNotMatch(improvised,/data-sphere="Correspondence"/);
  const life = improvised.match(/<section class="wpa-sphere" data-sphere="Life">([\s\S]*?)<\/section>/)?.[1];
  const mind = improvised.match(/<section class="wpa-sphere" data-sphere="Mind">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(life && mind);
  assert.match(life,/name="sphere.Life" value="0"/);
  assert.match(life,/data-max="3"/);
  assert.equal((life.match(/class="wpa-sphere-level(?: is-selected)?"/g)||[]).length,4, 'Life buttons 0-3');
  assert.match(life,/data-level="0" aria-pressed="true"/);
  assert.match(mind,/data-max="2"/);
  assert.equal((mind.match(/class="wpa-sphere-level(?: is-selected)?"/g)||[]).length,3, 'Mind buttons 0-2');
  assert.equal((life.match(/class="wpa-capability"/g)||[]).length,3);
  assert.equal((mind.match(/class="wpa-capability"/g)||[]).length,2);
  assert.match(life,/Sense living patterns/);
  assert.match(life,/Heal others/);
  assert.match(mind,/Read surface impressions/);
  assert.match(improvised,/Effect \/ focus description \(optional\)/);
  assert.match(improvised,/name="effect"[^>]*value=""/);
  assert.match(improvised,/class="wpa-cast-summary"/);
  assert.match(improvised,/>Test Mage<\/strong>/);
  assert.match(improvised,/class="wpa-cast-settings"/);
  assert.match(improvised,/class="wpa-cast-help"/);
  assert.doesNotMatch(improvised,/details class="wpa-sphere-guide" open/, 'Sphere help initially collapsed');
  assert.equal(dialogs[0].position.width,1020, 'Desktop casting dialog is wide');
  await mod.api.guidedCast(actor,actor.items[5]);
  assert.equal(dialogs.length,2);
  const rote = dialogs[1].content;
  assert.match(rote,/name="sphere.Life" value="3"/);
  assert.match(rote,/data-sphere="Mind"/);
  assert.doesNotMatch(rote,/data-sphere="Forces"/);
  console.log('PASS: wide casting layout, Sphere dot buttons and collapsible guides, selection limits, optional description, Rote defaults.');
})().catch(e=>{console.error(e);process.exitCode=1});