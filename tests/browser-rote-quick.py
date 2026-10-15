"""Browser fixture for compact Rote dialogs, using actual module HTML, CSS and input handlers."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'scripts/player-actions.js').read_text()
css=(ROOT/'styles/player-actions.css').read_text()
setup=r'''() => {
  const module={api:null};
  window.__test={module,dialogs:[]};
  const hooks={};
  window.Hooks={once:(n,cb)=>hooks[n]=cb,on:(n,cb)=>hooks[n]=cb};
  const actor={id:'eli',uuid:'Actor.eli',name:'Eli Smith',type:'PC',isOwner:true,
    system:{settings:{splat:'mage'}},items:[
      {id:'ar',type:'Advantage',name:'Arete',system:{id:'arete',permanent:3}},
      {id:'q',type:'Advantage',name:'Quintessence',system:{id:'quintessence',temporary:3}},
      {id:'life',type:'Sphere',name:'Life',system:{id:'life',value:3}},
      {id:'spirit',type:'Sphere',name:'Spirit',system:{id:'spirit',value:2}},
      {id:'rote',type:'Rote',name:'Healing Touch',system:{spheres:{life:3,spirit:2}}}
    ]};
  actor.items.forEach(i=>i.parent=actor);
  actor.items.get=id=>actor.items.find(i=>i.id===id);
  window.__test.actor=actor;
  window.HooksOnce=hooks;
  window.game={system:{id:'worldofdarkness'},modules:{get:()=>module},
    user:{isGM:false,character:actor},actors:{contents:[actor]},
    settings:{register:()=>{},get:()=>'',set:async()=>{}},keybindings:{register:()=>{}},
    i18n:{localize:k=>k}};
  window.canvas={tokens:{controlled:[]}};
  window.fromUuidSync=u=>u===actor.uuid?actor:null;
  window.CONST={KEYBINDING_PRECEDENCE:{NORMAL:1}};
  window.ui={notifications:{warn:s=>console.warn(s),error:s=>console.error(s)}};
  window.foundry={utils:{escapeHTML:s=>String(s).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]))},
    applications:{api:{DialogV2:class {
      constructor(options){this.options=options;window.__test.dialogs.push(this);}
      async render(){
        this.element=document.createElement('article');this.element.className='fake-foundry-dialog';
        this.element.style.width=this.options.position.width+'px';
        const heading=document.createElement('header');heading.textContent=this.options.window.title;this.element.append(heading);
        this.form=document.createElement('form');this.form.innerHTML=this.options.content;this.element.append(this.form);
        const footer=document.createElement('footer');footer.textContent=this.options.buttons.map(b=>b.label).join('     ');this.element.append(footer);
        document.body.append(this.element);
      }
      async close(){this.element?.remove();}
    }}}};
  window.__runHooks=()=>{hooks.init?.();hooks.ready?.();};
}'''
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  for width in (1440,820,430):
    page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
    page.set_content('<!doctype html><html><head><meta charset="utf-8"><style>'+'''body{background:#101823;color:#e7edf7;font-family:Arial,sans-serif;margin:14px;display:flex;justify-content:center;align-items:flex-start}.fake-foundry-dialog{box-sizing:border-box;border-radius:8px;border:1px solid #3b4659;background:#171c27;padding:0;box-shadow:0 12px 40px #0007}.fake-foundry-dialog>header{padding:11px 14px;font-size:15px;font-weight:700;border-bottom:1px solid #4b5260}.fake-foundry-dialog>form{padding:5px}.fake-foundry-dialog>footer{border-top:1px solid #4b5260;padding:13px;text-align:right;color:#c6d2ea}'''+css+'</style></head><body></body></html>')
    page.evaluate(setup)
    page.add_script_tag(content=js)
    page.evaluate('window.__runHooks()')
    page.evaluate("game.modules.get('wod20-player-actions').api.execute('Actor.eli','rote')")
    assert page.locator('.wpa-rote-quick').count()==1
    assert page.locator('.wpa-spheres').count()==0,'Rote quick cast has no full Sphere grid'
    assert page.locator('.wpa-rote-chip').all_text_contents()==['Life 3','Spirit 2']
    assert page.locator('[data-current-difficulty]').inner_text()=='6'
    assert page.locator('[data-highest-sphere]').inner_text()=='3'
    assert '3 remaining' in page.locator('[data-quint-remaining]').inner_text()
    qu=page.locator('.wpa-stepper').first
    qu.locator('[data-step="1"]').click()
    assert page.locator('[data-current-difficulty]').inner_text()=='5'
    assert page.locator('[data-quint-spent]').inner_text()=='−1'
    assert '2 remaining' in page.locator('[data-quint-remaining]').inner_text()
    page.locator('input[name="willpower"]').check()
    assert page.locator('[data-willpower-preview]').inner_text()=='+1 success'
    page.locator('input[name="useFocus"]').check()
    assert 'Use Focus' in page.locator('.wpa-check-options').inner_text()
    form=page.evaluate('Object.fromEntries(new FormData(document.querySelector(".fake-foundry-dialog form")).entries())')
    assert form['sphere.Life']=='3' and form['sphere.Spirit']=='2'
    assert form['quint']=='1' and form['willpower']=='on' and form['useFocus']=='on'
    assert page.locator('.wpa-cast-help').first.evaluate('(e)=>e.open') is False
    metrics=page.evaluate('''() => ({overflow:[...document.querySelectorAll('.wpa-cast, .wpa-cast-summary, .wpa-roll-metrics, .wpa-cast-settings, .wpa-stepper')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)})''')
    assert metrics['overflow']==[],(width,metrics)
    (ROOT.parent/f'preview-rote-{width}.png').parent.mkdir(parents=True,exist_ok=True)
    page.screenshot(path=str(ROOT.parent/f'preview-rote-{width}.png'),full_page=True)
    # Confirm advanced button is exposed and gives a full Sphere editor.
    advanced=page.evaluate('''async () => {let d=window.__test.dialogs.at(-1);await d.options.submit(d.options.buttons.find(b=>b.action==='advanced').callback());return window.__test.dialogs.at(-1).options.content.includes('class="wpa-spheres"');}''')
    assert advanced,'Advanced option opens the full Sphere picker'
    print('Rote quick cast width',width, 'overflow:',metrics['overflow'])
    page.close()
  browser.close()
print('PASS: compact Rote browser test at 1440, 820, 430 px; prefilled Spheres, roll metrics, resource rockers, Advanced fallback.')
