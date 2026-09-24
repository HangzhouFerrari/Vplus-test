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


  c.evaluate("window.confirm=()=>true;starModeActive=false;clearSTProgress();ST={};startMode('stampen')")
  check('learning has twice the rounds',c.evaluate("document.querySelectorAll('#st-prog .round-progress-segment').length===Math.ceil(ST.terms.length/7)*2"))
  c.evaluate("ST.itype='open';stHardReset()")
  check('written mode has single round count',c.evaluate("document.querySelectorAll('#st-prog .round-progress-segment').length===Math.ceil(ST.terms.length/7)"))
  c.evaluate("document.getElementById('st-inp').value=ST._currentA;stCheckOpen();cancelStAdvance()")
  check('answer fills a segment',c.evaluate("parseFloat(document.querySelector('#st-prog .progress-fill').style.width)>0"))
  c.evaluate("updateRoundProgress('st-prog',Array.from({length:12},(_,i)=>i<5?1:0),0)")
  check('initial half preview fades',c.evaluate("document.getElementById('st-prog').classList.contains('has-after')&&!document.getElementById('st-prog').classList.contains('has-before')"))
  for width in [390,1363]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':936,'deviceScaleFactor':1,'mobile':False})
   time.sleep(.2)
   c.evaluate("updateRoundProgress('st-prog',Array(12).fill(0),0)")
   time.sleep(.6)
   geometry=c.evaluate("(()=>{const e=document.getElementById('st-prog'),r=e.getBoundingClientRect(),a=e.firstElementChild.children;return {ratio:(r.right-a[5].getBoundingClientRect().left)/a[5].getBoundingClientRect().width,width:r.width}})()")
   check('half sixth segment '+str(width),abs(geometry['ratio']-.5)<.03,geometry)
  c.evaluate("updateRoundProgress('st-prog',Array.from({length:12},(_,i)=>i<5?1:0),5)")
  time.sleep(.6)
  check('round six slides with preceding half',c.evaluate("(()=>{const e=document.getElementById('st-prog'),r=e.getBoundingClientRect(),p=e.firstElementChild.children[4].getBoundingClientRect();return e.classList.contains('has-before')&&Math.abs((p.right-r.left)/p.width-.5)<.03})()"))
  check('slide is animated',c.evaluate("parseFloat(getComputedStyle(document.querySelector('.round-progress-rail')).transitionDuration)>0"))
  c.evaluate("updateRoundProgress('st-prog',Array(12).fill(1),11)")
  time.sleep(.6)
  check('end has no trailing empty space',c.evaluate("(()=>{const e=document.getElementById('st-prog');return Math.abs(e.getBoundingClientRect().right-e.firstElementChild.lastElementChild.getBoundingClientRect().right)<1})()"))
  c.evaluate("backToSet();startMode('flashcards')")
  check('normal flashcards use continuous progress',c.evaluate("document.getElementById('fc-prog').classList.contains('progress-track')"))
  c.evaluate("backToSet();startMode('overhoren')")
  check('exam uses continuous progress',c.evaluate("document.getElementById('oh-prog').classList.contains('progress-track')"))
  c.evaluate("OH.answers[0]={chosen:'test'};ohCheckAll()")
  check('exam answer fills segment',c.evaluate("parseFloat(document.querySelector('#oh-prog .progress-fill').style.width)>0"))
  c.evaluate("OH.answers[0]={chosen:''};ohCheckAll()")
  check('empty answer clears segment',c.evaluate("parseFloat(document.querySelector('#oh-prog .progress-fill').style.width)===0"))
  (root/'docs/design-review/round-progress.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
