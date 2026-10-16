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
vm.runInNewContext(src+`\n;globalThis.__basic={rows:BASIC_ROWS,icons:BASIC_ICONS,attributes:basicAttributes,abilities:basicAbilities,traits:basicActionTraits,slots:basicSlots,save:basicSaveSlot,html:basicDashboardHTML,perform:performBasicAction,icon:basicIcon,read:basicReadSlotMap};globalThis.__injectDice=v=>wodDice=v;`,ctx);
hooks.init();
const b=ctx.__basic;
(async()=>{
  const presets=b.rows.flatMap(x=>x.actions);
  assert.equal(b.rows.length,4);
  assert.equal(presets.length,20);
  assert.equal(new Set(presets.map(x=>x.id)).size,20);
  assert.equal(b.icons.length,36);
  const iconNames=fs.readdirSync(iconFolder).filter(x=>x.endsWith('.svg'));
  assert.equal(iconNames.length,36);
  for(const icon of b.icons)assert.ok(iconNames.includes(icon+'.svg'),`missing ${icon}`);
  for(const preset of presets)assert.ok(b.icons.includes(preset.icon));
  assert.match(fs.readFileSync(path.join(iconFolder,'LICENSE.txt'),'utf8'),/Creative Commons/i);
  const setting=registrations.find(x=>x.k==='basicActionsByActor');
  assert.equal(setting.scope,'user');
  assert.equal(b.slots(eli).filter(Boolean).length,0);
  const html=b.html(eli);
  assert.equal((html.match(/class="wpa-basic-tile/g)||[]).length,25,'twenty presets and five custom tiles');
  assert.equal((html.match(/data-basic-config="/g)||[]).length,5);
  assert.ok(html.includes('Spend 1 Willpower (3 left)'));
  assert.ok(html.includes('data-basic-difficulty'));
  const notice=presets[0];
  assert.equal(b.traits(eli,notice).pool,4,'Perception 4 and Alertness 0');
  await b.perform(eli,notice,7,true);
  assert.equal(calls.length,1,'one native Actor API call');
  assert.equal(calls[0].itemId,'a0');
  assert.equal(calls[0].attribute,'perception');
  assert.equal(calls[0].options.difficulty,7);
  assert.equal(calls[0].options.useWillpower,true);
  await b.perform(eli,notice,6,false);
  assert.equal(calls[1].options.useWillpower,false);
  assert.equal(calls.length,2,'second click also yields exactly one native roll');
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
  assert.equal(calls.at(-1).attribute,'dexterity');
  assert.equal(calls.at(-1).itemId,'a4');
  await b.save(eli,0,null);
  assert.equal(b.slots(eli)[0],null,'clearing restores a blank slot');
  assert.equal(b.slots(clo)[0].label,'Read Room','clear must not affect another actor');
  const missingActor=makeActor('missing');missingActor.items=missingActor.items.filter(i=>i.name!=='Alertness');
  assert.match(b.traits(missingActor,notice).missing,/Alertness/);
  await assert.rejects(()=>b.perform(missingActor,notice),/Missing Ability/);
  assert.equal(calls.length,3,'missing Ability does not silently substitute or roll');
  const npc=makeActor('npc');delete npc.api;
  ctx.__injectDice({DiceRollContainer:class {constructor(actor){this.actor=actor;}},DiceRoller:async result=>native.push(result)});
  await b.perform(npc,notice,5,false);
  assert.equal(native.length,1);
  assert.equal(native[0].origin,'general');
  assert.equal(native[0].numDices,4);
  assert.equal(native[0].difficulty,5);
  assert.equal(fallback,0);
  console.log('PASS: 20 illustrated presets, five private persistent slots, native rolls/Willpower, missing traits and NPC fallback, SVG attribution');
})().catch(e=>{console.error(e);process.exitCode=1});
