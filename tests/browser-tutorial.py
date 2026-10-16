"""Static Chromium dialog fixture for Player Actions onboarding; not live Foundry."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil

ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'scripts/player-actions.js').read_text()
CSS=(ROOT/'styles/player-actions.css').read_text()
BASE_CSS='''
body {background:#121821;color:#e5ecf8;font:14px Arial,sans-serif;margin:20px;display:flex;justify-content:center;align-items:flex-start}
.fake-foundry-dialog {box-sizing:border-box;flex:none;max-width:calc(100vw - 40px);border-radius:8px;border:1px solid #516075;background:#1e293b;box-shadow:0 12px 32px #0007;overflow:hidden}
.fake-foundry-dialog>header {padding:12px 15px;font-size:16px;font-weight:bold;border-bottom:1px solid #53637d}
.fake-foundry-dialog>form {padding:5px}
.fake-foundry-dialog>footer {border-top:1px solid #53637d;padding:8px 12px;text-align:right}
.fake-foundry-dialog>footer button {width:auto;min-height:27px;padding:4px 9px}
'''
SETUP=r'''() => {
  const hooks={};
  const test=window.__tutorialTest={prefs:new Map(),dialogs:[],hooks};
  const module={api:{}};
  const actor={uuid:'Actor.eli',id:'eli',name:'Eli',type:'Mage',isOwner:true,system:{attributes:{perception:{value:3},dexterity:{value:3}}},items:[]};
  window.Hooks={once:(k,fn)=>hooks[k]=fn,on:()=>{}};
  window.game={system:{id:'worldofdarkness'},user:{isGM:false,character:actor},
    modules:{get:()=>module},actors:{contents:[actor]},
    settings:{register:(_,key,options)=>{if(!test.prefs.has(key))test.prefs.set(key,options.default);},
      get:(_,key)=>test.prefs.get(key),
      set:async(_,key,value)=>{test.prefs.set(key,value);return value;}},
    macros:{find:()=>null},keybindings:{register:()=>{}},packs:{get:()=>null}};
  window.canvas={tokens:{controlled:[]}};
  window.CONST={KEYBINDING_PRECEDENCE:{NORMAL:1}};
  window.ui={notifications:{warn:()=>{},error:()=>{}}};
  window.foundry={utils:{escapeHTML:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
    applications:{api:{DialogV2:class {
      constructor(options){this.options=options;this.rendered=false;test.dialogs.push(this);}
      async render(){
        this.element=document.createElement('article');this.element.className='fake-foundry-dialog';
        this.element.style.width=(this.options.position?.width||620)+'px';
        const header=document.createElement('header');header.textContent=this.options.window.title;this.element.append(header);
        const body=document.createElement('form');body.innerHTML=this.options.content;this.element.append(body);
        const footer=document.createElement('footer');const close=document.createElement('button');close.type='button';
        close.textContent=this.options.buttons?.[0]?.label||'Close';close.addEventListener('click',()=>this.close());footer.append(close);this.element.append(footer);
        document.body.append(this.element);this.rendered=true;return this;
      }
      async close(){this.element?.remove();this.rendered=false;return this;}
      bringToFront(){}
    }}}};
  test.module=module;test.actor=actor;
  test.resetDialogs=async()=>{for(const d of test.dialogs){if(d.rendered)await d.close();}};
  test.login=()=>hooks.ready();
  hooks.init=()=>{};
}'''

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
    for width in (1440,820,430):
        page=browser.new_page(viewport={'width':width,'height':830},device_scale_factor=1)
        page.set_content('<html><head><meta charset="utf-8"><style>'+BASE_CSS+CSS+'</style></head><body></body></html>')
        page.evaluate(SETUP)
        page.add_script_tag(content=SOURCE)
        page.evaluate('window.__tutorialTest.hooks.init()')
        page.evaluate('window.__tutorialTest.login()')
        page.locator('.wpa-tutorial').wait_for()
        assert page.locator('.wpa-tutorial-step').get_attribute('data-wpa-tutorial-step')=='0'
        assert page.locator('.wpa-tutorial-navigation button').count()==2
        page.locator('[data-wpa-tutorial-action="next"]').click()
        assert 'STEP 2 OF 4' in page.locator('.wpa-tutorial-count').inner_text()
        page.locator('[data-wpa-tutorial-action="next"]').click()
        assert 'STEP 3 OF 4' in page.locator('.wpa-tutorial-count').inner_text()
        page.locator('[data-wpa-tutorial-action="back"]').click()
        assert 'STEP 2 OF 4' in page.locator('.wpa-tutorial-count').inner_text()
        page.locator('[data-wpa-tutorial-action="next"]').click()
        page.locator('[data-wpa-tutorial-action="next"]').click()
        assert page.locator('[data-wpa-tutorial-action="dismiss"]').is_visible()
        assert page.locator('[data-wpa-tutorial-action="finish"]').is_visible()
        checkboxes=page.locator('[data-wpa-tutorial-choice]')
        assert checkboxes.count()==5 and all(not checkboxes.nth(i).is_checked() for i in range(5))
        page.locator('[data-wpa-tutorial-choice="basic"]').check()
        page.locator('[data-wpa-tutorial-choice="resources"]').check()
        page.locator('[data-wpa-tutorial-action="back"]').click()
        page.locator('[data-wpa-tutorial-action="next"]').click()
        assert page.locator('[data-wpa-tutorial-choice="basic"]').is_checked()
        assert page.locator('[data-wpa-tutorial-choice="resources"]').is_checked()
        page.locator('[data-wpa-tutorial-choice="basic"]').uncheck()
        page.locator('[data-wpa-tutorial-choice="resources"]').uncheck()
        dims=page.evaluate('''() => ({viewport:window.innerWidth,
            document:document.documentElement.scrollWidth,
            dialog:Math.round(document.querySelector('.fake-foundry-dialog').getBoundingClientRect().width),
            clipped:[...document.querySelectorAll('.wpa-tutorial,.wpa-tutorial-step,.wpa-tutorial-body')].filter(e=>e.scrollWidth>e.clientWidth+3).map(e=>e.className)})''')
        assert not dims['clipped'] and dims['document']<=dims['viewport']+1,(width,dims)
        page.screenshot(path=str(ROOT.parent/f'preview-first-login-tutorial-{width}.png'))
        page.locator('[data-wpa-tutorial-action="dismiss"]').click()
        assert page.evaluate('window.__tutorialTest.prefs.get("tutorialDontShowAgain")') is True
        assert page.locator('.wpa-tutorial').count()==0
        page.evaluate('window.__tutorialTest.login()')
        page.wait_for_timeout(40)
        assert page.locator('.wpa-tutorial').count()==0,'once dismissed, no automatic tutorial'
        # Manual access works even after opting out, with no character requirement.
        page.evaluate('window.__tutorialTest.module.api.openTutorial()')
        assert page.locator('.wpa-tutorial').count()==1
        page.evaluate('window.__tutorialTest.resetDialogs()')
        # Both main interfaces retain a subtle, functioning help entry.
        page.evaluate('window.__tutorialTest.module.api.openBasicActions(window.__tutorialTest.actor)')
        assert page.locator('.wpa-basic [data-wpa-open-tutorial]').is_visible()
        page.locator('.wpa-basic [data-wpa-open-tutorial]').click()
        assert page.locator('.wpa-tutorial').count()==1
        page.evaluate('window.__tutorialTest.resetDialogs()')
        page.evaluate('window.__tutorialTest.module.api.openPanel(window.__tutorialTest.actor)')
        assert page.locator('.wpa-panel [data-wpa-open-tutorial]').is_visible()
        page.locator('.wpa-panel [data-wpa-open-tutorial]').click()
        assert page.locator('.wpa-tutorial').count()==1
        print(f'PASS onboarding width {width}: steps, back/next, opt-out, relog, manual help x2, no clipping')
        page.close()
    browser.close()
