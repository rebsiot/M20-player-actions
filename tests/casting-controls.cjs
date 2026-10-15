/**
 * Player Magick v0.1.8 UI and Focus metadata contract tests.
 * This is a static/mock test; real Foundry v14 verification remains required.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'player-actions.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles', 'player-actions.css'), 'utf8');
const dialogs=[];
const actor = {
  id:'mage18',uuid:'Actor.mage18',name:'Eli Smith',type:'PC',isOwner:true,
  system:{settings:{splat:'mage'}},
  items:[
    {id:'a',type:'Advantage',name:'Arete',system:{id:'arete',permanent:3}},
    {id:'q',type:'Advantage',name:'Quintessence',system:{id:'quintessence',temporary:2},async update(o){this.system.temporary=o['system.temporary'];}},
    {id:'m',type:'Sphere',name:'Matter',system:{id:'matter',value:2}},
    {id:'s',type:'Sphere',name:'Spirit',system:{id:'spirit',value:2}}
  ]
};
for(const it of actor.items)it.parent=actor;
class FakeDialog {constructor(o){this.o=o;dialogs.push(o);this.form=null;this.element=null;} async render(){}}
const hooks={};
const mod={};
const ctx={
  Hooks:{once:(k,cb)=>hooks[k]=cb,on:(k,cb)=>hooks[k]=cb},
  game:{system:{id:'worldofdarkness'},user:{isGM:false,character:actor},settings:{register:()=>{},get:()=>'',set:async()=>{}},modules:{get:()=>mod},keybindings:{register:()=>{}},i18n:{localize:(k)=>({'wod.spheres.coincidentalspell':'Coincidental spell'})[k]||k}},
  ui:{notifications:{warn:()=>{},error:(s)=>{throw Error(s);}}},canvas:{tokens:{controlled:[]}},
  foundry:{utils:{escapeHTML:s=>String(s)},applications:{api:{DialogV2:FakeDialog}}},
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}}, HTMLElement:class {}, document:{querySelector:()=>null},
  console
};
vm.runInNewContext(source+'\n;globalThis.__testCast=performMageCast;globalThis.__injectDice=d=>wodDice=d;',ctx);
hooks.init();hooks.ready();
(async()=>{
  await mod.api.guidedCast(actor);
  const html=dialogs.at(-1).content;
  assert.match(html,/class="wpa-cast-summary"/);
  assert.match(html,/class="wpa-caster"/);
  assert.match(html,/class="wpa-caster-select"/);
  assert.match(html,/data-current-difficulty aria-live="polite"/);
  assert.match(html,/Coincidental \(\+3 to highest Sphere\)/);
  assert.doesNotMatch(html,/class="wpa-cast-change"/);
  assert.equal((html.match(/class="wpa-cast-summary"/g)||[]).length,1,'one compact summary');
  const reality=html.indexOf('name="reality"');
  const quint=html.indexOf('name="quint"');
  const modifier=html.indexOf('name="modifier"');
  const focus=html.indexOf('name="useFocus"');
  const willpower=html.indexOf('name="willpower"');
  const ritual=html.indexOf('name="ritual"');
  const desc=html.indexOf('name="effect"');
  const rules=html.indexOf('class="wpa-cast-help"');
  assert.ok([reality,quint,modifier,focus,willpower,ritual,desc,rules].every(v=>v>=0));
  assert.ok(reality<quint && quint<modifier && modifier<focus && focus<willpower && willpower<ritual && ritual<desc && desc<rules,'ordered controls');
  assert.match(html,/class="wpa-cast-settings"/);
  assert.equal((html.match(/class="wpa-stepper"/g)||[]).length,2);
  assert.match(html,/data-min="0" data-max="2"/,'quint limited by actual resource and 3 cap');
  assert.match(html,/data-min="-3" data-max="3"/,'GM modifier -3 to 3');
  assert.match(html,/aria-label="Spend less Quintessence"/);
  assert.match(html,/aria-label="Increase GM modifier"/);
  assert.doesNotMatch(html,/class="wpa-cast-help"[^>]*open\b/,'rules initially collapsed');
  assert.match(css,/grid-template-columns: minmax\(245px, 2fr\) minmax\(155px, 1fr\) minmax\(155px, 1fr\)/,'three-column controls on wide screens');
  assert.match(css,/wpa-cast-summary \{\s*display: flex/,'single compact header');
  const captured=[];
  ctx.__injectDice({DiceRollContainer:class{constructor(a){this.actor=a;}},DiceRoller:async d=>{captured.push(d);return 3;}});
  await ctx.__testCast(actor,null,{'sphere.Matter':2,reality:'coincidental',modifier:0,quint:0,useFocus:'on'});
  assert.equal(captured.length,1,'one native cast');
  assert.ok(captured[0].extraInfo.includes('Focus used'),'focus recorded in native chat card');
  assert.equal(captured[0].difficulty,5,'focus not an unapproved modifier');
  assert.ok(captured[0].extraInfo.includes('Coincidental spell'),'Paradox detection localized marker kept');
  await ctx.__testCast(actor,null,{'sphere.Spirit':2,reality:'coincidental',modifier:-2,quint:1});
  assert.equal(captured.length,2,'one native cast per action');
  assert.equal(captured[1].difficulty,3,'existing clamped difficulty math');
  assert.ok(!captured[1].extraInfo.includes('Focus used'),'focus not claimed when unchecked');
  assert.equal(actor.items[1].system.temporary,1,'Quintessence charged once, after roll');
  console.log('PASS: compact header; three aligned controls; rocker limits and labels; toggle order; collapsed rules; focus note without dice changes.');
})().catch(e=>{console.error(e);process.exitCode=1;});