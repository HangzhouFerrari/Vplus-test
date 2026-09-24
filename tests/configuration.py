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
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/set.html?set=040402033'})
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&typeof SET!=='undefined'&&!!SET"):break
   time.sleep(.1)

  c.evaluate("localStorage.setItem('sd_onboard',JSON.stringify({set:true,stampen:true,flashcards:true,overhoren:true}));document.getElementById('onboard-overlay')?.remove()")

  for width in [390,1363]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':844,'deviceScaleFactor':1,'mobile':False})
   for dark in [False,True]:
    c.evaluate("localStorage.setItem('sd_theme',JSON.stringify({followSystem:false,darkMode:"+str(dark).lower()+"}));loadThemeSettings()")
    for mode,prefix,count in [('flashcards','fc',5),('stampen','st',9),('overhoren','oh',9)]:
     c.evaluate("startMode('"+mode+"')");time.sleep(.5)
     c.evaluate("toggleDD('"+prefix+"-dd')");time.sleep(.5)
     state=c.evaluate("(()=>{let d=document.getElementById('account-overlay'),r=d.querySelector('.acc-ov-panel').getBoundingClientRect();return {rows:d.querySelectorAll('.settings-row').length,controls:d.querySelectorAll('input,select').length,body:d.parentElement===document.body,x:r.x,y:r.y,right:r.right,bottom:r.bottom,header:d.querySelector('h3').textContent,display:getComputedStyle(d.querySelector('.acc-ov-panel')).display,bg:getComputedStyle(d.querySelector('.acc-ov-panel')).backgroundColor,overflow:d.querySelector('.acc-ov-content').scrollWidth>d.querySelector('.acc-ov-content').clientWidth}})()")
     check('settings complete and fit '+mode+' '+str(width)+' '+str(dark),state['rows']==count and state['controls']==count and state['body'] and state['x']>=0 and state['y']>=0 and state['right']<=width and state['bottom']<=844 and not state['overflow'],state)
     check('menu surface '+mode+' '+str(dark),state['bg']==('rgb(0, 0, 0)' if dark else 'rgb(242, 242, 247)'))
     c.evaluate("selectModeSettingsSection(0)")
     check('category shows its settings '+mode,c.evaluate("document.querySelectorAll('#account-overlay .settings-section:not([hidden])').length===1"))
     if width==390:
      check('mobile category hides navigation',c.evaluate("getComputedStyle(document.querySelector('#account-overlay .acc-ov-sidebar')).display==='none'"))
      c.evaluate("selectModeSettingsSection(-1)")
      check('mobile back restores categories',c.evaluate("getComputedStyle(document.querySelector('#account-overlay .acc-ov-sidebar')).display!=='none'"))
     if mode=='stampen':(root/('docs/design-review/configuration-'+str(width)+'-'+str(dark)+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
     c.evaluate("document.querySelector('#account-overlay .acc-ov-close').click()");time.sleep(.45)
     check('settings returns to owner '+mode,c.evaluate("document.getElementById('"+prefix+"-dd').style.display==='none'&&!document.getElementById('account-overlay')"))
  c.evaluate("window.confirm=()=>true;startMode('stampen');toggleDD('st-dd');document.querySelector('#account-overlay select[aria-label=Modus]').value='mc';document.querySelector('#account-overlay select[aria-label=Modus]').dispatchEvent(new Event('change'))");time.sleep(.3)
  check('changing mode preserves behavior and removes old panel',c.evaluate("ST.itype==='mc'&&!document.getElementById('account-overlay')&&document.querySelectorAll('#st-dd').length===1"))
  c.evaluate("toggleDD('st-dd');backToSet()");time.sleep(.3)
  check('leaving mode removes settings panel',c.evaluate("!document.getElementById('account-overlay')"))
  c.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':False})
  for mode,prefix in [('flashcards','fc'),('stampen','st'),('overhoren','oh')]:
   c.evaluate("startMode('"+mode+"');toggleDD('"+prefix+"-dd');selectModeSettingsSection(0)");time.sleep(.5)
   check('native selects replaced '+mode,c.evaluate("[...document.querySelectorAll('#account-overlay select')].every(s=>s.hidden&&s.closest('.velios-select'))"))
   c.evaluate("document.querySelector('#account-overlay .velios-select-trigger').click()");time.sleep(.25)
   check('custom list above menu and fits '+mode,c.evaluate("(()=>{let m=document.querySelector('.velios-select-menu'),r=m.getBoundingClientRect();return m.getAttribute('role')==='listbox'&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+20,r.y+20).closest('.velios-select-menu')===m})()"))
   if mode=='stampen':(root/'docs/design-review/custom-settings-select.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
   c.evaluate("document.querySelector('.velios-select-option').focus();document.querySelector('.velios-select-option').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");time.sleep(.2)
   check('escape closes choice only '+mode,c.evaluate("!!document.getElementById('account-overlay')&&!document.querySelector('.velios-select-menu')"))
   c.evaluate("document.querySelector('#account-overlay .velios-select-trigger').click();window.choiceValue=document.querySelectorAll('.velios-select-option')[1].dataset.value;document.querySelectorAll('.velios-select-option')[1].click()");time.sleep(.45)
   expression={'fc':'FC.front','st':'ST.qmode','oh':'OH.itype'}[prefix]
   check('choice updates mode '+mode,c.evaluate(expression+"===window.choiceValue&&!document.querySelector('.velios-select-menu')"))
   if mode!='overhoren':
    c.evaluate("document.querySelector('#account-overlay .velios-select-trigger').click();closeModeSettings(true)")
    check('closing settings removes choice list '+mode,c.evaluate("!document.querySelector('.velios-select-menu')"))
  (root/'docs/design-review/configuration.json').write_text(json.dumps(checks,indent=2)+'\n')
  print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
