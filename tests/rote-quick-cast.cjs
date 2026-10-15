/**
 * Player Magick v0.1.9: recognized Rotes cast from a compact confirmation,
 * and unknown/inaccessible requirements fall back to the full Sphere editor.
 * Unit/mock test only; live Foundry v14 validation remains outstanding.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'player-actions.js'), 'utf8');
const hooks = {}, dialogs = [], warnings = [], rolls = [];
const mod = {};
const actor = {
  id:'mage1',uuid:'Actor.mage1',name:'Test Mage',type:'PC',isOwner:true,
  system:{settings:{splat:'mage'}},items:[
    {id:'arete',name:'Arete',type:'Advantage',system:{id:'arete',permanent:3}},
    {id:'quint',name:'Quintessence',type:'Advantage',system:{id:'quintessence',temporary:2},async update(data){this.system.temporary=data['system.temporary'];}},
    {id:'matter',name:'Matter',type:'Sphere',system:{id:'matter',value:2}},
    {id:'spirit',name:'Spirit',type:'Sphere',system:{id:'spirit',value:2}},
    {id:'fixed',name:'Shifting Surface',type:'Rote',system:{spheres:{matter:2,spirit:2}}},
    {id:'missing',name:'Mystery Rote',type:'Rote',system:{}},
    {id:'above',name:'Overreaching Rote',type:'Rote',system:{spheres:{matter:4}}}
  ]
};
for (const item of actor.items) item.parent=actor;
actor.items.get=id=>actor.items.find(i=>i.id===id);
class FakeDialog {constructor(options){dialogs.push(options);this.form=null;this.element=null;}async render(){}}
const ctx={
  Hooks:{once:(k,cb)=>hooks[k]=cb,on:(k,cb)=>hooks[k]=cb},
  game:{system:{id:'worldofdarkness'},user:{character:actor,isGM:false},actors:{contents:[actor]},
    settings:{register:()=>{},get:()=>'',set:async()=>{}},modules:{get:()=>mod},keybindings:{register:()=>{}},
    i18n:{localize:k=>({'wod.spheres.coincidentalspell':'Coincidental spell'})[k]??k}},
  ui:{notifications:{warn:m=>warnings.push(m),error:m=>{throw Error(m)}}},
  foundry:{utils:{escapeHTML:s=>String(s)},applications:{api:{DialogV2:FakeDialog}}},
  canvas:{tokens:{controlled:[]}},fromUuidSync:uuid=>uuid===actor.uuid?actor:null,
  document:{querySelector:()=>null},HTMLElement:class{},CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},console
};
vm.runInNewContext(source+'\n;globalThis.__injectDice=d=>wodDice=d;',ctx);
hooks.init();hooks.ready();
ctx.__injectDice({DiceRollContainer:class{constructor(a){this.actor=a;}},DiceRoller:async data=>{rolls.push(data);return 2;}});
(async()=>{
  await mod.api.execute(actor.uuid,'fixed');
  const quick=dialogs.at(-1);
  assert.match(quick.window.title,/Cast Rote: Shifting Surface/);
  assert.match(quick.content,/wpa-rote-quick/);
  assert.match(quick.content,/wpa-rote-chips/);
  assert.match(quick.content,/Matter <strong>2<\/strong>/);
  assert.match(quick.content,/Spirit <strong>2<\/strong>/);
  assert.match(quick.content,/name="sphere.Matter" value="2"/);
  assert.match(quick.content,/name="sphere.Spirit" value="2"/);
  assert.doesNotMatch(quick.content,/class="wpa-spheres"/,'no full Sphere picker for rote quick cast');
  assert.match(quick.content,/data-current-difficulty/);
  assert.match(quick.content,/data-quint-remaining/);
  assert.equal(quick.buttons.find(x=>x.default).action,'roll');
  assert.equal(quick.buttons.some(x=>x.action==='advanced'),true);
  assert.equal(quick.position.width,780,'Rote dialog narrower than full Improvised view');
  // The user can inspect/edit without accidentally making a roll.
  const advanced = quick.buttons.find(x=>x.action==='advanced');
  await quick.submit(advanced.callback());
  assert.equal(rolls.length,0,'Advanced does not roll or spend resources');
  assert.match(dialogs.at(-1).window.title,/Customize Rote/);
  assert.match(dialogs.at(-1).content,/class="wpa-spheres"/);
  assert.match(dialogs.at(-1).content,/name="sphere.Matter" value="2"/);

  await mod.api.execute(actor.uuid,'fixed');
  await dialogs.at(-1).submit({'sphere.Matter':2,'sphere.Spirit':2,reality:'coincidental',quint:1,modifier:0,willpower:'on'});
  assert.equal(rolls.length,1,'one existing native Arete roll');
  assert.equal(rolls[0].numDices,3,'Arete rating unchanged');
  assert.equal(rolls[0].difficulty,4,'highest Sphere 2 + 3 coincidental - 1 Quint');
  assert.equal(rolls[0].origin,'magic','Paradox listener sees magic origin');
  assert.ok(rolls[0].extraInfo.includes('Coincidental spell'),'Paradox listener localized marker');
  assert.equal(rolls[0].usewillpower,true,'native WoD20 Willpower');
  assert.equal(actor.items[1].system.temporary,1,'quint spent exactly once');

  const before=dialogs.length;
  await mod.api.execute(actor.uuid,'missing');
  assert.equal(dialogs.length,before+1,'missing Rote Spheres opens full editor');
  assert.match(dialogs.at(-1).content,/class="wpa-spheres"/);
  assert.match(warnings.at(-1),/no recognized Sphere requirements/i);
  await mod.api.execute(actor.uuid,'above');
  assert.match(dialogs.at(-1).content,/class="wpa-spheres"/);
  assert.match(warnings.at(-1),/exceeds the character/i);
  assert.equal(rolls.length,1,'invalid Rotes never auto-roll');

  console.log('PASS: Rote quick cast uses prefilled requirements, no Sphere grid, one native roll, Advanced option, safe fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});
