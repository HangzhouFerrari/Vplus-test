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
   c.evaluate("window.scrollTo(0,0)");time.sleep(.3)
   c.evaluate("toggleDD('set-menu')");time.sleep(.3)
   before=c.evaluate("document.getElementById('set-menu').getBoundingClientRect().top")
   c.evaluate("window.scrollTo(0,20)");time.sleep(.4)
   after=c.evaluate("document.getElementById('set-menu').getBoundingClientRect().top")
   check('menu stays at document anchor '+str(width),abs(after-before+20)<1,{'before':before,'after':after})
   check('menu portaled to body '+str(width),c.evaluate("document.getElementById('set-menu').parentElement===document.body"))
   if width==390:(root/'docs/design-review/set-menu-fixed.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
   c.evaluate("setAllStars(true)");time.sleep(.4)
   check('bulk action leaves one menu '+str(width),c.evaluate("document.querySelectorAll('#set-menu').length===1"))
   c.evaluate("setAllStars(false)");time.sleep(.3)
  for mode_width in [390,1363]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':mode_width,'height':844,'deviceScaleFactor':1,'mobile':False})
   c.evaluate("document.documentElement.style.setProperty('--study-safe-top','59px');document.documentElement.style.setProperty('--study-safe-bottom','34px')")
   for mode in ['flashcards','stampen','overhoren']:
    c.evaluate("backToSet();window.scrollTo(0,650);toggleDD('set-menu');startMode('"+mode+"')")
    check('menu removed immediately on '+mode,c.evaluate("!document.querySelector('body > #set-menu')&&openDD===null"))
    time.sleep(.5)
    check('scrolled mode starts at top '+mode,c.evaluate("scrollY===0&&document.getElementById('main-screen').scrollTop===0&&document.querySelector('.mode-close-btn').getBoundingClientRect().top>=79&&document.querySelector('.mode-close-btn').getBoundingClientRect().bottom<innerHeight"))
    c.evaluate("backToSet()");time.sleep(.3)
    check('single closed menu on return from '+mode,c.evaluate("document.querySelectorAll('#set-menu').length===1&&document.getElementById('set-menu').style.display==='none'&&!document.querySelector('body > #set-menu')"))
  c.evaluate("toggleDD('set-menu');closeDD('set-menu');toggleDD('set-menu')");time.sleep(.4)
  check('reopened menu survives old close timer',c.evaluate("document.getElementById('set-menu').style.display==='block'&&openDD==='set-menu'"))
  c.evaluate("closeDD('set-menu');startMode('overhoren');backToSet()");time.sleep(.4)
  check('pending close cannot restore stale menu',c.evaluate("document.querySelectorAll('#set-menu').length===1&&!document.querySelector('body > #set-menu')&&openDD===null"))
  c.evaluate("(()=>{let g=document.createElement('div');g.id='group-test';g.className='button-group';g.innerHTML='<button class=btn>First</button><button class=btn>Middle</button><button class=btn>Last</button>';document.body.append(g)})()")
  check('shared group corners outside dropdown',c.evaluate("(()=>{let b=document.querySelectorAll('#group-test .btn'),s=[...b].map(e=>getComputedStyle(e));return s[0].borderTopLeftRadius==='22px'&&s[0].borderBottomLeftRadius==='6px'&&s[1].borderRadius==='6px'&&s[2].borderTopLeftRadius==='6px'&&s[2].borderBottomLeftRadius==='22px'})()"))
  c.evaluate("document.querySelectorAll('#group-test .btn')[0].hidden=true")
  check('hidden first button excluded from group corners',c.evaluate("getComputedStyle(document.querySelectorAll('#group-test .btn')[1]).borderTopLeftRadius==='22px'"))
  c.evaluate("document.getElementById('group-test').remove()")
  c.evaluate("closeDD('set-menu',true);window.scrollTo(0,0);updateSetScrollChrome();toggleDD('set-menu');window.scrollTo(0,600);updateSetScrollChrome()")
  check('scroll close uses normal animation',c.evaluate("document.getElementById('set-menu').classList.contains('closing')&&getComputedStyle(document.getElementById('set-menu')).animationName==='set-dropOut'"))
  time.sleep(.4)
  check('header title appearance closes menu',c.evaluate("document.getElementById('nav-set-title').classList.contains('is-visible')&&document.getElementById('set-menu').style.display==='none'&&openDD===null"))
  check('header and sidebar above menu',c.evaluate("(()=>{let z=s=>+getComputedStyle(document.querySelector(s)).zIndex;return z('#app > nav')>z('#set-menu')&&z('.set-sidebar')>z('#set-menu')})()"))
  c.evaluate("localStorage.setItem('sd_welcome_seen','1')")
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/index.html?skipWelcome'})
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&typeof resetPageScroll==='function'"):break
   time.sleep(.1)
  check('index opens at top',c.evaluate("scrollY===0&&(!document.getElementById('page-scroll-container')||document.getElementById('page-scroll-container').scrollTop===0)"))
  c.evaluate("document.getElementById('page-scroll-container')?.scrollTo(0,500);window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))");time.sleep(.1)
  check('restored index resets scroll',c.evaluate("scrollY===0&&(!document.getElementById('page-scroll-container')||document.getElementById('page-scroll-container').scrollTop===0)"))
  c.call('Network.enable')
  c.call('Network.setBlockedURLs',{'urls':['*set-app.js*','*/app.js*']})
  for filename in ['set.html?set=040402033','index.html?skipWelcome']:
   for dark in [True,False]:
    c.evaluate("localStorage.setItem('sd_theme',JSON.stringify({followSystem:false,darkMode:"+str(dark).lower()+"}))")
    c.call('Page.navigate',{'url':'http://127.0.0.1:8765/'+filename})
    for _ in range(200):
     if c.evaluate("document.readyState==='complete'&&typeof veliosInitialDark!=='undefined'"):break
     time.sleep(.1)
    state=c.evaluate("({dark:document.body.classList.contains('dark-mode'),bg:getComputedStyle(document.body).backgroundColor,app:typeof loadThemeSettings})")
    check('theme before app script '+filename+' '+str(dark),state['dark']==dark and state['app']=='undefined' and (state['bg']=='rgb(0, 0, 0)' if dark else state['bg']!='rgb(0, 0, 0)'),state)
  (root/'docs/design-review/fixed-menu.json').write_text(json.dumps(checks,indent=2)+'\n')
  print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
