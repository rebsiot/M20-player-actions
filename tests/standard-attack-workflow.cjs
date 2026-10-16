/** Standard Attack is a strict adapter to the separately owned STL Combat Workflow v0.1.4. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'..','scripts/player-actions.js'),'utf8');
const hooks = {};
const warnings = [], errors = [];
let workflowCalls = [], dialogCalls = 0, combatActive = true;
const assigned = {uuid:'Actor.Eli',id:'Eli',type:'PC',name:'Eli',isOwner:true,
  system:{settings:{splat:'mage'}},items:[]};
const unlinked = {uuid:'Scene.docks.Token.abc.Actor.synthetic',type:'PC',id:'Synthetic',
  name:'Unlinked NPC Mage',isOwner:true,system:{settings:{splat:'mage'}},items:[]};
const defender = {actor:{uuid:'Actor.enemy'},document:{uuid:'Scene.docks.Token.enemy'},visible:true};
const correctWorkflow = {
  open:async options=>{workflowCalls.push(options);return {started:true};}
};
const combatModule = {active:true,api:correctWorkflow};
const playerModule = {active:true,api:null};
const modules = new Map([['stl-combat-workflow',combatModule],['wod20-player-actions',playerModule]]);
const game = {system:{id:'worldofdarkness'},modules:{get:id=>modules.get(id)},
  settings:{register:()=>{},get:()=>'',set:async()=>{}},
  user:{isGM:false,character:assigned,targets:new Set()},
  keybindings:{register:()=>{}},actors:[assigned]};
const canvas = {tokens:{controlled:[]}};
const ctx={game,canvas,Hooks:{once:(n,fn)=>hooks[n]=fn,on:()=>{}},
  foundry:{utils:{escapeHTML:String},applications:{api:{DialogV2:{input:async()=>{dialogCalls++;return null;}}}}},
  ui:{notifications:{warn:s=>warnings.push(s),error:s=>errors.push(s)}},
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},document:{querySelector:()=>null},
  console,fromUuidSync:()=>null};
vm.runInNewContext(source+`
;globalThis.__standard=openStandardAttackShortcut;
;globalThis.__definitions=catalogMacroDefinitions;
`,ctx);
(async()=>{
  // Calling a compendium macro uses the public Player Actions API.
  hooks.init();hooks.ready();
  const definitions=ctx.__definitions();
  assert.equal(definitions.length,49);
  const entry=definitions.find(d=>d.id==='standard-attack');
  assert.ok(entry);
  assert.match(entry.name,/^Standard Attack/);
  assert.match(entry.command,/api\.openStandardAttackShortcut\(\)/);

  // User cannot launch a standard attack until exactly one defender is targeted.
  await ctx.__standard();
  assert.match(warnings.at(-1),/exactly one targeted defender/i);
  assert.equal(workflowCalls.length,0);
  game.user.targets=new Set([defender,{actor:assigned,document:{uuid:'Scene.docks.Token.extra'}}]);
  await ctx.__standard();
  assert.equal(workflowCalls.length,0);

  // The module must be enabled; no fallback to a generic roll or WoD20 weapon dialog.
  game.user.targets=new Set([defender]);
  combatModule.active=false;
  await ctx.__standard();
  assert.match(warnings.at(-1),/STL Combat Workflow v0\.1\.4/);
  assert.equal(workflowCalls.length,0);
  combatModule.active=true;combatModule.api=null;
  delete game.stlCombatWorkflow;
  await ctx.__standard();
  assert.equal(workflowCalls.length,0);
  assert.equal(dialogCalls,0);
  combatModule.api=correctWorkflow;

  // The exact actor object, not a UUID or selected-token guess, is supplied.
  const result=await ctx.__standard();
  assert.equal(result.started,true);
  assert.equal(workflowCalls.length,1);
  assert.equal(workflowCalls[0].attackerActor,assigned);
  assert.equal(Object.keys(workflowCalls[0]).length,1);

  // GM selected synthetic/unlinked Token Actor takes priority over assigned.
  game.user.isGM=true;
  canvas.tokens.controlled=[{actor:unlinked,document:{uuid:'Scene.docks.Token.abc'}}];
  await ctx.__standard();
  assert.equal(workflowCalls[1].attackerActor,unlinked);
  assert.equal(dialogCalls,0);

  // Ambiguous attacker token selection never silently launches a different Actor.
  canvas.tokens.controlled.push({actor:assigned,document:{uuid:'Scene.docks.Token.extra'}});
  await ctx.__standard();
  assert.equal(workflowCalls.length,2);
  assert.match(warnings.at(-1),/Select one token/i);

  // A thrown exception from Combat Workflow remains visible, with no local dice roll.
  canvas.tokens.controlled=[{actor:unlinked,document:{uuid:'Scene.docks.Token.abc'}}];
  combatModule.api={open:async()=>{throw new Error('Cannot start workflow');}};
  await ctx.__standard();
  assert.match(errors.at(-1),/Cannot start workflow/);
  assert.equal(workflowCalls.length,2);
  assert.doesNotMatch(source,/game\.wod20CombatToolkit|wod20-combat-toolkit/);
  console.log('PASS: v0.1.4 Combat Workflow open({attackerActor}), required single target, dependency warning, GM unlinked-token identity and zero fallback rolls');
})().catch(e=>{console.error(e);process.exitCode=1;});
