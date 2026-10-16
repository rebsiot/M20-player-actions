const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname,'../scripts/player-actions.js'),'utf8');
const hooks={},macros=[];let assigned=0;
const game={system:{id:'worldofdarkness'},settings:{register:()=>{},get:()=>'',set:async()=>{}},
  user:{isGM:true,assignHotbarMacro(){assigned++;}},modules:{get:()=>({api:null})},
  macros:{find:fn=>macros.find(fn)},keybindings:{register:()=>{}}};
const ctx={Hooks:{once:(event,fn)=>hooks[event]=fn,on:()=>{}},game,
  Macro:{create:async data=>{const m={...data,getFlag:(ns,k)=>data.flags?.[ns]?.[k]};macros.push(m);return m;}},
  canvas:{tokens:{controlled:[]}},ui:{actors:null,notifications:{}},document:{querySelector:()=>null},
  foundry:{utils:{escapeHTML:String}},
  CONST:{DOCUMENT_OWNERSHIP_LEVELS:{OBSERVER:2},KEYBINDING_PRECEDENCE:{NORMAL:1}},console};
(async()=>{
  vm.runInNewContext(src,ctx);hooks.init();hooks.ready();await new Promise(setImmediate);
  assert.equal(macros.length,3,'exactly one optional world launcher for Magick, Basic Actions and targeted Combat');
  const mage=macros.find(x=>x.name==='Use Magick');
  const basic=macros.find(x=>x.name==='Player Basic Actions');
  const combat=macros.find(x=>x.name==='Player Combat (Targeted)');
  assert.ok(mage&&basic&&combat,'three existing/optional world launchers are present');
  assert.match(mage.command,/api\.openPanel\(\)/);
  assert.match(basic.command,/api\.openBasicActions\(\)/);
  assert.match(combat.command,/api\.openStandardAttackShortcut\(\)/);
  assert.equal(basic.flags['wod20-player-actions'].basicLauncher,true);
  assert.equal(mage.flags['wod20-player-actions'].launcher,true);
  assert.equal(combat.flags['wod20-player-actions'].combatLauncher,true);
  assert.equal(macros.every(m=>m.ownership.default===2),true,'players can use the macros');
  assert.equal(assigned,0,'never auto-populate hotbars');
  hooks.ready();await new Promise(setImmediate);
  assert.equal(macros.length,3,'reload must not duplicate launchers');
  game.user.isGM=false;hooks.ready();await new Promise(setImmediate);
  assert.equal(macros.length,3,'player cannot create a world Macro');
  console.log('PASS: three optional launchers are idempotent, player-readable and never auto-assigned');
})().catch(e=>{console.error(e);process.exitCode=1});
