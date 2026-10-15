"""Browser fixture: exercises the actual HTML/CSS and delegated event handlers without Foundry."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import tempfile
import shutil
ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'scripts/player-actions.js').read_text()
css=(ROOT/'styles/player-actions.css').read_text()
setup_js=r'''() => {
  const module={api:null};
  window.__test={module,dialogs:[],settings:{}};
  const hooks={};
  window.Hooks={once:(n,cb)=>hooks[n]=cb,on:(n,cb)=>hooks[n]=cb};
  window.game={
    system:{id:'worldofdarkness'},modules:{get:()=>module},
    settings:{register:()=>{},get:(m,k)=>window.__test.settings[`${m}.${k}`]||'',set:async(m,k,v)=>{window.__test.settings[`${m}.${k}`]=v;}},
    keybindings:{register:()=>{}},
    user:{isGM:false,character:null},
    i18n:{localize:k=>k}
  };
  window.ui={notifications:{warn:s=>console.warn(s),error:s=>console.error(s)}};
  window.canvas={tokens:{controlled:[]}};
  window.CONST={KEYBINDING_PRECEDENCE:{NORMAL:1}};
  window.foundry={
    utils:{escapeHTML:s=>String(s).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]))},
    applications:{api:{DialogV2:class {
      constructor(options){this.options=options;window.__test.dialogs.push(this);}
      async render(){
        this.element=document.createElement('article');
        this.element.className='fake-foundry-dialog';
        this.element.style.width=this.options.position.width+'px';
        const heading=document.createElement('header');heading.textContent=this.options.window.title;
        this.element.append(heading);
        this.form=document.createElement('form');
        this.form.innerHTML=this.options.content;
        this.element.append(this.form);
        const footer=document.createElement('footer'); footer.textContent='Cancel                                         Roll Arete';
        this.element.append(footer);
        document.body.append(this.element);
      }
      async close(){this.element?.remove();}
    }}}
  };
  window.__runHooks=()=>{hooks.init?.();hooks.ready?.();};
}'''
actor_js=r'''() => {
  const actor={id:'eli',uuid:'Actor.eli',name:'Eli Smith',type:'PC',isOwner:true,
  system:{settings:{splat:'mage'}}, items:[
    {id:'arete',type:'Advantage',name:'Arete',system:{id:'arete',permanent:3}},
    {id:'quint',type:'Advantage',name:'Quintessence',system:{id:'quintessence',temporary:2}},
    {id:'matter',type:'Sphere',name:'Matter',system:{id:'matter',value:2}},
    {id:'spirit',type:'Sphere',name:'Spirit',system:{id:'spirit',value:2}},
    {id:'life',type:'Sphere',name:'Life',system:{id:'life',value:3}},
    {id:'mind',type:'Sphere',name:'Mind',system:{id:'mind',value:2}}
  ]}; actor.items.forEach(i=>i.parent=actor);
  const secondary={id:'clo',uuid:'Actor.clo',name:'Chloe Hernandez',type:'PC',isOwner:true,
    system:{settings:{splat:'mage'}},items:[
      {id:'ar2',type:'Advantage',name:'Arete',system:{id:'arete',permanent:4}},
      {id:'q2',type:'Advantage',name:'Quintessence',system:{id:'quintessence',temporary:3}},
      {id:'time',type:'Sphere',name:'Time',system:{id:'time',value:3}}
    ]};secondary.items.forEach(i=>i.parent=secondary);
  const unowned={...secondary,id:'hidden',uuid:'Actor.hidden',name:'Hidden Mage',isOwner:false};
  const vampire={...secondary,id:'vamp',uuid:'Actor.vamp',name:'Accessible Vampire',system:{settings:{splat:'vampire'}}};
  game.user.character=actor;
  game.actors={contents:[actor,secondary,unowned,vampire]};
  window.__test.actor=actor;
  return game.modules.get('wod20-player-actions').api.guidedCast(actor);
}'''

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
    for width in (1440,820,430):
        page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
        page.set_content('<!doctype html><html><head><meta charset="utf-8"><style>'+'''body{background:#101823;color:#e7edf7;font-family:Arial,sans-serif;margin:14px;display:flex;justify-content:center;align-items:flex-start}.fake-foundry-dialog{box-sizing:border-box;border-radius:8px;border:1px solid #3b4659;background:#171c27;padding:0;box-shadow:0 12px 40px #0007}.fake-foundry-dialog>header{padding:11px 14px;font-size:15px;font-weight:700;border-bottom:1px solid #4b5260}.fake-foundry-dialog>form{padding:5px}.fake-foundry-dialog>footer{border-top:1px solid #4b5260;padding:13px;text-align:right;color:#c6d2ea}''' + css + '</style></head><body></body></html>')
        page.evaluate(setup_js)
        page.add_script_tag(content=source)
        page.evaluate('window.__runHooks()')
        page.evaluate(actor_js)
        summary=page.locator('.wpa-cast-summary')
        picker=page.locator('.wpa-caster-select')
        assert picker.input_value()=='Actor.eli'
        assert picker.locator('option').all_text_contents()==['Chloe Hernandez','Eli Smith']
        assert 'highest Sphere' in page.locator('select[name="reality"] option[value="coincidental"]').inner_text()
        difficulty=page.locator('[data-current-difficulty]')
        assert difficulty.inner_text()=='—','no Sphere means no valid difficulty yet'
        before=page.locator('.wpa-stepper output').all_text_contents()
        assert before==['0','0'],(width,before)
        qu=page.locator('.wpa-stepper').nth(0)
        gm=page.locator('.wpa-stepper').nth(1)
        assert qu.locator('button[data-step="-1"]').is_disabled()
        assert gm.locator('button[data-step="-1"]').is_enabled()
        qu.locator('button[data-step="1"]').click()
        qu.locator('button[data-step="1"]').click()
        assert qu.locator('output').inner_text()=='2'
        assert qu.locator('button[data-step="1"]').is_disabled()
        gm.locator('button[data-step="1"]').click()
        assert gm.locator('output').inner_text()=='+1'
        for _ in range(4): gm.locator('button[data-step="-1"]').click()
        assert gm.locator('output').inner_text()=='-3'
        assert gm.locator('button[data-step="-1"]').is_disabled()
        page.locator('.wpa-sphere[data-sphere="Matter"] button[data-level="2"]').click()
        assert difficulty.inner_text()=='3','top difficulty tracks Sphere, 2 Quint and -3 GM modifier'
        assert 'Difficulty' not in page.locator('.wpa-preview').inner_text(),'no duplicated difficulty preview'
        page.locator('select[name="reality"]').select_option('witnessed')
        assert difficulty.inner_text()=='3','clamp remains 3 at modifier -3, Quint -2 and witnessed +5'
        gm.locator('button[data-step="1"]').click()
        assert difficulty.inner_text()=='3'
        gm.locator('button[data-step="1"]').click()
        assert difficulty.inner_text()=='4','live difficulty increases with GM modifier'
        gm.locator('button[data-step="-1"]').click()
        gm.locator('button[data-step="-1"]').click()
        page.locator('input[name="useFocus"]').check()
        fd=page.evaluate('Object.fromEntries(new FormData(document.querySelector("form")).entries())')
        assert fd['quint']=='2' and fd['modifier']=='-3' and fd['useFocus']=='on',(width,fd)
        assert not page.locator('.wpa-cast-help').evaluate('(e)=>e.open')
        metrics=page.evaluate('''() => {
         const root=document.querySelector('.wpa-cast'), settings=document.querySelector('.wpa-cast-settings'), summary=document.querySelector('.wpa-cast-summary');
         const overflow=[...document.querySelectorAll('.wpa-cast, .wpa-cast-summary, .wpa-cast-settings, .wpa-stepper')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({className:e.className,width:e.clientWidth,scrollWidth:e.scrollWidth}));
         return {rootWidth:root.clientWidth,headerHeight:summary.getBoundingClientRect().height,controlsHeight:settings.getBoundingClientRect().height,overflow};
        }''')
        assert metrics['overflow']==[],(width,metrics)
        print(width,metrics)
        picker.select_option('Actor.clo')
        assert page.locator('.wpa-caster-select').input_value()=='Actor.clo','inline character switch reopens with chosen Mage'
        assert 'Chloe Hernandez' in page.locator('.wpa-caster-select').locator('option:checked').inner_text()
        assert page.locator('.wpa-stat').first.inner_text().lower().find('4')>=0,'Arete switches with Mage'
        assert page.locator('.wpa-sphere[data-sphere="Time"]').count()==1
        assert page.locator('.wpa-sphere[data-sphere="Matter"]').count()==0,'old Spheres are not carried'
        saved=page.evaluate('window.__test.settings["wod20-player-actions.preferredActorUuid"]')
        assert saved=='Actor.clo','selection saved for subsequent openings'
        # Restore neutral values for an uncluttered visual screenshot.
        page.reload() if False else None
        page.locator('.wpa-cast').evaluate('(e)=>e.scrollTop=0')
        page.screenshot(path=str(Path(tempfile.gettempdir()) / f'player-magick-{width}.png'),full_page=True)
        page.close()
    browser.close()
print('PASS: actual browser rendering, form controls, rocker bounds, focus, preview, no horizontal overflow at three sizes.')