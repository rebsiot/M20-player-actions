const assert = require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','scripts/player-actions.js'),'utf8');
const created=[];const settings=new Map();const warnings=[];const notifications=[];const rolls=[];
const actor={id:'Marlowe',uuid:'Actor.Marlowe',type:'PC',name:'Marlowe',isOwner:true,
  items:['Alertness','Athletics','Brawl','Melee','Firearms'].map((name,i)=>({id:`abl-${i}`,type:'Ability',name,system:{id:name.toLowerCase(),value:i+1,settings:{isvisible:true}}})),
  system:{attributes:{perception:{total:4,value:4},dexterity:{total:3,value:3}},health:{damage:{woundpenalty:0}}}
};
const packs=new Map();let packCreates=0,packConfigures=[],packInsertBatches=0,assigned=0;
let pack;
const Macro={
 createDocuments:async (docs,{pack:packId})=>{
   assert.equal(packId,'world.wod20-player-actions-macros');
   packInsertBatches++;
   docs.forEach(d=>{
     const doc={...d,getFlag:(ns,key)=>d.flags?.[ns]?.[key]};pack.documents.push(doc);
   });
   return docs;
 }
};
const compendiumCollection={
 async createCompendium(meta){
   assert.equal(meta.name,'wod20-player-actions-macros');
   assert.equal(meta.type,'Macro');assert.equal(meta.package,'world');
   assert.equal(meta.ownership.PLAYER,'OBSERVER');
   packCreates++;
   pack={collection:'world.wod20-player-actions-macros',title:meta.label,documentName:'Macro',locked:false,documents:[],
     getDocuments:async()=>pack.documents,configure:async config=>{packConfigures.push(config);if('locked' in config)pack.locked=config.locked;return pack;}};
   packs.set(pack.collection,pack);return pack;
 }
};
const hooks={},mod={api:{}};
const game={system:{id:'worldofdarkness'},user:{isGM:true,character:actor,assignHotbarMacro:()=>assigned++},
 packs:{get:id=>packs.get(id)},settings:{register:()=>{},get:(_mod,id)=>settings.get(id)||'',set:async(_mod,id,value)=>{settings.set(id,value);return value;}},
 modules:{get:()=>mod},actors:{contents:[actor]},keybindings:{register:()=>{}},macros:{find:()=>null},
 i18n:{localize:key=>key}};
const ctx={game,Macro,foundry:{utils:{escapeHTML:String},documents:{collections:{CompendiumCollection:compendiumCollection}},applications:{api:{DialogV2:class {constructor(data){this.data=data;this.element=null;} async render(){}}}}},
 Hooks:{once:(name,fn)=>hooks[name]=fn,on:()=>{}},
 canvas:{tokens:{controlled:[{actor,document:{uuid:'Scene.test.Token.xyz'}}]}},
 ui:{notifications:{warn:s=>warnings.push(s),error:s=>notifications.push(s)}},
 CONST:{DOCUMENT_OWNERSHIP_LEVELS:{OBSERVER:2},KEYBINDING_PRECEDENCE:{NORMAL:1}},
 document:{querySelector:()=>null},console};
vm.runInNewContext(source+`
;globalThis.__catalog={definitions:catalogMacroDefinitions,ensure:ensureMacroCompendium,rollPreset:rollPresetAction,rollCustom:rollCustomShortcut,rollCombat:rollCombatShortcut,openAttack:openAttackShortcut,initiative:rollInitiativeShortcut};
;globalThis.__native=v=>wodDice=v;
;globalThis.__combat=v=>basicCombatHelper=v;
;globalThis.__anyCheck=openAnyCheckShortcut;`,ctx);
hooks.init();
const api=ctx.__catalog;
mod.api={rollPresetAction:api.rollPreset,rollCustomShortcut:api.rollCustom,rollCombatShortcut:api.rollCombat,openAttackShortcut:api.openAttack,rollInitiativeShortcut:api.initiative};
ctx.__native({DiceRollContainer:class {constructor(a){this.actor=a;}},DiceRoller:async roll=>{rolls.push(roll);return 3;}});
ctx.__combat({ignoresPain:()=>false,RollInitiative:async a=>{assert.equal(a,actor);return 17;}});
(async()=>{
  const defs=api.definitions();
  assert.equal(defs.length,40,'20 basic, five custom, five dashboard/magick, ten combat/sheet macros');
  assert.equal(new Set(defs.map(x=>x.id)).size,40,'stable unique IDs');
  assert.equal(defs.filter(d=>['Awareness','Movement','Social','Knowledge'].includes(d.group)).length,20);
  assert.equal(defs.filter(d=>d.group==='My Custom Actions').length,5);
  for(const d of defs){
    assert.match(d.command,/game\.modules\.get\("wod20-player-actions"\)\?\.api/);
    assert.match(d.img,/^modules\/wod20-player-actions\/icons\/[^/]+\.svg$/);
    const iconPath=path.join(__dirname,'..',d.img.replace('modules/wod20-player-actions/',''));
    assert.ok(fs.existsSync(iconPath),`missing ${d.name} icon`);
    assert.doesNotThrow(()=>new Function('game','ui',`return (async()=>{${d.command}})();`),`bad JS macro ${d.name}`);
  }
  assert.ok(defs.some(d=>d.name==='Use Magick'&&d.group==='Magick'));
  assert.ok(defs.some(d=>d.name==='Dodge'&&d.group==='Combat'));
  assert.ok(defs.some(d=>d.name==='Raw Attack (Choose Type)'&&d.group==='Combat'));
  assert.ok(defs.some(d=>d.name==='Standard Attack (Targeted)'&&d.group==='Combat'));
  assert.ok(defs.some(d=>d.name==='Raw Brawl Attack'&&d.group==='Combat'));
  assert.ok(defs.some(d=>d.name==='Initiative'&&d.group==='Combat'));
  assert.ok(defs.some(d=>d.name==='Rotes & Powers'));
  assert.ok(defs.some(d=>d.name==='Roll Any Check'));
  await api.ensure();
  assert.equal(packCreates,1);assert.equal(packInsertBatches,1);assert.equal(pack.documents.length,40);
  assert.ok(pack.documents.every(x=>x.type==='script'&&x.ownership.default===2&&x.flags['wod20-player-actions'].catalogId));
  assert.equal(packConfigures.at(-1).ownership.PLAYER,'OBSERVER');
  assert.equal(packConfigures.at(-1).ownership.TRUSTED,'OBSERVER');
  assert.equal(pack.locked,true);
  assert.equal(JSON.parse(settings.get('macroCatalogInstalledIds')).length,40);
  await api.ensure();assert.equal(packInsertBatches,1,'relaunch never duplicates');
  // Upgrade v0.1.13's shipped labels in a managed pack, but preserve GM customizations.
  for (const [id, oldName] of [
    ['dash-magick','Player Magick'], ['attack','Attack (Choose Type)'],
    ['combat-brawl-attack','Brawl Attack'], ['combat-firearms-attack','Firearms Attack']
  ]) {
    const doc=pack.documents.find(d=>d.flags['wod20-player-actions'].catalogId===id);
    doc.name=oldName;
    doc.update=async update=>{Object.assign(doc,update);return doc;};
  }
  const edited=pack.documents.find(d=>d.flags['wod20-player-actions'].catalogId==='combat-melee-attack');
  edited.name='Melee Attack';edited.command='CUSTOM GM EDIT';
  edited.update=async update=>{Object.assign(edited,update);return edited;};
  await api.ensure();
  assert.equal(packInsertBatches,1,'renaming shipped macros never recreates pack entries');
  for (const [id, expected] of [
    ['dash-magick','Use Magick'], ['attack','Raw Attack (Choose Type)'],
    ['combat-brawl-attack','Raw Brawl Attack'], ['combat-firearms-attack','Raw Firearms Attack']
  ]) assert.equal(pack.documents.find(d=>d.flags['wod20-player-actions'].catalogId===id)?.name,expected);
  assert.equal(edited.name,'Melee Attack','customized GM command must not be renamed or overwritten');
  assert.equal(edited.command,'CUSTOM GM EDIT');
  // GMs can remove or edit entries; do not overwrite/recreate removed shortcuts.
  pack.documents=pack.documents.filter(d=>d.getFlag('wod20-player-actions','catalogId')!=='basic-notice');
  await api.ensure();assert.equal(pack.documents.length,39,'removed macro stays removed');
  const notice=defs.find(d=>d.id==='basic-notice');
  await new Function('game','ui',`return (async()=>{${notice.command}})();`)(game,ctx.ui);
  assert.equal(rolls.length,1);assert.equal(rolls[0].action,'Notice');
  assert.equal(rolls[0].difficulty,6);assert.equal(rolls[0].numDices,5);
  await api.rollCombat('dodge');assert.equal(rolls.at(-1).action,'Dodge');
  assert.equal(rolls.at(-1).ability,'abl-1');
  await api.rollCombat('brawl-attack');assert.equal(rolls.at(-1).action,'Raw Brawl Attack');
  assert.equal(await api.initiative(),17,'native system initiative, not invented roll');
  // Generic Attack must select a declared Ability and use one native roll.
  ctx.foundry.applications.api.DialogV2.input=async()=>({attackType:'firearms-attack',difficulty:8,willpower:true});
  await api.openAttack();
  assert.equal(rolls.at(-1).action,'Raw Firearms Attack');
  assert.equal(rolls.at(-1).ability,'abl-4');
  assert.equal(rolls.at(-1).difficulty,8);
  assert.equal(rolls.at(-1).usewillpower,true);
  // The Roll Any Check shortcut uses a freeform native Attribute+Ability.
  ctx.foundry.applications.api.DialogV2.input=async()=>({attribute:'perception',abilityId:'abl-0',difficulty:7,willpower:false});
  await ctx.__anyCheck();
  assert.equal(rolls.at(-1).action,'Perception + Alertness');
  assert.equal(rolls.at(-1).difficulty,7);
  // Custom slot is stored per-user and per-character: configured slots roll through native WoD20.
  settings.set('basicActionsByActor',JSON.stringify({[actor.uuid]:[{label:'Listen',attr:'perception',abilityId:'abl-0',icon:'binoculars'}]}));
  await api.rollCustom(0);assert.equal(rolls.at(-1).action,'Listen');
  const numberRolled=rolls.length;
  await api.rollCustom(1);assert.equal(rolls.length,numberRolled,'blank slot opens editor; never rolls');
  assert.equal(assigned,0,'does not assign a hotbar');
  // Player cannot create/update packs. Pack-owned macros are nevertheless readable.
  game.user.isGM=false;
  await api.ensure();assert.equal(packCreates,1);assert.equal(packInsertBatches,1);
  // When disabled/no pack API, compendium initialization fails harmlessly.
  game.user.isGM=true;delete game.packs.get;
  await api.ensure();assert.equal(packInsertBatches,1);
  console.log('PASS: 40 validated draggable native Script Macro entries, compendium rights, idempotence, retained edits, player safety and native rolls');
})().catch(e=>{console.error(e);process.exitCode=1});
