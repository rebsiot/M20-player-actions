/**
 * v0.1.7 WoD20 Player Magick chat-card clarity test.
 * Verifies the outgoing native DiceRollContainer payload and simulates the
 * WoD20 roll-template.hbs placement of action, dicetext, extraInfo,
 * automatic difficulty, and systemText. No live Foundry is involved.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'scripts/player-actions.js'), 'utf8');
const labels = {
  'wod.spheres.coincidentalspell': 'Coincidental spell',
  'wod.spheres.vulgarspell': 'Vulgar spell without witnesses',
  'wod.spheres.vulgarspellwitness': 'Vulgar spell with witnesses'
};
const quint = {
  id: 'quint', type: 'Advantage', name: 'Quintessence',
  system: {id: 'quintessence', temporary: 3},
  async update(data) {this.system.temporary = data['system.temporary'];}
};
const actor = {
  id: 'mage1', name: 'Eli Smith', uuid: 'Actor.mage1', type: 'PC', isOwner: true,
  system: {settings: {splat: 'mage'}},
  items: [
    {type: 'Advantage', name: 'Arete', system: {id: 'arete', permanent: 3}},
    quint,
    {type: 'Sphere', name: 'Matter', system: {id: 'matter', value: 2}},
    {type: 'Sphere', name: 'Spirit', system: {id: 'spirit', value: 2}}
  ]
};
const captures = [];
const context = {
  Hooks:{once:()=>{},on:()=>{}},
  game: {system:{id:'worldofdarkness'},user:{isGM:false},i18n:{localize:k=>labels[k]||k}},
  ui: {notifications:{warn:()=>{},error:()=>{}}},
  foundry:{utils:{escapeHTML:String}},console
};
vm.runInNewContext(source + '\n;globalThis.__testCast = performMageCast; globalThis.__runDice = runDice; globalThis.__injectDice = api => wodDice = api;',context);
context.__injectDice({
  DiceRollContainer: class {constructor(a){this.actor = a;}},
  DiceRoller:async roll=> {captures.push(roll);return 3;}
});
const linesForCard = roll => [
  roll.action,
  ...roll.dicetext,
  ...roll.extraInfo,
  `Difficulty: ${roll.difficulty}`, // Native WoD20 always appends this.
  roll.systemText
].filter(Boolean);
(async()=>{
  await context.__testCast(actor,null,{
    'sphere.Matter':2,'sphere.Spirit':2,reality:'coincidental',
    effect:'',modifier:0,quint:0
  });
  assert.equal(captures.length,1,'exactly one native roll per cast');
  const roll = captures[0];
  assert.equal(roll.origin,'magic');
  assert.equal(roll.action,'Arete • Magick');
  assert.equal(roll.systemText,'','no duplicate title in WoD20 system text row');
  assert.equal(roll.dicetext.join(''), '3d10','dice-pool row replaces a duplicate title');
  assert.equal(roll.difficulty,5);
  const lines = linesForCard(roll);
  assert.equal(lines.filter(v=>v==='Arete • Magick').length,1,'one title');
  assert.equal(lines.filter(v=>v.startsWith('Difficulty:')).length,1,'one final difficulty');
  assert.equal(lines.filter(v=>v==='Coincidental spell').length,1,'one localized spell marker for Paradox');
  assert.equal(lines.filter(v=>v.startsWith('Reality:')).length,0,'no redundant reality label');
  assert.equal(lines.filter(v=>v.startsWith('Modifiers:')).length,0,'no zero-value modifiers shown');
  assert.ok(lines.includes('Spheres: Matter 2, Spirit 2'),'preserve Sphere information');
  // Non-default choices remain visible but do not repeat the final difficulty.
  await context.__testCast(actor,null,{
    'sphere.Matter':2,'sphere.Spirit':0,reality:'vulgar',
    effect:'Transform matter',modifier:1,quint:1
  });
  assert.equal(captures.length,2);
  const adjusted = linesForCard(captures[1]);
  assert.ok(adjusted.includes('Vulgar spell without witnesses'));
  assert.ok(adjusted.includes('Modifiers: Situation +1 · Quintessence -1'));
  assert.equal(adjusted.filter(v=>v.startsWith('Difficulty:')).length,1);
  assert.equal(quint.system.temporary,2,'existing Quintessence expenditure unchanged');
  assert.equal(captures[1].action,'Arete • Transform matter');
  // Nonmagick Power cards retain their prior fields and are not silently changed.
  await context.__runDice(actor,{title:'Presence • Power',pool:4,difficulty:6,kind:'power'});
  assert.equal(captures[2].origin,'power');
  assert.equal(captures[2].action,'Presence • Power');
  assert.equal(captures[2].systemText,'Presence • Power');
  assert.equal(captures[2].dicetext.join(''),'Presence • Power');
  console.log('PASS: compact native magick card, no repeated title/reality/difficulty, localized Paradox marker and nonzero modifiers retained.');
})().catch(e=>{console.error(e);process.exitCode=1;});