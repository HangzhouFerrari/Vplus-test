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
  def snapshot(selector):
   return c.evaluate("(()=>{const e=document.querySelector("+json.dumps(selector)+");const s=getComputedStyle(e),r=e.getBoundingClientRect();return {scale:s.scale,filter:s.filter,bg:s.backgroundColor,color:s.color,x:r.x,y:r.y,w:r.width,h:r.height}})()")
  def hover(selector):
   r=snapshot(selector);c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':r['x']+r['w']/2,'y':r['y']+r['h']/2});time.sleep(.25)
  c.evaluate("document.querySelector('#home').style.minHeight='2200px';window.scrollTo(0,450)");time.sleep(.3)
  before=snapshot('body > nav');c.evaluate('showCreateModal()');time.sleep(.4)
  after=snapshot('body > nav');check('header stays fixed after opening scrolled editor',abs(before['y']-after['y'])<1 and after['y']==0,{'before':before,'after':after})
  hover('.create-editor-heading');check('editor does not shrink on content hover',snapshot('#modal-panel')['scale'] in ['none','1'],snapshot('#modal-panel'))
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':10,'y':400});time.sleep(.25)
  check('backdrop is not a hover control',snapshot('#modal-bg')['scale'] in ['none','1'] and snapshot('#modal-bg')['filter']=='none',snapshot('#modal-bg'))
  for width in [1363,390]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':936 if width>500 else 844,'deviceScaleFactor':1,'mobile':False});time.sleep(.4)
   check('editor fits viewport '+str(width),c.evaluate("document.querySelector('.create-editor-scroll').scrollWidth<=document.querySelector('.create-editor-scroll').clientWidth&&document.querySelector('.create-editor-footer').getBoundingClientRect().bottom<=innerHeight"))
   (root/('docs/design-review/editor-'+str(width)+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  c.call('Emulation.setDeviceMetricsOverride',{'width':1363,'height':936,'deviceScaleFactor':1,'mobile':False})
  c.evaluate("closeModal();showPage('library')");time.sleep(.5)
  check('set action buttons exist',c.evaluate("!!document.querySelector('#library .set-icon-btn')"))
  if c.evaluate("!!document.querySelector('#library .set-icon-btn')"):
   c.evaluate("document.querySelector('#library .set-icon-btn').scrollIntoView({block:'center'})");hover('#library .set-icon-btn')
   check('action row does not animate',snapshot('#library .set-card-actions')['w']>0 and snapshot('#library .set-card-actions')['scale'] in ['none','1'],snapshot('#library .set-card-actions'))
   check('card does not shrink around actions',snapshot('#library .set-card')['scale'] in ['none','1'],snapshot('#library .set-card'))
   for dark in [False,True]:
    c.evaluate('applyThemeSettings('+json.dumps(dark)+',"#ff9f0a")');time.sleep(.25)
    button=snapshot('#library .set-icon-btn');check('action background visible '+str(dark),button['w']>0 and button['bg'] in ['rgb(229, 229, 234)','rgb(44, 44, 46)'],button)
  c.evaluate("showPage('home');document.getElementById('home').style.minHeight='2200px';window.scrollTo(0,450);openAccountOverlay('accessibility')");time.sleep(.5)
  check('header stays visible with account overlay',snapshot('body > nav')['y']==0,snapshot('body > nav'))
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/login.html'})
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&!!document.querySelector('#primaryBtn')"):break
   time.sleep(.1)
  check('login uses shared primary style',c.evaluate("getComputedStyle(document.querySelector('#primaryBtn')).borderRadius==='999px'&&document.querySelector('#primaryBtn').classList.contains('btn-primary')"))
  c.evaluate('document.fonts.ready.then(()=>true)');time.sleep(.5);hover('#primaryBtn');time.sleep(.2)
  login_style=snapshot('#primaryBtn');check('login hover animated',abs(float(login_style['scale'])-.98)<.001,login_style)
  c.evaluate("setAccessibilityPreference('highContrast',true);setAccessibilityPreference('reducedMotion',true)")
  check('login accessibility settings applied',c.evaluate("document.documentElement.classList.contains('high-contrast')&&getComputedStyle(document.querySelector('#primaryBtn')).transitionDuration.split(',').every(x=>parseFloat(x)<.001)"))
  (root/'docs/design-review/login.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  (root/'docs/design-review/sitewide.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
