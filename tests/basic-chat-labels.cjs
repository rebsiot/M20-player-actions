const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'player-actions.js'), 'utf8');
const rolls = [];
let actorApiCalls = 0, ignoredPain = false;
const alertness = {id:'a1',name:'Alertness',type:'Ability',system:{id:'alertness',label:'ability.alertness',value:4,speciality:'Sharp Hearing',settings:{isvisible:true}}};
const investigate = {id:'a2',name:'Investigation',type:'Ability',system:{id:'investigation',label:'ability.investigation',value:1,settings:{isvisible:true}}};
const actor = {
  id:'testMage',uuid:'Actor.testMage',name:'Marlowe',type:'PC',isOwner:true,
  system:{attributes:{perception:{total:4,value:4,isvisible:true}},health:{damage:{woundpenalty:-2}}},
  items:[alertness,investigate],
  api:{rollAbility:async()=>{actorApiCalls++;},rollAttribute:async()=>{actorApiCalls++;}}
};
const mocks = {
  game:{user:{isGM:false,character:actor},system:{id:'worldofdarkness'},i18n:{localize:key=>({'attributes.perception':'Perception','ability.alertness':'Alertness','ability.investigation':'Investigation'}[key]||key)},settings:{register:()=>{}},keybindings:{register:()=>{}}},
  CONFIG:{worldofdarkness:{attributeSettings:'20th',attributes20:{perception:'attributes.perception'}}},
  Hooks:{once:()=>{},on:()=>{}},ui:{notifications:{warn:()=>{},error:()=>{}}},canvas:{tokens:{controlled:[]}},
  foundry:{utils:{escapeHTML:s=>String(s)}},document:{querySelector:()=>null},CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},HTMLElement:class{},console
};
vm.runInNewContext(src+`
;globalThis.__nativeBasic={perform:performBasicAction, traits:basicActionTraits, tile:basicTileHTML};
;globalThis.__injectDice=v=>wodDice=v;
;globalThis.__injectCombatHelper=v=>basicCombatHelper=v;`,mocks);
mocks.__injectDice({DiceRollContainer:class {constructor(a){this.actor=a;this.extraInfo=[];}},DiceRoller:async roll=>{rolls.push(roll);return 3;}});
mocks.__injectCombatHelper({ignoresPain:()=>ignoredPain});
(async()=>{
 const action={id:'notice',label:'Notice',attr:'perception',ability:'Alertness',icon:'binoculars'};
 assert.equal(await mocks.__nativeBasic.perform(actor,action,6,true),3);
 assert.equal(rolls.length,1);
 let r=rolls[0];
 assert.equal(r.action,'Notice','native chat heading matches button label');
 assert.equal(r.attribute,'perception');
 assert.equal(r.ability,'a1');
 assert.equal(r.origin,'general');
 assert.equal(r.numDices,8);
 assert.equal(r.woundpenalty,-2,'wound penalty preserved');
 assert.equal(r.speciality,true,'WoD20 specialities preserved');
 assert.equal(r.specialityText,'Sharp Hearing');
 assert.equal(r.usewillpower,true,'native Willpower preserved');
 assert.equal(r.difficulty,6);
 assert.deepEqual(Array.from(r.dicetext),['Perception (4)','Alertness (4)'],'native chat details preserve traits');
 assert.equal(actorApiCalls,0,'no extra Actor API roll or duplicate chat card');
 ignoredPain=true;
 await mocks.__nativeBasic.perform(actor,action,7,false);
 assert.equal(rolls[1].woundpenalty,0,'ignore-pain state preserved');
 assert.equal(rolls[1].usewillpower,false);
 const search={id:'search',label:'Search',attr:'perception',ability:'Investigation',icon:'magnifying-glass'};
 await mocks.__nativeBasic.perform(actor,search,6,false);
 r=rolls[2];
 assert.equal(r.action,'Search');
 assert.equal(r.numDices,5);
 assert.equal(r.ability,'a2');
 assert.equal(r.speciality,false);
 assert.deepEqual(Array.from(r.dicetext),['Perception (4)','Investigation (1)']);
 const custom={label:'Spot Trouble',attr:'perception',abilityId:'a1',icon:'eye-target'};
 await mocks.__nativeBasic.perform(actor,custom,8,false);
 assert.equal(rolls[3].action,'Spot Trouble','custom button name is native chat title');
 const attrOnly={label:'Spot Details',attr:'perception',abilityId:'',icon:'spy'};
 await mocks.__nativeBasic.perform(actor,attrOnly,6,false);
 assert.equal(rolls[4].action,'Spot Details');
 assert.equal(rolls[4].ability,'noselected');
 assert.equal(rolls[4].numDices,4);
 assert.deepEqual(Array.from(rolls[4].dicetext),['Perception (4)']);
 assert.equal(actorApiCalls,0);
 console.log('PASS: native WoD20 action chat titles, specialities, wounds/pain, Willpower, custom and attribute-only rolls');
})().catch(error=>{console.error(error);process.exitCode=1});
