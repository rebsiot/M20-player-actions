'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'scripts/player-actions.js'), 'utf8');
const stylesheet = fs.readFileSync(path.join(root, 'styles/player-actions.css'), 'utf8');
const registered = new Map();
const saved = new Map();
const dialogs = [];
const hooks = {};
const errors = [];
const actorWrites = [];
const game = {
  system: {id: 'worldofdarkness'},
  user: {isGM:false, character:null},
  settings: {
    register: (_mod, key, cfg) => {registered.set(key,cfg); if (!saved.has(key)) saved.set(key,cfg.default);},
    get: (_mod, key) => saved.get(key),
    set: async (_mod,key,value) => {saved.set(key,value);return value;}
  },
  modules: {get:()=>({api:{}})},
  keybindings: {register:()=>{}},
  macros: {find:()=>null},
  packs:{get:()=>null},
  actors: {contents:[]}
};
const FakeRoot = () => {
  const page = {innerHTML:'',querySelector:()=>({focus:()=>{}})};
  const handlers = {};
  return {page,handlers,addEventListener:(name,fn)=>handlers[name]=fn,
    querySelector:(sel)=>sel==='[data-wpa-tutorial-page]'?page:null};
};
class DialogV2 {
  constructor(options){
    this.options=options;
    this.root=FakeRoot();
    this.element={querySelector:(sel)=>sel==='.wpa-tutorial'?this.root:null};
    this.rendered=false;
    dialogs.push(this);
  }
  async render(){this.rendered=true;return this;}
  async close(){this.rendered=false;return this;}
  bringToFront(){this.broughtToFront=true;}
}
const context={
  game, foundry:{applications:{api:{DialogV2}},utils:{escapeHTML:String}},
  Hooks:{once:(name,fn)=>hooks[name]=fn,on:()=>{}},
  canvas:{tokens:{controlled:[]}},
  ui:{notifications:{error:e=>errors.push(e),warn:e=>errors.push(e)}},
  CONST:{KEYBINDING_PRECEDENCE:{NORMAL:1}},
  document:{querySelector:()=>null},
  console
};
vm.runInNewContext(source+`\nglobalThis.__tutorial={open:openTutorial,offer:offerFirstLoginTutorial,pages:TUTORIAL_STEPS,pageHTML:tutorialPageHTML};`,context);
const action = async (dialog,name) => {
  const button={disabled:false,dataset:{wpaTutorialAction:name}};
  await dialog.root.handlers.click({target:{closest:sel=>sel==='[data-wpa-tutorial-action]'?button:null}});
  return button;
};
(async()=>{
  hooks.init();
  assert.equal(registered.get('tutorialDontShowAgain').scope,'user');
  assert.equal(registered.get('tutorialDontShowAgain').type.name,'Boolean');
  assert.equal(registered.get('tutorialDontShowAgain').default,false);
  assert.equal(saved.get('tutorialDontShowAgain'),false);
  assert.match(source,/data-wpa-open-tutorial/g,'both UIs advertise manual help');
  assert.match(stylesheet,/\.wpa-tutorial-navigation/);
  assert.match(context.__tutorial.pageHTML(3),/Don't show again/);
  assert.equal(context.__tutorial.pages.length,4);
  hooks.ready();
  // The automatic prompt occurs after ready, without needing an assigned Actor.
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(dialogs.length,1,'one prompt on first login');
  assert.match(dialogs[0].options.content,/Step 1 of 4/);
  assert.match(dialogs[0].options.content,/Basic Actions/);
  assert.equal(saved.get('tutorialDontShowAgain'),false,'merely opening it never opts out');
  // Reopening the same visible window does not create a second copy.
  await context.__tutorial.open();
  assert.equal(dialogs.length,1);
  assert.ok(dialogs[0].broughtToFront);
  // Closing early without opting out prompts again next login.
  await dialogs[0].close();
  context.__tutorial.offer();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(dialogs.length,2);
  const dialog=dialogs[1];
  for (let index=1;index<4;index++) {
    await action(dialog,'next');
    assert.match(dialog.root.page.innerHTML,new RegExp(`Step ${index+1} of 4`));
  }
  assert.match(dialog.root.page.innerHTML,/Macro Compendium/);
  assert.equal((dialog.root.page.innerHTML.match(/data-wpa-tutorial-choice=/g)||[]).length,4,'three hotbar checkboxes plus compendium checkbox');
  assert.doesNotMatch(dialog.root.page.innerHTML,/data-wpa-tutorial-choice=\"[^\"]+\" checked/,'all choices unchecked by default');
  assert.match(dialog.root.page.innerHTML,/data-wpa-tutorial-action=\"finish\"/);
  const button = await action(dialog,'dismiss');
  assert.equal(button.disabled,true,'opt-out button blocks double-submission');
  assert.equal(saved.get('tutorialDontShowAgain'),true);
  assert.equal(dialog.rendered,false,'opt-out closes the tutorial');
  context.__tutorial.offer();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(dialogs.length,2,'dismissed user does not receive another automatic prompt');
  await context.__tutorial.open();
  assert.equal(dialogs.length,3,'manual Help works even after opt-out');
  assert.equal(saved.get('tutorialDontShowAgain'),true,'manual Help does not reset preference');
  assert.equal(actorWrites.length,0);
  assert.deepEqual(errors,[]);
  console.log('PASS: auto first login, four-step navigation, per-user opt-out, early close reoffers, manual reopen, no Actor writes');
})().catch(e=>{console.error(e);process.exitCode=1});
