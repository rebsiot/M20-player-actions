"""Visual / interaction fixture for Quick Resources. Not live Foundry integration."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'scripts/player-actions.js').read_text(encoding='utf-8')
CSS=(ROOT/'styles/player-actions.css').read_text(encoding='utf-8')
BASE='''body{background:#111927;color:#edf3fb;font:14px Arial,sans-serif;margin:12px;display:flex;justify-content:center;align-items:flex-start}
.fake-foundry-dialog{box-sizing:border-box;max-width:calc(100vw - 24px);flex:none;border:1px solid #56657b;border-radius:7px;background:#192433;overflow:hidden}
.fake-foundry-dialog>header{padding:10px 13px;border-bottom:1px solid #52617b;font-size:14px;font-weight:bold}
.fake-foundry-dialog>form{padding:3px}.fake-foundry-dialog>footer{padding:8px 12px;border-top:1px solid #52617b;color:#abc;}
'''
MOCK=r'''() => {
  const test=window.__resourceMock={writes:[],dialogs:[],warnings:[],hooks:{}};
  const module={api:{}};
  const mage={id:'mage1',uuid:'Actor.mage1',type:'PC',documentName:'Actor',name:'Eli Smith',isOwner:true,
    system:{settings:{splat:'mage'},health:{damage:{bashing:2,lethal:1,aggravated:0},
      bruised:{total:1},hurt:{total:1},injured:{total:1},wounded:{total:1},mauled:{total:1},crippled:{total:1},incapacitated:{total:1}}},items:[],
    async update(changes){test.writes.push({source:'actor',changes});for(const [path,n] of Object.entries(changes)){
      const keys=path.split('.');let obj=this;for(const k of keys.slice(0,-1))obj=obj[k];obj[keys.at(-1)]=n;}}};
  const advantage=(id,temporary,permanent,max)=>{
    const i={id,name:id,type:'Advantage',parent:mage,system:{id,temporary,permanent,max,settings:{isvisible:true}},
    async update(changes){test.writes.push({source:id,changes});this.system.temporary=changes['system.temporary'];return this;}};mage.items.push(i);};
  advantage('willpower',4,7,10);advantage('quintessence',8,0,20);advantage('paradox',2,1,20);
  window.Hooks={once:(k,fn)=>test.hooks[k]=fn,on:()=>{}};
  window.game={system:{id:'worldofdarkness'},user:{isGM:false,character:mage},
    settings:{register:()=>{},get:()=>'',set:async()=>{}},modules:{get:()=>module},actors:{contents:[mage]},keybindings:{register:()=>{}}};
  window.foundry={utils:{escapeHTML: x => String(x).replace(/[&<>"']/g,z=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[z]))},
    applications:{api:{DialogV2:class {
      constructor(data){this.data=data;test.dialogs.push(this);}
      async render(){this.element=document.createElement('article');this.element.className='fake-foundry-dialog';
        this.element.style.width=(this.data.position?.width||540)+'px';
        const h=document.createElement('header');h.textContent=this.data.window.title;this.element.append(h);
        const form=document.createElement('form');form.innerHTML=this.data.content;this.element.append(form);
        const f=document.createElement('footer');f.textContent='Close';this.element.append(f);
        document.body.append(this.element);return this;}
      async close(){this.element?.remove();}
    }}}};
  window.CONST={KEYBINDING_PRECEDENCE:{NORMAL:1}};
  window.canvas={tokens:{controlled:[]}};window.ui={notifications:{warn:s=>test.warnings.push(s),error:s=>test.warnings.push(s)}};
  test.actor=mage;test.module=module;
  test.open=async()=>await module.api.openQuickResources(mage);
}'''
with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  for width in (1440,820,430):
    page=b.new_page(viewport={'width':width,'height':920},device_scale_factor=1)
    page.set_content('<!doctype html><html><head><meta charset="utf-8"><style>'+BASE+CSS+'</style></head><body></body></html>')
    page.evaluate(MOCK)
    page.add_script_tag(content=SRC)
    page.evaluate('window.__resourceMock.hooks.init()')
    page.evaluate('window.__resourceMock.hooks.ready()')
    page.evaluate('window.__resourceMock.open()')
    page.locator('.wpa-resources').wait_for()
    assert page.locator('.wpa-resource-section').count()==2
    assert page.locator('[data-wpa-resource-row]').count()==6
    assert 'Willpower' in page.locator('[data-wpa-resource-row="pool:willpower"]').inner_text()
    assert page.locator('[data-wpa-resource-row="pool:willpower"] .wpa-resource-value').inner_text()=='4 / 7'
    assert page.locator('[data-wpa-resource-row="health:physical:aggravated"] button[data-wpa-resource-delta="-1"]').is_disabled()
    sizes=page.evaluate('''() => ({width:window.innerWidth,document:document.documentElement.scrollWidth,
      outer:[...document.querySelectorAll('.wpa-resources,.wpa-resource-row,.wpa-resource-controls,.wpa-resource-stack')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)})''')
    assert sizes['document']<=sizes['width']+1 and not sizes['outer'],(width,sizes)
    page.screenshot(path=str(ROOT.parent/f'preview-quick-resources-{width}.png'),full_page=True)
    page.locator('[data-wpa-resource-row="pool:willpower"] button[data-wpa-resource-delta="-1"]').click()
    assert page.locator('[data-wpa-resource-row="pool:willpower"] .wpa-resource-value').inner_text()=='3 / 7'
    assert page.evaluate('window.__resourceMock.writes.at(-1).changes["system.temporary"]')==3
    page.locator('[data-wpa-resource-action="undo"]').click()
    assert page.locator('[data-wpa-resource-row="pool:willpower"] .wpa-resource-value').inner_text()=='4 / 7'
    page.locator('[data-wpa-resource-row="health:physical:aggravated"] button[data-wpa-resource-delta="1"]').click()
    assert page.evaluate('window.__resourceMock.actor.system.health.damage.aggravated')==1
    assert page.evaluate('window.__resourceMock.actor.system.health.damage.lethal')==1
    assert page.evaluate('window.__resourceMock.actor.system.health.damage.bashing')==2
    assert page.evaluate('window.__resourceMock.writes.at(-1).source')=='actor'
    assert not page.evaluate('window.__resourceMock.warnings')
    page.close()
    print(f'PASS Quick Resources at {width}px: no clipping, one-click native save, Undo Last, separate aggravated damage')
  b.close()
