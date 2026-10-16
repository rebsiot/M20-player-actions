'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname,'../scripts/player-actions.js'),'utf8');
const macros = [], warnings=[],infos=[],errors=[], assignments=[], dialogs=[], packed=[];
const hooks={}; const prefs=new Map();
const mod='wod20-player-actions';
const worldMacro=(id,name,command,flag)=>{
  const m={id,name,command,getFlag:(ns,k)=>ns===mod && k===flag};
  macros.push(m);return m;
};
const user={isGM:false,character:null,hotbar:{1:'existing0',11:'existing11',12:'existing12'},
  async assignHotbarMacro(macro,slot){
    assert.ok(macro?.id && Number.isInteger(slot));
    assert.equal(this.hotbar[slot],undefined,'assigning must not replace occupied slots');
    assignments.push({id:macro.id,slot});this.hotbar[slot]=macro.id;
    return this;
  }};
const game={system:{id:'worldofdarkness'},user,
  settings:{register:(_mod,key,config)=>{if(!prefs.has(key))prefs.set(key,config.default);},
    get:(_mod,key)=>prefs.get(key),set:async(_mod,key,value)=>{prefs.set(key,value);return value;}},
  macros:{find:fn=>macros.find(fn),get:id=>macros.find(m=>m.id===id)},
  modules:{get:()=>({api:{}})},keybindings:{register:()=>{}},
  packs:{get:()=>packed[0]||null}, actors:{contents:[]}};
let appCount=0, activated=0, front=0;
class CompendiumApp {
  constructor(opts){assert.equal(opts.collection,packed[0]);this.rendered=false;appCount++;packed[0].apps.push(this);}
  async render(opts){assert.equal(opts.force,true);this.rendered=true;return this;}
  bringToFront(){front++;}
}
const pack={documentName:'Macro',applicationClass:CompendiumApp,apps:[]};
const root=()=>{
  const handlers={};
  const page={innerHTML:'',querySelector:()=>({focus:()=>{}})};
  return {page,handlers,querySelector:sel=>sel==='[data-wpa-tutorial-page]'?page:null,
    addEventListener:(type,fn)=>handlers[type]=fn};
};
class FakeDialog {
  constructor(options){this.options=options;this.root=root();this.element={querySelector:(sel)=>sel==='.wpa-tutorial'?this.root:null};dialogs.push(this);this.rendered=false;}
  async render(){this.rendered=true;return this;}
  async close(){this.rendered=false;return this;}
  bringToFront(){this.brought=true;}
}
const context={game,Hooks:{once:(type,fn)=>hooks[type]=fn,on:()=>{}},
  canvas:{tokens:{controlled:[]}},foundry:{applications:{api:{DialogV2:FakeDialog}},utils:{escapeHTML:String}},
  ui:{notifications:{warn:s=>warnings.push(s),info:s=>infos.push(s),error:s=>errors.push(s)},
    hotbar:{page:2},sidebar:{tabs:{compendium:{activate(){activated++;}}}}},
  document:{querySelector:()=>null},console,CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}}};
vm.runInNewContext(src+`
;globalThis.__test={add:addTutorialHotbarShortcuts,openPack:openPlayerActionsMacroCompendium,
  openTutorial,tutorialPageHTML,shortcut:tutorialShortcutMacro,offer:offerFirstLoginTutorial};`,context);
const {add,openPack,openTutorial,tutorialPageHTML}=context.__test;
const nav=async(dialog,action)=>{
  const b={disabled:false,dataset:{wpaTutorialAction:action}};
  await dialog.root.handlers.click({target:{closest:selector=>selector==='[data-wpa-tutorial-action]'?b:null}});
  return b;
};
const choose=async(dialog,key,checked=true)=>{
  const input={dataset:{wpaTutorialChoice:key},checked};
  await dialog.root.handlers.change({target:{closest:selector=>selector==='[data-wpa-tutorial-choice]'?input:null}});
};
(async()=>{
  hooks.init();prefs.set('tutorialDontShowAgain',true); // no automatic display in this fixture
  assert.match(tutorialPageHTML(3),/Would you like me to add shortcuts to your hotbar/);
  for(const key of ['magick','combat','basic','resources','compendium']) assert.match(tutorialPageHTML(3),new RegExp(`data-wpa-tutorial-choice="${key}"`));
  assert.doesNotMatch(tutorialPageHTML(3),/" checked/);
  assert.match(tutorialPageHTML(3,new Set(['basic','compendium'])),/data-wpa-tutorial-choice="basic" checked/);
  assert.doesNotMatch(tutorialPageHTML(3,new Set(['basic'])),/data-wpa-tutorial-choice="magick" checked/);
  // A non-GM can use already GM-provisioned, shared world launchers.
  const magick=worldMacro('m1','Use Magick','api.openPanel()','launcher');
  const combat=worldMacro('m2','Player Combat (Targeted)','api.openStandardAttackShortcut()','combatLauncher');
  const basic=worldMacro('m3','Player Basic Actions','api.openBasicActions()','basicLauncher');
  const resources=worldMacro('m4','Player Quick Resources','api.openQuickResources()','resourcesLauncher');
  const selected=new Set(['magick','combat','basic','resources']);
  const first=await add(selected);
  assert.equal(first.added,4);
  assert.deepEqual(assignments.map(a=>a.slot),[13,14,15,16],'use empty slots on visible page first');
  assert.deepEqual(assignments.map(a=>a.id),[magick.id,combat.id,basic.id,resources.id]);
  assert.equal(user.hotbar[1],'existing0');assert.equal(user.hotbar[11],'existing11');assert.equal(user.hotbar[12],'existing12');
  const again=await add(selected);
  assert.equal(again.already,4,'no duplicate on repeated selection');
  assert.equal(assignments.length,4);
  const copied=worldMacro('copy1','A saved player macro',basic.command,null);
  user.hotbar[16]=copied.id;delete user.hotbar[15];
  assert.equal((await add(new Set(['basic']))).already,1,'same script already on bar counts even from a different world macro');
  delete user.hotbar[16]; user.hotbar[15]=basic.id;
  // Compendium-imported copy has a distinct command but the same stable catalog ID.
  const imported={id:'copy-catalog',name:'Basic Actions',command:'distinct compendium command',
    getFlag:(ns,key)=>ns===mod && key==='catalogId'?'dash-basic':undefined};
  macros.push(imported);user.hotbar[17]=imported.id;delete user.hotbar[15];
  assert.equal((await add(new Set(['basic']))).already,1,'imported compendium copy is not installed again');
  delete user.hotbar[17];user.hotbar[15]=basic.id;
  // Existing compendium copy of Quick Resources prevents duplicate setup.
  const resourceCopy={id:'res-copy',name:'Quick Resources',command:'customized script',
    getFlag:(ns,key)=>ns===mod&&key==='catalogId'?'dash-resources':undefined};
  macros.push(resourceCopy);user.hotbar[19]=resourceCopy.id;delete user.hotbar[16];
  assert.equal((await add(new Set(['resources']))).already,1);
  delete user.hotbar[19];user.hotbar[16]=resources.id;
  macros.splice(macros.indexOf(combat),1);
  const missing=await add(new Set(['combat']));
  assert.equal(missing.missing,1,'missing GM launcher produces a friendly warning');
  assert.equal(assignments.length,4);
  macros.push(combat);
  const oldHotbar=user.hotbar;user.hotbar=Object.fromEntries(Array.from({length:50},(_,i)=>[i+1,`busy-${i+1}`]));
  assert.equal((await add(new Set(['combat']))).full,1,'full hotbar does not replace anything');
  user.hotbar=oldHotbar;
  const oldAssign=user.assignHotbarMacro;
  delete user.hotbar[15];user.assignHotbarMacro=async()=>{throw Error('permission denied');};
  assert.equal((await add(new Set(['basic']))).failed,1);
  assert.equal(user.hotbar[15],undefined);
  user.assignHotbarMacro=oldAssign;user.hotbar[15]=basic.id;
  assert.equal(await openPack(),false,'missing compendium cannot be opened silently');
  packed.push(pack);
  assert.equal(await openPack(),true);
  assert.equal(appCount,1);assert.equal(activated,1);
  assert.equal(await openPack(),true);assert.equal(appCount,1);assert.equal(front,1,'reopen existing compendium');
  // Clicks from tutorial must be opt-in, not side effects of merely visiting page 4.
  await openTutorial();
  const a=dialogs.at(-1);
  for(let i=0;i<3;i++)await nav(a,'next');
  assert.match(a.root.page.innerHTML,/Open the Player Actions Macro Compendium/);
  assert.equal(assignments.length,4,'opening tutorial never assigns');
  await choose(a,'magick');await choose(a,'compendium');
  await nav(a,'back');await nav(a,'next');
  assert.match(a.root.page.innerHTML,/data-wpa-tutorial-choice="magick" checked/,'choices retained across back/next');
  await nav(a,'finish');
  assert.equal(prefs.get('tutorialDontShowAgain'),true,'ordinary finish never resets saved preference');
  assert.equal(a.rendered,false);assert.equal(front,2,'checked compendium opens after finishing');
  await openTutorial(); const b=dialogs.at(-1);
  for(let i=0;i<3;i++)await nav(b,'next');
  const beforeAssignments=assignments.length;
  await nav(b,'dismiss');
  assert.equal(prefs.get('tutorialDontShowAgain'),true);
  assert.equal(assignments.length,beforeAssignments,'unchecked final page does not add anything');
  // A new player's checked action plus explicit opt-out should both persist.
  user.hotbar={1:'existing0'};prefs.set('tutorialDontShowAgain',false);
  await openTutorial();const c=dialogs.at(-1);
  for(let i=0;i<3;i++)await nav(c,'next');
  await choose(c,'basic');await choose(c,'resources');await choose(c,'compendium');
  await nav(c,'dismiss');
  assert.equal(prefs.get('tutorialDontShowAgain'),true);
  assert.equal(user.hotbar[11],basic.id,'on page 2, first empty slot is 11');
  assert.equal(user.hotbar[12],resources.id,'second opt-in shortcut uses next free slot');
  assert.equal(activated,4);
  assert.ok(infos.some(s=>s.includes('Added')));
  assert.ok(warnings.length>=2);
  assert.deepEqual(errors,[]);
  console.log('PASS: opt-in tutorial checkboxes, visible-page empty-slot placement, no overwrite or duplicates, missing/full/failed handling, macro compendium and dismissal');
})().catch(e=>{console.error(e);process.exitCode=1;});
