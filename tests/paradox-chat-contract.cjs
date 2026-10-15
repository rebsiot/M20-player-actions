/** Player Magick -> native WoD20 -> Dice Improvements Paradox-die recognition.
 * This is a contract/mock test, not a live Foundry or module interaction test.
 * Detection keys/logic are based on rebsiot/wod20-dice-improvements src/paradox.js v0.2.0.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'scripts/player-actions.js'), 'utf8');
const localized = Object.freeze({
  'wod.spheres.coincidentalspell': 'Coincidental spell',
  'wod.spheres.vulgarspell': 'Vulgar spell without witnesses',
  'wod.spheres.vulgarspellwitness': 'Vulgar spell with witnesses'
});
const actor = {
  id: 'mage', name: 'Mage with Paradox', uuid: 'Actor.mage', isOwner: true, type: 'PC',
  system: {settings: {splat: 'mage'}},
  items: [
    {type:'Advantage',name:'Arete',system:{id:'arete',permanent:3}},
    {type:'Sphere',name:'Mind',system:{id:'mind',value:2}}
  ]
};
const captured = [];
const context = {
  Hooks:{once:()=>{},on:()=>{}},
  game: {system:{id:'worldofdarkness'},user:{isGM:false},
    i18n:{localize:key=>localized[key]||key}},
  ui: {notifications:{warn:()=>{},error:()=>{}}},
  foundry:{utils:{escapeHTML:String}}, console
};
vm.runInNewContext(source + '\n;globalThis.testCast=performMageCast; globalThis.injectNative=api=>wodDice=api;',context);
context.injectNative({
  DiceRollContainer: class {constructor(actor){this.actor=actor;}},
  DiceRoller: async dice => {
    // WoD20 roll-template.hbs places DiceRollContainer.extraInfo inside chat HTML,
    // and rolls every d10 as a separate Roll in ChatMessage.rolls.
    captured.push({
      content: `<div class="wod20-roll">${dice.extraInfo.map(s=>`<div class="tray-action-area">${s}</div>`).join('')}</div>`,
      rolls: [{total:1},{total:8},{total:5}],
      actor: dice.actor,
      origin:dice.origin
    });
    return 1;
  }
});
(async()=>{
  for (const reality of ['coincidental','vulgar','witnessed']) {
    await context.testCast(actor,null,{'sphere.Mind':'2',reality,quint:'0',modifier:'0',effect:'Quick test'});
  }
  assert.equal(captured.length,3,'one native roll per spell');
  const magicMarkers=Object.values(localized);
  for (const chat of captured) {
    assert.equal(chat.origin,'magic','native magic chat card type');
    assert.ok(magicMarkers.some(marker=>chat.content.includes(marker)),'recognized by Dice Improvements spell detector');
    assert.equal(chat.actor,actor,'correct Mage message speaker');
    const existingParadox=2;
    const paradoxDice=Math.min(existingParadox,chat.rolls.length);
    const markedFaces=chat.rolls.slice(0,paradoxDice).map(die=>die.total);
    assert.equal(paradoxDice,2,'two marked dice from two existing Paradox');
    assert.equal(markedFaces.filter(x=>x===1).length,1,'one die generates Paradox on a 1; processing remains with Dice Improvements');
  }
  assert.equal(captured[0].content.includes('Coincidental spell'),true);
  assert.equal(captured[1].content.includes('Vulgar spell without witnesses'),true);
  assert.equal(captured[2].content.includes('Vulgar spell with witnesses'),true);
  console.log('PASS: native magic chat has all three localized markers and individual dice expected by Dice Improvements Paradox listener.');
})().catch(err=>{console.error(err);process.exitCode=1;});