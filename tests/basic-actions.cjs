const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'scripts','player-actions.js'),'utf8');
const iconFolder=path.join(root,'icons');
const calls=[],native=[];const prefs=new Map();const registrations=[];let fallback=0;
function makeActor(id) {
  const attr={strength:2,dexterity:3,stamina:2,charisma:4,manipulation:2,appearance:3,perception:4,intelligence:3,wits:3};
  const abilities=['Alertness','Awareness','Investigation','Empathy','Stealth','Athletics','Survival','Expression','Subterfuge','Intimidation','Etiquette','Leadership','Occult','Academics','Computer','Medicine'];
  const actor={id,uuid:`Actor.${id}`,name:'Actor '+id,type:'PC',isOwner:true,
    system:{settings:{splat:'mage'},attributes:Object.fromEntries(Object.entries(attr).map(([k,v])=>[k,{value:v,total:v}]))},
    items:abilities.map((x,i)=>({id:`a${i}`,type:'Ability',name:x,system:{id:x.toLowerCase(),value:i%4}}))};
  actor.items.push({id:'wp',type:'Advantage',name:'Willpower',system:{id:'willpower',temporary:3}});
  actor.api={rollAbility:async(itemId,attribute,options)=>{calls.push({actor:id,itemId,attribute,options});}};
  return actor;
}
const eli=makeActor('eli'),clo=makeActor('clo');
const hooks={},moduleObj={api:null};
const ctx={
  Hooks:{once:(k,f)=>hooks[k]=f,on:()=>{}},
  game:{system:{id:'worldofdarkness'},user:{isGM:false,character:eli},modules:{get:()=>moduleObj},
    settings:{register:(mod,k,v)=>registrations.push({k,...v}),get:(mod,key)=>prefs.get(`${mod}.${key}`)||'',set:async(mod,key,value)=>{prefs.set(`${mod}.${key}`,value);}},
    actors:{contents:[eli,clo]},keybindings:{register:()=>{}}},
  canvas:{tokens:{controlled:[]}},ui:{notifications:{warn:()=>{},error:()=>{}}},
  foundry:{utils:{escapeHTML:s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}},
  document:{querySelector:()=>null},CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},
  HTMLElement:class {},console
};
vm.runInNewContext(src+`\n;globalThis.__basic={rows:BASIC_ROWS,icons:BASIC_ICONS,attributes:basicAttributes,abilities:basicAbilities,traits:basicActionTraits,slots:basicSlots,save:basicSaveSlot,html:basicDashboardHTML,tile:basicTileHTML,perform:performBasicAction,icon:basicIcon,read:basicReadSlotMap};globalThis.__injectDice=v=>wodDice=v;`,ctx);
hooks.init();
const b=ctx.__basic;
(async()=>{
  const presets=b.rows.flatMap(x=>x.actions);
  assert.equal(b.rows.length,5);
  assert.equal(presets.length,25);
  assert.equal(new Set(presets.map(x=>x.id)).size,25);
  assert.equal(b.icons.length,162);
  const iconNames=fs.readdirSync(iconFolder).filter(x=>x.endsWith('.svg'));
  assert.equal(iconNames.length,162);
  for(const icon of b.icons)assert.ok(iconNames.includes(icon+'.svg'),`missing ${icon}`);
  for(const preset of presets)assert.ok(b.icons.includes(preset.icon));
  assert.match(fs.readFileSync(path.join(iconFolder,'LICENSE.txt'),'utf8'),/Creative Commons/i);
  const setting=registrations.find(x=>x.k==='basicActionsByActor');
  assert.equal(setting.scope,'user');
  assert.equal(b.slots(eli).filter(Boolean).length,0);
  const html=b.html(eli);
  assert.equal((html.match(/class="wpa-basic-tile(?=\s|")/g)||[]).length,30,'twenty-five presets and five custom tiles');
  assert.equal((html.match(/data-basic-config="/g)||[]).length,5);
  assert.ok(html.includes('Spend 1 Willpower (3 left)'));
  assert.ok(html.includes('data-basic-difficulty'));
  assert.match(html,/wpa-basic-pair\">Per \+ Alert</,'preset displays meaningful Attribute + Ability abbreviation');
  assert.match(html,/wpa-basic-pair\">Int \+ Occ</,'knowledge roll shows unambiguous shortened pairing');
  assert.match(html,/class=\"wpa-basic-tile-main\"/,'compact tile groups icon beside its action name');
  assert.match(html,/title=\"Notice: Perception \+ Alertness = 4 dice\"/,'full pairing remains available via tooltip');
  // Color is keyed to the combined dice pool, not the Ability dots alone.
  const tintActor=makeActor('tint');
  tintActor.system.attributes.strength.value=0;tintActor.system.attributes.strength.total=0;
  assert.match(b.tile(tintActor,{label:'Zero',attr:'strength',ability:'Alertness',icon:'fist'},'data-example="0"'),/--wpa-pool-hue:0/);
  assert.match(b.tile(eli,{label:'Four',attr:'perception',ability:'Alertness',icon:'binoculars'},'data-example="4"'),/--wpa-pool-hue:52/);
  tintActor.system.attributes.perception.value=7;tintActor.system.attributes.perception.total=7;
  assert.match(b.tile(tintActor,{label:'Seven+',attr:'perception',ability:'Alertness',icon:'binoculars'},'data-example="7"'),/--wpa-pool-hue:120/);
  const notice=presets[0];
  assert.equal(b.traits(eli,notice).pool,4,'Perception 4 and Alertness 0');
  ctx.__injectDice({DiceRollContainer:class {constructor(actor){this.actor=actor;}},DiceRoller:async result=>native.push(result)});
  await b.perform(eli,notice,7,true);
  assert.equal(native.length,1,'one native WoD20 DiceRoller call');
  assert.equal(native[0].action,'Notice','chat heading is dashboard action, not Ability name');
  assert.equal(native[0].ability,'a0');
  assert.equal(native[0].attribute,'perception');
  assert.equal(native[0].difficulty,7);
  assert.equal(native[0].usewillpower,true);
  assert.equal(native[0].origin,'general');
  assert.equal(native[0].numDices,4);
  await b.perform(eli,notice,6,false);
  assert.equal(native[1].usewillpower,false);
  assert.equal(native.length,2,'second click also yields exactly one native roll');
  assert.equal(calls.length,0,'no additional roll via Actor API');
  const first={label:'Pick Lock',attr:'dexterity',abilityId:'a4',icon:'pencil'};
  await b.save(eli,0,first);
  assert.equal(b.slots(eli)[0].label,'Pick Lock');
  assert.equal(b.slots(clo)[0],null,'custom slots separate per character');
  await b.save(clo,0,{label:'Read Room',attr:'perception',abilityId:'a0',icon:'eye-target'});
  assert.equal(b.slots(eli)[0].label,'Pick Lock','saving other character does not overwrite first');
  assert.equal(b.slots(clo)[0].icon,'eye-target');
  const slotsFromNewRead=JSON.parse(prefs.get('wod20-player-actions.basicActionsByActor'));
  assert.equal(Object.keys(slotsFromNewRead).length,2,'persistent JSON stores both Actors');
  await b.perform(eli,b.slots(eli)[0],6,false);
  assert.equal(native.at(-1).attribute,'dexterity');
  assert.equal(native.at(-1).ability,'a4');
  assert.equal(native.at(-1).action,'Pick Lock');
  await b.save(eli,0,null);
  assert.equal(b.slots(eli)[0],null,'clearing restores a blank slot');
  assert.equal(b.slots(clo)[0].label,'Read Room','clear must not affect another actor');
  const missingActor=makeActor('missing');missingActor.items=missingActor.items.filter(i=>i.name!=='Alertness');
  assert.match(b.traits(missingActor,notice).missing,/Alertness/);
  await assert.rejects(()=>b.perform(missingActor,notice),/Missing Ability/);
  assert.equal(native.length,3,'missing Ability does not silently substitute or roll');
  const npc=makeActor('npc');delete npc.api;
  ctx.__injectDice({DiceRollContainer:class {constructor(actor){this.actor=actor;}},DiceRoller:async result=>native.push(result)});
  await b.perform(npc,notice,5,false);
  assert.equal(native.length,4);
  assert.equal(native[3].origin,'general');
  assert.equal(native[3].numDices,4);
  assert.equal(native[3].action,'Notice');
  assert.equal(native[3].difficulty,5);
  assert.equal(fallback,0);
  console.log('PASS: 25 illustrated presets, 162 licensed icons, 5 private slots, native action-title rolls/Willpower, missing traits, NPC');
})().catch(e=>{console.error(e);process.exitCode=1});
