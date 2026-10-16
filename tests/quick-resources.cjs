/* v0.1.20 native resource regressions and sheet-gated Chimerical damage. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../scripts/player-actions.js'),'utf8');
const notices=[],writes=[],dialogues=[];
const mage={id:'mage',uuid:'Actor.mage',name:'Eli Smith',type:'PC',isOwner:true,
  system:{settings:{splat:'mage',usechimerical:false},health:{damage:{bashing:2,lethal:1,aggravated:0,chimerical:{bashing:1,lethal:0,aggravated:0}},
    bruised:{total:1},hurt:{total:1},injured:{total:1},wounded:{total:1},mauled:{total:1},crippled:{total:1},incapacitated:{total:1}},
    traits:{health:{totalhealthlevels:{max:7}}}},items:[],updates:[],
  async update(changes){this.updates.push(changes);for(const [key,value] of Object.entries(changes)){
    const parts=key.split('.');let ref=this;for(const part of parts.slice(0,-1))ref=ref[part];ref[parts.at(-1)]=value;
  }return this;}}
const advantage=(id,temporary,permanent,max)=>{
  const i={id:`adv-${id}`,name:id,type:'Advantage',parent:mage,
    system:{id,temporary,permanent,max,settings:{isvisible:true}},updates:[],
    async update(data){this.updates.push(data);this.system.temporary=data['system.temporary'];return this;}};
  mage.items.push(i);return i;
};
const wp=advantage('willpower',4,7,10);
const quint=advantage('quintessence',8,0,20);
const paradox=advantage('paradox',2,1,20);
const invisible=advantage('gnosis',5,5,10);invisible.system.settings.isvisible=false;
const vampire={id:'vamp',uuid:'Actor.vamp',type:'Vampire',name:'Vampire NPC',isOwner:true,
  system:{settings:{isupdated:true},advantages:{willpower:{temporary:3,permanent:6,max:10},bloodpool:{temporary:7,max:11}},
    health:{damage:{bashing:0,lethal:0,aggravated:0},bruised:{total:1},hurt:{total:1},injured:{total:1},wounded:{total:1},mauled:{total:1},crippled:{total:1},incapacitated:{total:1}}},
  items:[],updates:[],async update(data){this.updates.push(data);for(const [key,val] of Object.entries(data)){
    const keys=key.split('.');let obj=this;for(const part of keys.slice(0,-1))obj=obj[part];obj[keys.at(-1)]=val;}}};
let root=null;
class Dialog {constructor(data){this.data=data;this.handlers={};this.rendered=false;dialogues.push(this);}
 async render(){this.rendered=true;root={handlers:this.handlers,innerHTML:this.data.content,
   addEventListener:(name,fn)=>this.handlers[name]=fn,
   querySelector:(selector)=>selector==='[data-wpa-resource-content]'?{set innerHTML(s){root.innerHTML=s;}}:null};
   this.element={querySelector:selector=>selector==='.wpa-resources'?root:null};return this;}
 async close(){this.rendered=false;}}
const game={user:{isGM:false,character:mage},settings:{get:()=>'',set:async()=>{},register:()=>{}},
  system:{id:'worldofdarkness'},modules:{get:()=>({api:{}})},actors:{contents:[mage,vampire]},keybindings:{register:()=>{}}};
const context={game,canvas:{tokens:{controlled:[]}},Hooks:{once:()=>{},on:()=>{}},
  foundry:{utils:{escapeHTML:x=>String(x)},applications:{api:{DialogV2:Dialog}}},
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},document:{querySelector:()=>null},
  ui:{notifications:{error:x=>notices.push(String(x)),warn:x=>notices.push(String(x))}},console};
vm.runInNewContext(script+`
globalThis.__resourceTest={snapshot:quickResourceSnapshot,entry:quickResourceEntry,
  change:quickResourceChange,undo:quickResourceUndo,html:quickResourcesContentHTML,
  open:openQuickResources};`,context);
const t=context.__resourceTest;
const get=(actor,key)=>t.entry(actor,`pool:${key}`);
const click=async(id,delta)=>{const el={dataset:{wpaResourceId:id,wpaResourceDelta:String(delta)},disabled:false};
 await root.handlers.click({target:{closest:()=>el}});};
const action=async(name)=>{const el={dataset:{wpaResourceAction:name},disabled:false};
 await root.handlers.click({target:{closest:()=>el}});};
(async()=>{
  const start=t.snapshot(mage);
  assert.equal(start.resources.length,3,'only existing visible pools; never invent missing Resources');
  assert.equal(start.healthTracks.length,1,'dormant chimerical fields do not expose a track for Mage');
  assert.equal(get(mage,'willpower').max,7,'Willpower cap is permanent rating, not global max');
  assert.equal(get(mage,'quintessence').max,17,'shared wheel holds 2 temporary + 1 permanent Paradox');
  assert.equal(get(mage,'paradox').max,11,'Paradox capacity reserves existing Quintessence and permanent Paradox');
  assert.match(t.html(mage),/Paradox \(temporary\)/);
  assert.match(t.html(mage),/Aggravated/);
  assert.doesNotMatch(t.html(mage),/Chimerical Damage/,'Mage without enabled sheet option sees physical damage only');
  assert.equal(t.entry(mage,'health:chimerical:bashing'),null);
  await assert.rejects(()=>t.change(mage,'health:chimerical:bashing',1),/not on the current character/i);
  mage.system.settings.usechimerical=true;
  assert.equal(t.snapshot(mage).healthTracks.length,2,'enabled PC sheet shows the optional chimerical track');
  assert.match(t.html(mage),/Chimerical Damage/);
  // Legacy Changeling character sheets expose this through their computed
  // `haschimericalhealth` flag rather than the newer PC toggle.
  const legacyChangeling={...vampire,id:'changeling',uuid:'Actor.changeling',type:'Changeling',
    system:{...vampire.system,settings:{isupdated:true},
      listdata:{settings:{haschimericalhealth:true}},
      health:{...vampire.system.health,damage:{...vampire.system.health.damage,
        chimerical:{bashing:2,lethal:0,aggravated:0}}}}};
  assert.equal(t.snapshot(legacyChangeling).healthTracks.length,2,
    'existing enabled legacy Changeling health continues to work');
  const legacyMage={...legacyChangeling,id:'old-mage',uuid:'Actor.old-mage',type:'Mage',
    system:{...legacyChangeling.system,listdata:{settings:{haschimericalhealth:false}}}};
  assert.equal(t.snapshot(legacyMage).healthTracks.length,1,
    'legacy Mage with chimerical-shaped data but no active sheet track stays compact');
  assert.doesNotMatch(t.html(mage),/Gnosis/,'hidden resource not exposed');
  assert.ok(t.html(mage).includes('data-wpa-resource-id="health:physical:lethal"'));
  const incr=await t.change(mage,'pool:willpower',1);
  assert.equal(incr.before,4);assert.equal(incr.after,5);assert.equal(wp.system.temporary,5);
  assert.equal(wp.updates[0]['system.temporary'],5,'updates real embedded Advantage Item, not derived actor cache');
  assert.equal(wp.system.permanent,7,'permanent Willpower not modified');
  assert.equal(mage.updates.length,0);
  await t.undo(mage,{id:'pool:willpower',before:4,after:5,identity:wp.id});
  assert.equal(wp.system.temporary,4);
  await assert.rejects(()=>t.undo(mage,{id:'pool:willpower',before:4,after:5,identity:wp.id}),/changed/i);
  wp.system.temporary=7;
  assert.equal((await t.change(mage,'pool:willpower',1)).changed,false,'cannot go past permanent Willpower');
  wp.system.temporary=4;
  quint.system.temporary=17;
  assert.equal((await t.change(mage,'pool:quintessence',1)).changed,false,'shared-wheel cap includes permanent Paradox');
  quint.system.temporary=8;
  assert.equal((await t.change(mage,'pool:paradox',1)).after,3,'manual temporary Paradox may be corrected');
  assert.equal(paradox.system.permanent,1,'permanent Paradox unchanged');
  await t.change(mage,'pool:paradox',-1);
  assert.equal(paradox.system.temporary,2);
  assert.equal((await t.change(mage,'health:physical:lethal',1)).after,2);
  assert.equal(mage.system.health.damage.lethal,2,'native distinct Lethal field updated');
  assert.equal(mage.system.health.damage.bashing,2);
  assert.equal((await t.change(mage,'health:physical:aggravated',1)).after,1);
  assert.equal(mage.system.health.damage.aggravated,1);
  assert.equal((await t.change(mage,'health:chimerical:bashing',-1)).after,0);
  assert.equal(mage.system.health.damage.chimerical.bashing,0);
  assert.equal(mage.system.health.damage.bashing,2,'chimerical change does not alter physical track');
  mage.system.settings.usechimerical=false;
  assert.equal(t.snapshot(mage).healthTracks.length,1,'disabling the sheet option hides chimerical without deleting data');
  assert.equal(mage.system.health.damage.chimerical.bashing,0,'disabled track retains existing damage values');
  mage.system.settings.usechimerical=true;
  // Respect custom wound track capacity, and never erase/promote other damage types.
  mage.system.health.damage.bashing=5;mage.system.health.damage.lethal=2;mage.system.health.damage.aggravated=0;
  assert.equal((await t.change(mage,'health:physical:aggravated',1)).changed,false);
  assert.equal(mage.system.health.damage.aggravated,0);
  assert.equal((await t.change(mage,'health:physical:bashing',-1)).after,4);
  assert.equal((await t.change(mage,'health:physical:aggravated',1)).after,1);
  assert.equal(mage.system.health.damage.bashing,4,'full track does not silently promote or replace damage');
  // Legacy compatibility: write actual actor.system.advantages, request system recalculation.
  assert.equal(get(vampire,'bloodpool').current,7);
  assert.equal((await t.change(vampire,'pool:bloodpool',-1)).after,6);
  assert.equal(vampire.updates.at(-1)['system.advantages.bloodpool.temporary'],6);
  assert.equal(vampire.updates.at(-1)['system.settings.isupdated'],false);
  assert.equal((await t.change(vampire,'pool:willpower',1)).after,4);
  assert.equal(get(vampire,'willpower').max,6);
  // Permission refusal: no edits, including Actor health.
  mage.isOwner=false;
  await assert.rejects(()=>t.change(mage,'health:physical:bashing',1),/no longer control/i);
  mage.isOwner=true;
  await t.open(mage);
  assert.match(root.innerHTML,/Quick Resources/);
  assert.match(root.innerHTML,/Resources/);
  assert.match(root.innerHTML,/Undo/);
  assert.match(root.innerHTML,/Updates save immediately/);
  await click('pool:willpower',-1);
  assert.equal(wp.system.temporary,3,'one click saved without Save button');
  await action('undo');
  assert.equal(wp.system.temporary,4,'Undo Last writes old value only if unchanged');
  await click('pool:quintessence',1);
  assert.equal(quint.system.temporary,9);
  // External update blocks unsafe undo rather than overwriting current state.
  quint.system.temporary=13;
  await action('undo');
  assert.equal(quint.system.temporary,13);
  assert.ok(notices.at(-1).includes('changed'));
  assert.deepEqual(writes,[]);
  console.log('PASS: immediate native Advantage and Actor writes, shared Quintessence/Paradox capacity, gated chimerical health, compact controls, legacy pool compatibility, safe undo and permissions');
})().catch(error=>{console.error(error);process.exitCode=1});
