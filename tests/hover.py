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
  c.evaluate("const testButton=document.createElement('button');testButton.className='btn btn-primary';testButton.id='hover-test';testButton.textContent='Test';testButton.style.cssText='position:fixed;top:100px;left:100px;z-index:99999';document.body.appendChild(testButton)")
  selector='#hover-test'
  rect=c.evaluate(f"(()=>{{const r=document.querySelector('{selector}').getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}}}})()")
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**rect});time.sleep(.25)
  style=c.evaluate(f"(()=>{{const s=getComputedStyle(document.querySelector('{selector}'));return {{scale:s.scale,filter:s.filter,transition:s.transitionProperty,duration:s.transitionDuration,hover:document.querySelector('{selector}').matches(':hover'),media:matchMedia('(hover:hover)').matches}}}})()")
  check('animated hover is 0.98 scale and 0.95 brightness',style['scale']=='0.98' and style['filter']=='brightness(0.95)' and 'scale' in style['transition'] and '0.16s' in style['duration'],style)
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':1,'y':1});time.sleep(.25)
  check('hover returns to rest',c.evaluate(f"getComputedStyle(document.querySelector('{selector}')).scale") in ['none','1'])
  c.evaluate("showCreateModal()")
  values=c.evaluate("(()=>{const keys=['backgroundColor','color','borderRadius','fontFamily','fontWeight'];return [...document.querySelectorAll('.sidebar .btn-primary,.create-editor-footer .btn-primary')].map(b=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(b)[k]])))})()")
  check('primary button appearance shared',len(values)==2 and values[0]==values[1],values)
  c.evaluate("document.getElementById('hover-test')?.remove();closeModal();openAccountOverlay('accessibility')");time.sleep(.5)
  (root/'docs/design-review/accessibility-menu.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/set.html?set=040402033'})
  for _ in range(150):
   if c.evaluate("typeof SET!=='undefined'&&SET&&typeof startMode==='function'"):break
   time.sleep(.1)
  c.evaluate("startMode('flashcards')");time.sleep(.6)
  position="(()=>{const r=document.querySelector('.fc-face:not([inert]) .fc-star-btn').getBoundingClientRect();return {x:r.x,y:r.y}})()"
  before=c.evaluate(position);c.evaluate('fcFlip()');time.sleep(.5);after=c.evaluate(position)
  check('rotating stars finish on the right',abs(before['x']-after['x'])<1 and abs(before['y']-after['y'])<1,{'before':before,'after':after})
  image=c.call('Page.captureScreenshot',{'format':'png'})['data'];(root/'docs/design-review/flashcard-back.png').write_bytes(base64.b64decode(image))
  (root/'docs/design-review/hover.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
