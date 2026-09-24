"""Real-time Chrome DevTools checks for hover transitions and 3D card faces."""
import base64,hashlib,json,os,socket,struct,subprocess,tempfile,time,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parent.parent
class CDP:
 def __init__(self,url):
  from urllib.parse import urlparse
  u=urlparse(url);self.s=socket.create_connection((u.hostname,u.port));self.s.settimeout(15);self.seq=0
  key=base64.b64encode(os.urandom(16)).decode();self.s.sendall(f'GET {u.path} HTTP/1.1\r\nHost: {u.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
  header=b''
  while not header.endswith(b'\r\n\r\n'):header+=self.s.recv(1)
  assert b'101' in header,header
 def read(self,n):
  out=b''
  while len(out)<n:out+=self.s.recv(n-len(out))
  return out
 def call(self,method,params={}):
  self.seq+=1;data=json.dumps({'id':self.seq,'method':method,'params':params}).encode();mask=os.urandom(4);n=len(data)
  header=bytes([129,128|n]) if n<126 else bytes([129,254])+struct.pack('!H',n)
  self.s.sendall(header+mask+bytes(v^mask[i%4] for i,v in enumerate(data)))
  while True:
   first,second=self.read(2);n=second&127
   if n==126:n=struct.unpack('!H',self.read(2))[0]
   elif n==127:n=struct.unpack('!Q',self.read(8))[0]
   msg=json.loads(self.read(n))
   if msg.get('id')==self.seq:
    if 'error'in msg:raise RuntimeError(msg)
    return msg.get('result',{})
 def evaluate(self,expression):
  r=self.call('Runtime.evaluate',{'expression':expression,'returnByValue':True,'awaitPromise':True})
  if 'exceptionDetails'in r:raise RuntimeError(r)
  return r.get('result',{}).get('value')
with tempfile.TemporaryDirectory(prefix='velios-hover-',ignore_cleanup_errors=True) as profile:
 proc=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  portfile=Path(profile)/'DevToolsActivePort'
  for _ in range(100):
   if portfile.exists():break
   time.sleep(.1)
  port=portfile.read_text().splitlines()[0]
  targets=json.load(urllib.request.urlopen('http://127.0.0.1:'+port+'/json'))
  c=CDP(next(t['webSocketDebuggerUrl'] for t in targets if t['type']=='page'))
  c.call('Emulation.setDeviceMetricsOverride',{'width':1363,'height':936,'deviceScaleFactor':1,'mobile':False})
  c.call('Page.addScriptToEvaluateOnNewDocument',{'source':"sessionStorage.setItem('velios-sw-reloaded-20260919-1','1');if(navigator.serviceWorker)navigator.serviceWorker.register=()=>Promise.resolve({update:async()=>{}});"})
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/index.html?skipWelcome'})
  for _ in range(100):
   if c.evaluate("typeof showCreateModal==='function'"):break
   time.sleep(.1)
  c.evaluate("sessionStorage.setItem('velios-sw-reloaded-20260919-1','1');localStorage.setItem('sd_onboard','{\"home\":true,\"set\":true,\"flashcards\":true}');document.getElementById('onboard-overlay')?.remove();setAccessibilityPreference('reducedMotion',false);showPage('home')")
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&!!document.body"):break
   time.sleep(.1)
  time.sleep(1);checks=[]
  def check(name,ok,data=None):checks.append({'name':name,'ok':ok,'data':data})
  c.evaluate("showCreateModal()")
  icon=".create-editor-icon-btn:not(.create-editor-expand)"
  keys=['width','height','backgroundColor','color','borderRadius']
  editor=c.evaluate("Object.fromEntries("+json.dumps(keys)+".map(k=>[k,getComputedStyle(document.querySelector('"+icon+"'))[k]]))")
  c.evaluate("closeModal()");time.sleep(.22)
  check('desktop editor closes promptly',c.evaluate("document.getElementById('modal-bg').classList.contains('hidden')"))
  c.evaluate("openAccountOverlay('accessibility')");time.sleep(.3)
  menu=c.evaluate("Object.fromEntries("+json.dumps(keys)+".map(k=>[k,getComputedStyle(document.querySelector('.acc-ov-close'))[k]]))")
  check('editor and menu close buttons match',editor==menu,{'editor':editor,'menu':menu})
  c.evaluate("setAccessibilityPreference('reducedMotion',true)")
  check('dashboard glow keeps animation with app preference',c.evaluate("parseFloat(getComputedStyle(document.querySelector('.dashboard-glow')).animationDuration)>1"))
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/set.html?set=040402033'})
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&typeof SET!=='undefined'&&!!SET&&!!document.querySelector('.set-detail-title')"):break
   time.sleep(.1)
  c.evaluate("localStorage.setItem('sd_onboard','{\"set\":true,\"stampen\":true,\"flashcards\":true}');document.getElementById('onboard-overlay')?.remove();setAccessibilityPreference('reducedMotion',false)");time.sleep(.3)
  check('header title hidden above page title',c.evaluate("getComputedStyle(document.getElementById('nav-set-title')).opacity==='0'"))
  c.evaluate('window.scrollTo(0,600)');time.sleep(.4)
  check('header title shown after scrolling past title',c.evaluate("getComputedStyle(document.getElementById('nav-set-title')).opacity==='1'"))
  check('back to top appears',c.evaluate("document.getElementById('set-back-top').classList.contains('is-visible')"))
  check('desktop create button hidden',c.evaluate("getComputedStyle(document.querySelector('.set-sidebar-create')).display==='none'"))
  c.evaluate("startMode('stampen');ST.itype='open';ST.copyCorrect=true;stRenderQ()");time.sleep(.4)
  check('mode header slides out',c.evaluate("document.querySelector('#app>nav').getBoundingClientRect().bottom<=0"))
  c.evaluate("ST.streak=3;stUpdateStats();setAccessibilityPreference('reducedMotion',true)")
  check('flame keeps animation with app preference',c.evaluate("parseFloat(getComputedStyle(document.querySelector('.flame-tongue')).animationDuration)>.1"))
  c.evaluate("setAccessibilityPreference('reducedMotion',false)")
  for width in [1363,390,360]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':936 if width>500 else 844,'deviceScaleFactor':1,'mobile':False});time.sleep(.3)
   check('study card fits '+str(width),c.evaluate("document.querySelector('.st-study-card').getBoundingClientRect().right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth"))
   (root/('docs/design-review/study-'+str(width)+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  check('no speech control for non-language subjects',c.evaluate("!document.querySelector('.st-speak')"))
  check('old label and counters removed',c.evaluate("!document.querySelector('.st-qlabel')&&!document.getElementById('st-left')"))
  c.evaluate("window.originalTerms=SET.terms;SET.terms=[{term:'café',def:'größ'},{term:'naïef',def:'éé'}];stRenderCharacters()")
  check('only set characters shown once',c.evaluate("[...document.querySelectorAll('#st-characters button')].slice(1).map(b=>b.textContent).sort().join('')===['é','ö','ß','ï'].sort().join('')"))
  c.evaluate("document.querySelector('#st-characters button').click()")
  check('shift changes special characters to uppercase',c.evaluate("[...document.querySelectorAll('#st-characters button')].some(b=>b.textContent==='É')"))
  c.evaluate("SET.terms=window.originalTerms")
  c.evaluate("stInsertCharacter('é')")
  check('special character enters answer',c.evaluate("document.getElementById('st-inp').value==='é'"))
  c.evaluate("document.getElementById('st-inp').value='ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';stCheckOpen()")
  check('copy uses same input and blocks next',c.evaluate("document.querySelectorAll('.st-study-card input').length===1&&!document.getElementById('st-inp').disabled&&document.getElementById('st-check-btn').disabled"))
  check('feedback above input',c.evaluate("document.getElementById('st-fb').getBoundingClientRect().bottom<=document.getElementById('st-inp').getBoundingClientRect().top"))
  time.sleep(.4)
  check('copy next button is neutral',c.evaluate("(()=>{const rgb=getComputedStyle(document.getElementById('st-check-btn')).backgroundColor.match(/[0-9.]+/g).slice(0,3).map(Number);return Math.max(...rgb)-Math.min(...rgb)<5})()"))
  (root/'docs/design-review/study-wrong.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  c.evaluate("document.getElementById('st-inp').value=ST._currentA;stCheckCopyInput(document.getElementById('st-inp'))")
  check('copy enables next',c.evaluate("!document.getElementById('st-check-btn').disabled"))
  c.evaluate("stOverride();window.correctOnce=ST.correct;stOverride()")
  check('override scores only once',c.evaluate("ST.correct===window.correctOnce&&!document.querySelector('.fb-override-btn')"))
  c.evaluate("ST.copyCorrect=false;ST.allowSingle=true;ST._currentA='appel; peer';ST._currentT={term:'fruit',def:'appel; peer'};ST.answered=false;document.getElementById('st-inp').disabled=false;document.getElementById('st-inp').value='appel';stCheckOpen()")
  check('partial answer shows complete answer',c.evaluate("document.getElementById('st-fb').textContent.includes('Juist. Volledig antwoord:')"))
  c.evaluate("ST.itype='mc';ST._cpDoneAt=ST.correct+ST.wrong;stRenderQ()");time.sleep(.2)
  check('multiple choice options present',c.evaluate("document.querySelectorAll('.mc-option').length>=2"))
  c.evaluate("document.querySelector('.mc-option').click()")
  check('multiple choice feedback and next',c.evaluate("[...document.querySelectorAll('.mc-option')].every(b=>b.disabled)&&!document.getElementById('st-check-btn').hidden"))
  c.evaluate("document.getElementById('milestone-overlay').classList.remove('active');document.querySelector('.encourage-toast')?.remove()");time.sleep(.4)
  (root/'docs/design-review/study-mc.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  c.evaluate("ST.streak=0;ST.itype='open';ST.copyCorrect=false;ST._cpDoneAt=ST.correct+ST.wrong;stRenderQ();localStorage.setItem('sd_theme','{\"followSystem\":false,\"darkMode\":false,\"accentColor\":\"#ff9f0a\"}');loadThemeSettings()");time.sleep(.4)
  c.call('Emulation.setDeviceMetricsOverride',{'width':1363,'height':936,'deviceScaleFactor':1,'mobile':False});time.sleep(.3)
  (root/'docs/design-review/study-light.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  for mode in ['flashcards','overhoren']:
   c.evaluate("backToSet();window.scrollTo(0,0)");time.sleep(.3)
   check('header returns before '+mode,c.evaluate("Math.abs(document.querySelector('#app>nav').getBoundingClientRect().top)<1"))
   c.evaluate("startMode('"+mode+"')");time.sleep(.35)
   check('header hidden for '+mode,c.evaluate("document.querySelector('#app>nav').getBoundingClientRect().bottom<=0"))
  c.evaluate("SET.vak='Frans';startMode('stampen');ST._cpDoneAt=ST.correct+ST.wrong;stRenderQ()")
  check('no voice feature on language sets',c.evaluate("!document.querySelector('.st-speak')&&typeof stSpeak==='undefined'&&!window.VeliosSpeech"))
  (root/'docs/design-review/study-redesign.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
