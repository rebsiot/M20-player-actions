/* v0.1.16 native defensive shortcuts, Modern Scenes and private favorite-Rote regressions. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname,'../scripts/player-actions.js'),'utf8');
const settings = new Map();
const registrations = [];
const native = [];
const notices = [];
let selected = null;
let dialogResult = null;
let actorUpdates = 0;
const makeActor = (name) => ({
  id:name, uuid:`Actor.${name}`, name, type:'Mage', isOwner:true,
  documentName:'Actor',
  system:{settings:{splat:'mage'},attributes:{
    dexterity:{value:3,total:3},wits:{value:4,total:4},
    manipulation:{value:2,total:2},intelligence:{value:3,total:3},
    stamina:{value:2,total:2},perception:{value:3,total:3}}},
  items:[],update:async()=>{actorUpdates++;}
});
const eli=makeActor('eli'),chloe=makeActor('chloe');
eli.items=[
  {id:'wp',type:'Advantage',name:'Willpower',system:{id:'willpower',permanent:7,temporary:1}},
  {id:'arete',type:'Advantage',name:'Arete',system:{id:'arete',permanent:4}},
  {id:'mind',type:'Sphere',name:'Mind',system:{id:'mind',value:2}},
  {id:'drive',type:'Ability',name:'Drive',system:{id:'drive',value:2}},
  {id:'larceny',type:'Ability',name:'Larceny',system:{id:'larceny',value:3}},
  {id:'stealth',type:'Ability',name:'Stealth',system:{id:'stealth',value:1}},
  {id:'streetwise',type:'Ability',name:'Streetwise',system:{id:'streetwise',value:3}},
  {id:'crafts',type:'Ability',name:'Crafts',system:{id:'crafts',value:4}},
  {id:'r1',type:'Rote',name:'Mend Wound',system:{}},
  {id:'r2',type:'Rote',name:'Sense Spirit',system:{}}
];
const ctx={
  game:{user:{isGM:false,character:eli},system:{id:'worldofdarkness'},modules:{get:()=>({api:{}})},
    settings:{get:(mod,key)=>settings.get(`${mod}.${key}`)||'',set:async(mod,key,v)=>{settings.set(`${mod}.${key}`,v);return v;},register:(mod,key,config)=>registrations.push({key,...config})},
    actors:{contents:[eli,chloe]},keybindings:{register:()=>{}}},
  canvas:{tokens:{controlled:[]}},
  foundry:{utils:{escapeHTML:(s)=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))},
    applications:{api:{DialogV2:{input:async()=>dialogResult}}}},
  ui:{notifications:{warn:s=>notices.push(String(s)),error:s=>notices.push(String(s)),info:s=>notices.push(String(s))}},
  Hooks:{once:()=>{},on:()=>{}},
  fromUuidSync:()=>selected,fromUuid:async()=>selected,
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},
  document:{querySelector:()=>null},HTMLElement:class{},console
};
vm.runInNewContext(src+`
  globalThis.__test={
    rows:BASIC_ROWS, traits:basicActionTraits, tile:basicTileHTML,
    resist:resistanceTraits, openResist:openResistanceShortcut, openCounter:openCountermagickShortcut,
    favoriteMap:favoriteRoteMap, favoriteIds:favoriteRoteIds, toggle:toggleFavoriteRote,
    favoriteHTML:roteSectionsHTML, selected:resolveActor
  };
  globalThis.__injectDice=v=>{wodDice=v};
`,ctx);
const t=ctx.__test;
ctx.__injectDice({DiceRollContainer:class {constructor(actor){this.actor=actor;}},DiceRoller:async r=>native.push(r)});
(async()=>{
  const modern=t.rows.find(row=>row.label==='Modern Scenes');
  assert.equal(modern.actions.length,5,'five modern presets');
  assert.equal(t.traits(eli,modern.actions[0]).ability.name,'Drive');
  assert.equal(t.traits(eli,modern.actions[1]).ability.name,'Larceny','uses present alternate');
  assert.equal(t.traits(eli,modern.actions[4]).ability.name,'Crafts');
  assert.equal(t.traits(chloe,modern.actions[1]).ability,null,'never invent missing Security/Larceny');
  assert.match(t.tile(chloe,modern.actions[1],'data-basic-preset="pick-lock"'),/disabled/);
  assert.ok(t.rows.flatMap(row=>row.actions).every(a=>!a.abilities || a.abilities.length>0));

  const resist=t.resist(eli);
  const willpower=resist.find(x=>x.id==='virtue:willpower');
  assert.equal(willpower.pool,7,'use permanent Willpower rating, not current pool');
  assert.equal(resist[1].id,'attribute:stamina','Stamina appears before remaining Attributes');
  assert.ok(!resist.some(x=>x.id==='virtue:courage'),'unrecorded Virtues are not invented');
  dialogResult={trait:'virtue:willpower',difficulty:8};
  await t.openResist(eli);
  assert.equal(native.length,1);
  assert.equal(native[0].origin,'general');
  assert.equal(native[0].numDices,7);
  assert.equal(native[0].difficulty,8);
  assert.equal(native[0].usewillpower,false);
  assert.equal(eli.items[0].system.temporary,1,'no Willpower expenditure');

  dialogResult={sphere:'Mind',difficulty:7};
  await t.openCounter(eli);
  assert.equal(native.length,2);
  assert.equal(native[1].numDices,4);
  assert.equal(native[1].origin,'general','defensive roll not native magic cast');
  assert.equal(native[1].difficulty,7);
  assert.doesNotMatch(native[1].action,/Vulgar|Coincidental|Paradox/);
  assert.match(native[1].extraInfo.join(' '),/Sphere used: Mind/);
  assert.equal(eli.items[1].system.permanent,4);
  const noArete=makeActor('no-arete');
  await t.openCounter(noArete);
  assert.equal(native.length,2,'no Arete does not roll');
  assert.match(notices.at(-1),/no Arete/i);

  const r=eli.items.filter(i=>i.type==='Rote');
  assert.equal(t.favoriteIds(eli).length,0);
  await t.toggle(eli,'r2');
  assert.equal(t.favoriteIds(eli)[0],'r2');
  assert.equal(t.favoriteIds(chloe).length,0);
  let html=t.favoriteHTML(eli,r);
  assert.match(html,/Favorite Rotes/);
  assert.ok(html.indexOf('Sense Spirit') < html.indexOf('Mend Wound'),'favorite first');
  assert.match(html,/aria-pressed="true"/);
  await t.toggle(eli,'r1');
  assert.equal(t.favoriteIds(eli).length,2);
  await t.toggle(eli,'r2');
  assert.equal(t.favoriteIds(eli).join(','),'r1');
  assert.equal(eli.items.find(i=>i.id==='r2').name,'Sense Spirit','Rote Item remains unchanged');
  await assert.rejects(()=>t.toggle(eli,'deleted'),/not available/);
  eli.isOwner=false;
  await assert.rejects(()=>t.toggle(eli,'r1'),/not available/);
  eli.isOwner=true;
  assert.equal(actorUpdates,0,'no Actor modifications');
  console.log('PASS: five modern presets, missing real Abilities, permanent Willpower/native resistance, non-magick countermagick and per-Actor favorite Rotes');
})().catch(error=>{console.error(error);process.exitCode=1});
