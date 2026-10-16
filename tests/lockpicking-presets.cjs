/* v0.1.18: Pick Lock must use a real ability from the standard M20 or V20 sheet. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname, '../scripts/player-actions.js'), 'utf8');
const dice = [];
const actor = (name, splat, items) => ({
  id:name, uuid:`Actor.${name}`, name, type:'PC', isOwner:true,
  system:{settings:{splat},attributes:{dexterity:{value:3,total:3}}},
  items:items.map((it,i)=>({id:`ability-${i}`,type:'Ability',name:it.name,system:{id:it.id,value:it.dots,settings:{isvisible:it.visible!==false}}}))
});
const mage = actor('mage', 'mage', [{id:'craft',name:'Crafts',dots:2}]);
const mageLocalized = actor('mage-localized', 'mage', [{id:'craft',name:'Handwerk',dots:3}]);
const vampire = actor('vampire', 'vampire', [{id:'craft',name:'Crafts',dots:4},{id:'larceny',name:'Larceny',dots:2}]);
const securitySpecialist = actor('specialist', 'mage', [{id:'craft',name:'Crafts',dots:3},{id:'security',name:'Security',dots:4}]);
const mageHidden = actor('hidden', 'mage', [{id:'security',name:'Security',dots:4,visible:false},{id:'craft',name:'Crafts',dots:1}]);
const untrained = actor('untrained','mage', [{id:'stealth',name:'Stealth',dots:3}]);
const ctx = {
  game:{system:{id:'worldofdarkness'},user:{character:mage,isGM:false},modules:{get:()=>null},settings:{register:()=>{},get:()=>'',set:async()=>{}},actors:{contents:[mage]},keybindings:{register:()=>{}}},
  canvas:{tokens:{controlled:[]}}, Hooks:{once:()=>{},on:()=>{}},
  foundry:{utils:{escapeHTML: x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}},
  ui:{notifications:{warn:()=>{},error:()=>{}}},
  document:{querySelector:()=>null},HTMLElement:class{}, console
};
vm.runInNewContext(src + `\n globalThis.__pickTest={rows:BASIC_ROWS, traits:basicActionTraits, tile:basicTileHTML, roll:performBasicAction};\n globalThis.__injectDice=v=>{wodDice=v};`,ctx);
const t=ctx.__pickTest;
const pick=t.rows.flatMap(g=>g.actions).find(a=>a.id==='pick-lock');
assert.ok(pick,'Pick Lock preset still exists with same macro ID');
assert.equal(pick.attr,'dexterity');
const traits=(who)=>t.traits(who,pick);
assert.equal(traits(mage).ability.name,'Crafts','Mage without Security/Larceny can use core Crafts');
assert.equal(traits(mage).pool,5,'Dexterity 3 + Crafts 2');
assert.match(t.tile(mage,pick,'data-basic-preset="pick-lock"'),/title="Pick Lock: Dexterity \+ Crafts = 5 dice"/);
assert.doesNotMatch(t.tile(mage,pick,'data-basic-preset="pick-lock"'),/Not on sheet| disabled/);
assert.equal(traits(mageLocalized).ability.name,'Handwerk','match the standard M20 internal craft ID even if the display label is localized');
assert.equal(traits(mageLocalized).pool,6);
assert.equal(traits(vampire).ability.name,'Larceny','prefer the V20 core Skill, even if Crafts is also present');
assert.equal(traits(vampire).pool,5);
assert.equal(traits(securitySpecialist).ability.name,'Security','retain explicitly added optional Security Skill');
assert.equal(traits(mageHidden).ability.name,'Crafts','hidden Security must not be used');
assert.equal(traits(untrained).ability,null,'do not fabricate Ability Item or dots');
assert.match(t.tile(untrained,pick,'data-basic-preset="pick-lock"'),/Not on sheet/);
assert.match(t.tile(untrained,pick,'data-basic-preset="pick-lock"'),/disabled/);
ctx.__injectDice({DiceRollContainer:class{constructor(actor){this.actor=actor;}}, DiceRoller:async r=>dice.push(r)});
(async()=>{
  await t.roll(mage,pick,8,false);
  assert.equal(dice.length,1);
  assert.equal(dice[0].ability,traits(mage).ability.id);
  assert.equal(dice[0].attribute,'dexterity');
  assert.equal(dice[0].numDices,5);
  assert.equal(dice[0].difficulty,8);
  assert.equal(dice[0].origin,'general');
  assert.equal(dice[0].action,'Pick Lock');
  await assert.rejects(()=>t.roll(untrained,pick,6,false),/Missing Ability/);
  assert.equal(dice.length,1,'a missing Ability never causes a fallback/no-skill roll');
  console.log('PASS: standard M20 Crafts, localized craft ID, V20 Larceny, optional Security, hidden Ability safeguards, native Pick Lock roll');
})().catch(e=>{console.error(e);process.exitCode=1});
