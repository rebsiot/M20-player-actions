"""Headless Chromium test for v0.1.11 Basic Actions. Not a live Foundry installation."""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import shutil
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'scripts/player-actions.js').read_text()
CSS=(ROOT/'styles/player-actions.css').read_text()
SETUP=r'''() => {
  window.__basicTest={dialogues:[],rolls:[],settings:{},warnings:[]};
  const test=window.__basicTest; const mod={api:null}; const hooks={};
  window.Hooks={once:(k,fn)=>hooks[k]=fn,on:(k,fn)=>hooks[k]=fn};
  const attributes={strength:2,dexterity:3,stamina:3,charisma:4,manipulation:2,appearance:2,perception:4,intelligence:3,wits:3};
  const abilities=['Alertness','Awareness','Investigation','Empathy','Stealth','Athletics','Survival','Expression','Subterfuge','Intimidation','Etiquette','Leadership','Occult','Academics','Computer','Medicine'];
  function actor(id,name){
    const a={id,uuid:'Actor.'+id,name,type:'PC',documentName:'Actor',isOwner:true,
      system:{settings:{splat:'mage'},attributes:Object.fromEntries(Object.entries(attributes).map(([k,v])=>[k,{total:v,value:v}]))},
      items:abilities.map((n,i)=>({id:'a'+i,name:n,type:'Ability',system:{id:n.toLowerCase(),value:(i+1)%5}}))};
    a.items.push({id:'wp',name:'Willpower',type:'Advantage',system:{id:'willpower',temporary:3}});
    a.api={rollAbility:async(id,attr,opts)=>{test.rolls.push({id,attr,opts,actor:a.uuid});}};
    return a;
  }
  const eli=actor('eli','Eli Smith');const chloe=actor('chloe','Chloe Hernandez');
  test.actor=eli;test.chloe=chloe;
  window.game={system:{id:'worldofdarkness'},modules:{get:()=>mod},
    user:{isGM:false,character:eli},actors:{contents:[eli,chloe]},
    keybindings:{register:()=>{}},i18n:{localize:s=>s},
    settings:{register:()=>{},get:(m,k)=>test.settings[m+'.'+k]||'',
      set:async(m,k,v)=>{test.settings[m+'.'+k]=v;}}};
  window.ui={notifications:{warn:s=>test.warnings.push(s),error:s=>test.warnings.push(s)}};
  window.canvas={tokens:{controlled:[]}};
  window.CONST={KEYBINDING_PRECEDENCE:{NORMAL:1}};
  window.foundry={utils:{escapeHTML:s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))},
    applications:{api:{DialogV2:class {
      constructor(options){this.options=options;test.dialogues.push(this);}
      async render(){
        this.element=document.createElement('article');this.element.className='fake-foundry-dialog';
        this.element.style.width=(this.options.position?.width||620)+'px';
        const header=document.createElement('header');header.textContent=this.options.window.title;this.element.append(header);
        this.form=document.createElement('form');this.form.innerHTML=this.options.content;this.element.append(this.form);
        const footer=document.createElement('footer');footer.textContent=(this.options.buttons||[]).map(b=>b.label).join('     ');this.element.append(footer);
        document.body.append(this.element);
      }
      async close(){this.element?.remove();}
      static async input(){return null;}
    }}}};
  window.__runHooks=()=>{hooks.init?.();hooks.ready?.();};
}'''
DOC_CSS='''body{background:#101823;color:#e7edf7;font:14px Arial,sans-serif;margin:12px;display:flex;justify-content:center;align-items:flex-start}
.fake-foundry-dialog{box-sizing:border-box;flex:none;border-radius:8px;border:1px solid #3b4659;background:#171c27;padding:0;box-shadow:0 12px 40px #0007}
.fake-foundry-dialog>header{padding:11px 14px;font-size:15px;font-weight:700;border-bottom:1px solid #4b5260}
.fake-foundry-dialog>form{padding:4px}
.fake-foundry-dialog>footer{border-top:1px solid #4b5260;padding:10px;text-align:right;color:#c6d2ea}
'''
with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  for width in (1440,820,430):
    page=b.new_page(viewport={'width':width,'height':1000},device_scale_factor=1)
    page.route('**/modules/wod20-player-actions/icons/*.svg',lambda route: route.fulfill(path=str(ROOT/'icons'/Path(urlparse(route.request.url).path).name),content_type='image/svg+xml'))
    page.set_content('<!doctype html><html><head><meta charset="utf-8"><base href="http://foundry.local/"><style>'+DOC_CSS+CSS+'</style></head><body></body></html>')
    page.evaluate(SETUP)
    page.add_script_tag(content=SRC)
    page.evaluate('window.__runHooks()')
    page.evaluate("game.modules.get('wod20-player-actions').api.openBasicActions(window.__basicTest.actor)")
    grid=page.locator('.wpa-basic-grid')
    assert grid.count()==5,grid.count()
    assert page.locator('.wpa-basic-grid').first.locator('.wpa-basic-tile').count()==5
    assert page.locator('.wpa-basic-tile').count()==25
    assert page.locator('.wpa-basic-tile.is-empty').count()==5
    assert page.locator('img[src$="binoculars.svg"]').count()==1
    images=page.locator('.wpa-basic-tile img')
    assert images.count()==20
    page.wait_for_function('''() => [...document.querySelectorAll('.wpa-basic-tile img')].every(x=>x.complete&&x.naturalWidth>0)''',timeout=3000)
    counts=page.evaluate('''() => ({horizontal:document.documentElement.scrollWidth>window.innerWidth+1,
      overflow:[...document.querySelectorAll('.wpa-basic,.wpa-basic-grid,.wpa-basic-footer')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className),
      cols:getComputedStyle(document.querySelector('.wpa-basic-grid')).gridTemplateColumns.split(' ').length,
      actionCount:document.querySelectorAll('.wpa-basic-tile').length,
      iconCount:[...document.querySelectorAll('.wpa-basic-tile img')].filter(x=>x.naturalWidth>0).length})''')
    assert not counts['horizontal'] and not counts['overflow'],(width,counts)
    assert counts['cols']==(3 if width==430 else 5),(width,counts)
    assert counts['iconCount']==20
    # Compact v0.1.11 revision: full action titles and actual dice pools remain
    # readable alongside meaningful abbreviated Attribute + Ability pairs.
    assert page.locator('.wpa-basic-pair').count()==20
    assert page.locator('[data-basic-preset="notice"] .wpa-basic-pair').inner_text()=='Per + Alert'
    assert page.locator('[data-basic-preset="occult"] .wpa-basic-pair').inner_text()=='Int + Occ'
    assert 'Perception + Alertness' in page.locator('[data-basic-preset="notice"]').get_attribute('title')
    compact=page.evaluate('''() => ({
      iconSizes:[...document.querySelectorAll('.wpa-basic-tile img')].map(x=>getComputedStyle(x).width),
      tileHeight:Math.round(document.querySelector('.wpa-basic-tile').getBoundingClientRect().height),
      panelHeight:Math.round(document.querySelector('.wpa-basic').getBoundingClientRect().height),
      clipping:[...document.querySelectorAll('.wpa-basic-tile,.wpa-basic-tile-main,.wpa-basic-tile-meta')]
        .filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>({cls:el.className,content:el.textContent.trim().slice(0,70)}))
    })''')
    assert compact['iconSizes']==['19px']*20,(width,compact)
    assert compact['tileHeight']<=65,(width,compact)
    assert compact['panelHeight']<=(660 if width>=820 else 790),(width,compact)
    assert not compact['clipping'],(width,compact)
    assert page.locator('.wpa-basic-footer').evaluate('(el) => getComputedStyle(el).position')==('static' if width==430 else 'sticky')
    if width==820:
      (ROOT.parent/'preview-basic-actions-820.png').parent.mkdir(parents=True,exist_ok=True)
      page.screenshot(path=str(ROOT.parent/'preview-basic-actions-820.png'),full_page=True)
    if width==1440:
      page.screenshot(path=str(ROOT.parent/'preview-basic-actions-desktop.png'),full_page=True)
    if width==430:
      page.screenshot(path=str(ROOT.parent/'preview-basic-actions-mobile.png'),full_page=True)
    # Roll directly via native WoD20 Actor API. Difficulty and Willpower persist only until rolling.
    page.locator('[data-basic-step="1"]').click()
    assert page.locator('[data-basic-difficulty]').inner_text()=='7'
    page.locator('input[name="basicWillpower"]').check()
    page.locator('[data-basic-preset="notice"]').click()
    rolls=page.evaluate('window.__basicTest.rolls')
    assert len(rolls)==1 and rolls[0]['id']=='a0' and rolls[0]['attr']=='perception' and rolls[0]['opts']['difficulty']==7 and rolls[0]['opts']['useWillpower']
    assert not page.locator('input[name="basicWillpower"]').is_checked()
    # Blank action opens the config editor with curated icons.
    page.locator('[data-basic-config="0"]').click()
    assert page.locator('.wpa-basic-icon-choice').count()==36
    page.wait_for_function('''() => [...document.querySelectorAll('.wpa-basic-icon-choice img')].every(x=>x.complete&&x.naturalWidth>0)''')
    async_config='''async () => {
      const d=window.__basicTest.dialogues.at(-1);
      await d.options.submit({label:'Find Clues',attribute:'perception',abilityId:'a2',icon:'eye-target'});
      await d.close();
    }'''
    page.evaluate(async_config)
    assert page.locator('.wpa-basic-tile.is-custom').count()==1
    assert page.locator('.wpa-basic-tile.is-custom strong').inner_text()=='Find Clues'
    assert page.locator('.wpa-basic-tile.is-custom .wpa-basic-pair').inner_text()=='Per + Invest'
    assert page.locator('.wpa-basic-tile.is-custom img').get_attribute('src').endswith('eye-target.svg')
    assert page.locator('[data-basic-difficulty]').inner_text()=='6','reopens with default difficulty'
    page.locator('[data-basic-custom="0"]').click()
    rolls=page.evaluate('window.__basicTest.rolls')
    assert len(rolls)==2 and rolls[-1]['id']=='a2'
    # Edit and clear should restore an empty configurable slot without touching the sheet.
    page.locator('.wpa-basic-edit[data-basic-config="0"]').click()
    page.evaluate('''async () => {const d=window.__basicTest.dialogues.at(-1);await d.options.submit({clear:true});await d.close();}''')
    assert page.locator('.wpa-basic-tile.is-empty').count()==5
    assert page.evaluate('window.__basicTest.actor.items.length')==17
    print('Basic Actions width',width,'layout',counts,'native rolls',len(rolls))
    page.close()
  b.close()
print('PASS: actual SVGs, 4x5 presets plus 5 custom slots, native rolls, custom edit/clear, difficulty/Willpower, responsive 1440/820/430')
