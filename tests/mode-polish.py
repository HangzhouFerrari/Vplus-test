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
  c.evaluate("localStorage.setItem('sd_onboard','{\"set\":true,\"stampen\":true,\"flashcards\":true,\"overhoren\":true}');document.getElementById('onboard-overlay')?.remove();setAccessibilityPreference('reducedMotion',false);startMode('flashcards');fcHardReset()");time.sleep(.6)
  check('flashcard has no shadow',c.evaluate("getComputedStyle(document.querySelector('.fc-face')).boxShadow==='none'"))
  check('old known label removed',c.evaluate("!document.getElementById('fc-known-stat')&&!document.querySelector('.fc-wrap').textContent.includes('gekend')"))
  def center(selector):
   return c.evaluate("(()=>{const r=document.querySelector('"+selector+"').getBoundingClientRect();return {middle:r.y+r.height/2,viewport:innerHeight/2}})()")
  pos=center('#fc-stage');check('flashcard itself centered',abs(pos['middle']-pos['viewport'])<2,pos)
  c.evaluate('fcMark(true)');time.sleep(.6)
  check('good counter updates',c.evaluate("document.getElementById('fc-score-correct').textContent==='1'&&document.getElementById('fc-score-wrong').textContent==='0'"))
  c.evaluate('fcUndoLastAction()');time.sleep(.1)
  check('undo restores counters',c.evaluate("document.getElementById('fc-score-correct').textContent==='0'"))
  c.evaluate('fcMark(false)');time.sleep(.6)
  check('wrong counter updates',c.evaluate("document.getElementById('fc-score-wrong').textContent==='1'"))
  c.evaluate('saveFCProgress();FC._active=false;renderFlashcards()');time.sleep(.2)
  check('counters persist when resuming',c.evaluate("document.getElementById('fc-score-correct').textContent==='0'&&document.getElementById('fc-score-wrong').textContent==='1'"))
  (root/'docs/design-review/flashcards-centered.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  c.evaluate("startMode('stampen');ST.itype='open';ST.copyCorrect=false;ST.streak=0;stRenderQ()");time.sleep(.4)
  pos=center('.st-study-card');check('study card itself centered',abs(pos['middle']-pos['viewport'])<2,pos)
  c.evaluate("SET.vak='Frans';stRenderQ()");time.sleep(.25)
  c.evaluate("document.getElementById('st-inp').value=ST._currentA;stCheckOpen();window.answerVersion=stQuestionVersion")
  time.sleep(.6);check('correct feedback stays for first part of second',c.evaluate('stQuestionVersion===window.answerVersion'))
  time.sleep(.6);check('correct answer advances after one second',c.evaluate('stQuestionVersion===window.answerVersion+1'))
  c.evaluate("document.getElementById('st-inp').value=ST._currentA;stCheckOpen();stNext();window.manualVersion=stQuestionVersion")
  time.sleep(1.2);check('manual next cancels delayed advance',c.evaluate('stQuestionVersion===window.manualVersion'))
  c.evaluate("document.getElementById('st-inp').value='ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';stCheckOpen();window.wrongVersion=stQuestionVersion")
  time.sleep(1.2);check('wrong answer does not auto advance',c.evaluate('stQuestionVersion===window.wrongVersion'))
  c.evaluate('stNext();ST.itype="mc";ST.streak=0;stRenderQ();window.mcVersion=stQuestionVersion;stPickMC(ST._mcOptions.findIndex(o=>o.value===ST._currentA),ST._currentA,ST._currentA)')
  time.sleep(1.2);check('correct multiple choice auto advances',c.evaluate('stQuestionVersion===window.mcVersion+1'))
  c.evaluate("ST.itype='open';ST.streak=0;stRenderQ();document.getElementById('st-inp').value=ST._currentA;stCheckOpen();backToSet()")
  time.sleep(1.2);check('leaving mode cancels advance',c.evaluate("currentMode==='home'&&!!document.querySelector('.set-detail-title')"))
  c.evaluate("startMode('overhoren')");time.sleep(.4)
  check('exam excluded from focal centering',c.evaluate("!document.getElementById('app').classList.contains('focus-card-mode')"))
  c.evaluate("startMode('stampen');ST.itype='open';stRenderQ()")
  for width in [390,1363]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':844 if width==390 else 936,'deviceScaleFactor':1,'mobile':False});time.sleep(.4)
   check('centered content fits '+str(width),c.evaluate("document.documentElement.scrollWidth<=innerWidth"))
   pos=center('.st-study-card');check('study focal center '+str(width),abs(pos['middle']-pos['viewport'])<2,pos)
   (root/('docs/design-review/study-centered-'+str(width)+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  check('voice removed entirely',c.evaluate("!document.querySelector('.st-speak')&&typeof stSpeak==='undefined'&&!window.VeliosSpeech&&!document.querySelector('[name=velios-tts-endpoint]')"))
  check('close matches skip button style',c.evaluate("(()=>{let a=getComputedStyle(document.querySelector('.mode-close-btn')),b=getComputedStyle(document.getElementById('st-skip-btn'));return ['backgroundColor','borderRadius','borderColor','fontSize','padding'].every(k=>a[k]===b[k])})()"))
  c.evaluate("document.querySelector('.st-star-btn').click()");time.sleep(.25)
  if not c.evaluate("document.querySelector('.st-star-btn').classList.contains('starred')"):c.evaluate("document.querySelector('.st-star-btn').click()");time.sleep(.25)
  check('active star filled white',c.evaluate("getComputedStyle(document.querySelector('.st-star-btn svg')).fill==='rgb(255, 255, 255)'"))
  check('active star uses accent fill',c.evaluate("(()=>{let b=document.querySelector('.st-star-btn'),p=document.createElement('div');p.style.background='var(--action-fill)';document.body.append(p);let ok=getComputedStyle(b).backgroundColor===getComputedStyle(p).backgroundColor;p.remove();return ok})()"))
  c.evaluate("document.querySelector('.mode-close-btn').click()");time.sleep(.4)
  check('close returns to set',c.evaluate("currentMode==='home'"))
  for width in [360,390,750]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':844,'deviceScaleFactor':1,'mobile':False})
   c.evaluate("window.scrollTo(0,0)");time.sleep(.4)
   check('title hidden at top '+str(width),c.evaluate("!document.querySelector('.nav-set-title').classList.contains('is-visible')"))
   c.evaluate("window.scrollTo(0,600)");time.sleep(.6)
   check('mobile title below logo and menu '+str(width),c.evaluate("(()=>{const t=document.querySelector('.nav-set-title'),r=t.getBoundingClientRect(),l=document.querySelector('.nav-logo').getBoundingClientRect(),m=document.querySelector('.set-menu-trigger-wrap').getBoundingClientRect();return t.classList.contains('is-visible')&&r.top>=l.bottom&&r.top>=m.bottom&&r.height>0&&document.documentElement.scrollWidth<=innerWidth})()"))
   if width==390:(root/'docs/design-review/mobile-header-title.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  for mode in ['flashcards','stampen','overhoren']:
   c.evaluate("startMode('"+mode+"')");time.sleep(.4)
   check('close button and hidden header '+mode,c.evaluate("!!document.querySelector('.mode-close-btn svg')&&document.querySelector('.mode-close-btn').textContent.trim()==='Sluiten'&&document.querySelector('#app > nav').getBoundingClientRect().bottom<=0"))
   c.evaluate("document.querySelector('.mode-close-btn').click()");time.sleep(.3)
  c.evaluate("backToSet();setAllStars(true)")
  check('bulk star marks entire set',c.evaluate("getStarredTerms(getSetStorageId()).length===SET.terms.length"))
  c.evaluate("starModeActive=true;saveStarMode();setAllStars(false)")
  check('bulk clear disables empty star filter',c.evaluate("getStarredTerms(getSetStorageId()).length===0&&!starModeActive&&localStorage.getItem(getStarModeKey())==='false'"))
  c.evaluate("document.body.classList.add('dark-mode');toggleDD('set-menu')");time.sleep(.4)
  check('menu black in dark mode',c.evaluate("getComputedStyle(document.getElementById('set-menu')).backgroundColor==='rgb(0, 0, 0)'"))
  check('grouped button corners',c.evaluate("(()=>{let b=document.querySelectorAll('#set-menu .button-group')[1].querySelectorAll('button');return getComputedStyle(b[0]).borderTopLeftRadius==='22px'&&getComputedStyle(b[0]).borderBottomLeftRadius==='6px'&&getComputedStyle(b[1]).borderBottomLeftRadius==='22px'})()"))
  c.evaluate("closeDD('set-menu')")
  c.call('Emulation.setTouchEmulationEnabled',{'enabled':True})
  for width,height in [(390,844),(360,640),(844,390),(390,360)]:
   c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':False})
   for mode in ['flashcards','stampen','overhoren']:
    c.evaluate("startMode('"+mode+"')");time.sleep(.55)
    if mode=='stampen':c.evaluate("ST.itype='open';stRenderQ()");time.sleep(.2)
    c.evaluate("window.scrollTo(0,500)")
    check('mode locked and fits '+mode+' '+str((width,height)),c.evaluate("(()=>{let m=document.querySelector('#main-screen'),w=m.querySelector('.fc-wrap,.st-wrap').getBoundingClientRect(),b=m.querySelector('.mode-close-btn').getBoundingClientRect();return scrollY===0&&w.top>=b.bottom+15&&w.bottom<=innerHeight-10&&w.left>=0&&w.right<=innerWidth})()"))
    if mode=='flashcards':
     c.evaluate("fcFlip()")
     check('inactive face content immediately hidden',c.evaluate("[...document.querySelectorAll('#fc-inner .fc-face[aria-hidden=true] > *')].every(e=>getComputedStyle(e).visibility==='hidden')"))
     if width==390 and height==844:(root/'docs/design-review/flashcard-mobile-fit.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
    if mode=='stampen':check('input avoids iOS focus zoom',c.evaluate("parseFloat(getComputedStyle(document.getElementById('st-inp')).fontSize)>=16"))
    if mode=='overhoren':
     c.evaluate("OH.itype='open';ohBuild();ohOpenInput(0,'test');document.getElementById('oh-open-0').value='test';ohChangePage(1,false);ohChangePage(-1,false)")
     check('exam page retains answer',c.evaluate("OH.answers[0].chosen==='test'&&document.getElementById('oh-open-0').value==='test'&&document.querySelectorAll('.oh-question-card:not([hidden])').length===1"))
     c.evaluate("ohSubmit();ohChangePage(1,true)")
     check('exam review paginates',c.evaluate("document.querySelectorAll('.exam-review-item:not([hidden])').length===1"))
  c.evaluate("backToSet()")
  check('scroll restored on exit',c.evaluate("!document.documentElement.classList.contains('study-active')"))
  (root/'docs/design-review/mode-polish.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
